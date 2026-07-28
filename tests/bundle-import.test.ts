import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { parseMarkdownNote } from "../src/adapters/markdown/parser";
import { validateBundleSchema } from "../src/core/bundle-validator";
import { mapGraphToBundle } from "../src/core/graph-mapper";
import type { JsonValue, ResolvedLink, StixBundle } from "../src/core/types";
import { parseStixBundleJson, planBundleImport } from "../src/import/bundle-import";

function collectLinks(
  value: unknown,
  pathByLink: ReadonlyMap<string, string>,
  result: ResolvedLink[],
): void {
  if (typeof value === "string") {
    const target = /^\[\[([^\]]+)\]\]$/u.exec(value)?.[1];
    const targetPath = target === undefined ? undefined : pathByLink.get(target);
    if (target !== undefined && targetPath !== undefined) {
      result.push({ raw: target, targetPath });
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectLinks(item, pathByLink, result);
  } else if (value !== null && typeof value === "object") {
    for (const nested of Object.values(value)) collectLinks(nested, pathByLink, result);
  }
}

async function apt1Bundle(): Promise<StixBundle> {
  const source = await readFile(
    new URL("fixtures/oasis/apt1.json", import.meta.url),
    "utf8",
  );
  return parseStixBundleJson(source);
}

function normalizeProse(object: Readonly<Record<string, JsonValue>>): unknown {
  return Object.fromEntries(
    Object.entries(object).map(([key, value]) => [
      key,
      ["description", "content", "explanation"].includes(key) &&
      typeof value === "string"
        ? value.trim()
        : value,
    ]),
  );
}

describe("STIX Bundle import", () => {
  it("validates and plans the official OASIS APT1 example", async () => {
    const bundle = await apt1Bundle();
    const diagnostics = validateBundleSchema(bundle);
    const plan = planBundleImport(bundle);

    expect(diagnostics.filter((item) => item.severity === "error")).toEqual([]);
    expect(plan.objectCount).toBe(76);
    expect(plan.countsByType).toMatchObject({
      indicator: 12,
      relationship: 30,
      report: 1,
      "threat-actor": 5,
    });
    expect(bundle.objects.every((object) => object.created_by_ref === undefined)).toBe(
      true,
    );
    expect(
      plan.notes.some((note) => Array.isArray(note.frontmatter.kill_chain_phases)),
    ).toBe(true);
    expect(
      plan.notes.filter((note) => note.object.type === "relationship"),
    ).toHaveLength(30);
  });

  it("round-trips every APT1 object through typed notes with semantic fidelity", async () => {
    const bundle = await apt1Bundle();
    const plan = planBundleImport(bundle);
    const pathByLink = new Map(
      plan.notes.map((note) => [
        note.relativePath.replace(/\.md$/u, ""),
        note.relativePath,
      ]),
    );
    const drafts = plan.notes.map((note) => {
      const links: ResolvedLink[] = [];
      collectLinks(note.frontmatter, pathByLink, links);
      const parsed = parseMarkdownNote({
        path: note.relativePath,
        basename: note.relativePath.split("/").at(-1)?.replace(/\.md$/u, ""),
        frontmatter: note.frontmatter,
        markdown: note.markdownBody,
        links,
      });
      expect(parsed.diagnostics, note.relativePath).toEqual([]);
      if (parsed.draft === undefined)
        throw new Error(`No draft for ${note.relativePath}`);
      return parsed.draft;
    });

    const mapped = await mapGraphToBundle({ bundleId: bundle.id, drafts });
    expect(mapped.ok).toBe(true);
    if (!mapped.ok) return;
    const actual = new Map(mapped.bundle.objects.map((object) => [object.id, object]));
    expect(actual.size).toBe(bundle.objects.length);
    for (const object of bundle.objects) {
      expect(normalizeProse(actual.get(object.id) ?? {}), object.id).toEqual(
        normalizeProse(object),
      );
    }
  });

  it("keeps fractional seconds distinct in imported version paths", () => {
    const id = "indicator--11111111-1111-4111-8111-111111111111";
    const plan = planBundleImport({
      type: "bundle",
      id: "bundle--22222222-2222-4222-8222-222222222222",
      objects: [
        { type: "indicator", id, modified: "2026-07-28T10:00:00.001Z" },
        { type: "indicator", id, modified: "2026-07-28T10:00:00.002Z" },
      ],
    });

    expect(new Set(plan.notes.map((note) => note.relativePath)).size).toBe(2);
    expect(plan.notes.map((note) => note.relativePath)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("20260728100000001"),
        expect.stringContaining("20260728100000002"),
      ]),
    );
  });

  it("keeps paths unique when IDs share the same short prefix", () => {
    const objects = [1, 2, 3].map((suffix) => ({
      type: "relationship",
      id: `relationship--60000000-0000-4000-8000-00000000000${suffix}`,
      modified: "2026-07-28T15:00:00.000Z",
    }));

    const plan = planBundleImport({
      type: "bundle",
      id: "bundle--70000000-0000-4000-8000-000000000001",
      objects,
    });

    expect(new Set(plan.notes.map((note) => note.relativePath)).size).toBe(3);
    expect(plan.notes.map((note) => note.relativePath)).toEqual(
      objects.map((object) =>
        expect.stringContaining(object.id.split("--")[1]?.replaceAll("-", "") ?? ""),
      ),
    );
  });
});
