import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  exportActiveGraph,
  type ActiveGraphHost,
} from "../src/adapters/obsidian/active-graph";
import type {
  PersistedRelationshipIdentity,
  UntrustedNoteInput,
} from "../src/core/types";
import { DEFAULT_SETTINGS } from "../src/settings";

const repositoryRoot = fileURLToPath(
  new URL("./fixtures/example-vault/", import.meta.url),
);
const rootNotePath = "02 Investigations/Example Investigation.md";
const exampleNotePaths = [
  rootNotePath,
  "03 STIX Objects/SDOs/Fictional CTI Team.md",
  "03 STIX Objects/SDOs/Frost Lantern.md",
  "03 STIX Objects/SDOs/Frost Lantern Indicator.md",
  "03 STIX Objects/SCOs/Signal Lantern Domain.md",
  "03 STIX Objects/SCOs/Reserved Address.md",
] as const;

function parseScalar(value: string): unknown {
  const trimmed = value.trim();
  if (trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
    return JSON.parse(trimmed);
  }
  if (trimmed === "true" || trimmed === "false") {
    return trimmed === "true";
  }
  if (/^-?\d+(?:\.\d+)?$/u.test(trimmed)) {
    return Number(trimmed);
  }
  return trimmed;
}

function parseFixtureFrontmatter(markdown: string): Record<string, unknown> {
  const block = /^---\r?\n([\s\S]*?)\r?\n---/u.exec(markdown)?.[1];
  if (block === undefined) {
    throw new Error("Example note is missing YAML frontmatter.");
  }
  const lines = block.split(/\r?\n/u);
  const frontmatter: Record<string, unknown> = {};
  for (let index = 0; index < lines.length; index += 1) {
    const match = /^([a-z][a-z0-9_]*):(?:\s*(.*))?$/u.exec(
      lines[index] ?? "",
    );
    if (match?.[1] === undefined) {
      continue;
    }
    const key = match[1];
    const inline = match[2] ?? "";
    if (inline !== "") {
      frontmatter[key] = parseScalar(inline);
      continue;
    }
    const items: unknown[] = [];
    while (/^\s+-\s+/u.test(lines[index + 1] ?? "")) {
      index += 1;
      items.push(
        parseScalar((lines[index] ?? "").replace(/^\s+-\s+/u, "")),
      );
    }
    if (items.length > 0) {
      frontmatter[key] = items;
    }
  }
  return frontmatter;
}

class ExampleVaultHost implements ActiveGraphHost {
  readonly notes = new Map<string, UntrustedNoteInput>();
  readonly files = new Map<string, string>();
  relationshipIdentities: Record<string, PersistedRelationshipIdentity> = {};

  async load(): Promise<void> {
    const contents = new Map<string, string>();
    for (const notePath of exampleNotePaths) {
      contents.set(
        notePath,
        await readFile(path.join(repositoryRoot, notePath), "utf8"),
      );
    }
    const pathsByBasename = new Map(
      exampleNotePaths.map((notePath) => [
        path.basename(notePath, ".md"),
        notePath,
      ]),
    );
    for (const [notePath, markdown] of contents) {
      const links = [...markdown.matchAll(/\[\[([^\]]+)\]\]/gu)].flatMap(
        (match) => {
          const raw = match[1]?.split("|", 1)[0]?.split("#", 1)[0]?.trim();
          if (raw === undefined || raw === "") {
            return [];
          }
          const targetPath = pathsByBasename.get(raw);
          return [{
            raw,
            ...(targetPath === undefined ? {} : { targetPath }),
          }];
        },
      );
      this.notes.set(notePath, {
        path: notePath,
        basename: path.basename(notePath, ".md"),
        frontmatter: parseFixtureFrontmatter(markdown),
        markdown,
        links,
      });
    }
  }

  async readNote(notePath: string): Promise<UntrustedNoteInput | undefined> {
    return this.notes.get(notePath);
  }

  async persistStixId(notePath: string, id: string): Promise<void> {
    const note = this.notes.get(notePath);
    if (note === undefined) {
      throw new Error(`Missing example note: ${notePath}`);
    }
    this.notes.set(notePath, {
      ...note,
      frontmatter: {
        ...(note.frontmatter as Record<string, unknown>),
        stix_id: id,
      },
    });
  }

  async loadRelationshipIdentities(): Promise<
    Readonly<Record<string, PersistedRelationshipIdentity>>
  > {
    return { ...this.relationshipIdentities };
  }

  async saveRelationshipIdentities(
    identities: Readonly<Record<string, PersistedRelationshipIdentity>>,
  ): Promise<void> {
    this.relationshipIdentities = { ...identities };
  }

  async ensureFolder(): Promise<void> {}

  exists(outputPath: string): boolean {
    return this.files.has(outputPath);
  }

  async createFile(outputPath: string, content: string): Promise<void> {
    this.files.set(outputPath, content);
  }
}

describe("fictional alpha investigation", () => {
  it("exports the committed example through the active-graph workflow", async () => {
    const host = new ExampleVaultHost();
    await host.load();
    const rootLinks = new Set(
      (host.notes.get(rootNotePath)?.links as Array<{ targetPath?: string }>)
        .flatMap((link) =>
          link.targetPath === undefined ? [] : [link.targetPath]
        ),
    );
    expect(rootLinks).toEqual(new Set(exampleNotePaths.slice(1)));
    for (const notePath of exampleNotePaths.slice(1)) {
      expect(host.notes.get(notePath)?.links).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ targetPath: rootNotePath }),
        ]),
      );
    }
    const randomValues = [
      "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    ];
    let randomIndex = 0;

    const result = await exportActiveGraph(
      host,
      rootNotePath,
      DEFAULT_SETTINGS,
      {
        now: () => new Date("2026-07-26T12:00:00.000Z"),
        randomUUID: () => randomValues[randomIndex++] ?? crypto.randomUUID(),
        validateBundle: () => [],
      },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    const golden = JSON.parse(
      await readFile(
        new URL("./fixtures/example/reference-bundle.json", import.meta.url),
        "utf8",
      ),
    );
    expect(result.bundle).toEqual(golden);
    expect(JSON.parse(host.files.get(result.outputPath) ?? "")).toEqual(golden);
    expect(result.warnings).toEqual([]);
  });

  it("uses only committed STIX file nodes and directed typed Canvas edges", async () => {
    const canvas = JSON.parse(
      await readFile(
        path.join(repositoryRoot, "Canvases/Example Investigation.canvas"),
        "utf8",
      ),
    ) as {
      nodes: Array<{ id: string; type: string; file?: string }>;
      edges: Array<{
        fromNode: string;
        toNode: string;
        toEnd?: string;
        label?: string;
      }>;
    };

    const fileNodes = canvas.nodes.filter((node) => node.type === "file");
    expect(fileNodes.map((node) => node.file).sort()).toEqual(
      [...exampleNotePaths].sort(),
    );
    for (const node of fileNodes) {
      expect(node.file).toBeDefined();
      await expect(
        readFile(path.join(repositoryRoot, node.file ?? ""), "utf8"),
      ).resolves.toContain("stix_type:");
    }
    expect(canvas.edges).toHaveLength(3);
    for (const edge of canvas.edges) {
      expect(edge.fromNode).not.toBe(edge.toNode);
      expect(edge.toEnd ?? "arrow").toBe("arrow");
      expect(edge.label).toMatch(/^stix:[a-z][a-z0-9-]*$/u);
    }
  });

  it("contains only clearly fictional reserved indicator values", async () => {
    const markdown = (
      await Promise.all(
        exampleNotePaths.map((notePath) =>
          readFile(path.join(repositoryRoot, notePath), "utf8")
        ),
      )
    ).join("\n");

    expect(markdown).toMatch(/fictional/iu);
    expect(markdown).toContain("signal-lantern.invalid");
    expect(markdown).toContain("198.51.100.23");
    expect(
      [...markdown.matchAll(/\b(?:\d{1,3}\.){3}\d{1,3}\b/gu)]
        .map((match) => match[0])
        .filter((value, index, values) => values.indexOf(value) === index),
    ).toEqual(["198.51.100.23"]);
    expect(markdown).not.toMatch(/\b[a-z0-9-]+\.(?:com|net|org)\b/iu);
  });
});
