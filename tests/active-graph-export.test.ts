import { describe, expect, it } from "vitest";

import {
  type ActiveGraphHost,
  exportActiveGraph,
  nextAvailableExportPath,
  validateActiveGraph,
} from "../src/adapters/obsidian/active-graph";
import {
  createDiagnostic,
  DIAGNOSTIC_CODES,
  type Diagnostic,
} from "../src/core/diagnostics";
import type {
  PersistedRelationshipIdentity,
  StixBundle,
  UntrustedNoteInput,
} from "../src/core/types";
import { DEFAULT_SETTINGS } from "../src/settings";

class FakeActiveGraphHost implements ActiveGraphHost {
  readonly notes = new Map<string, UntrustedNoteInput>();
  readonly files = new Map<string, string>();
  readonly persistedIds: Array<{ path: string; id: string }> = [];
  relationshipIdentities: Record<string, PersistedRelationshipIdentity> = {};
  relationshipSaveCount = 0;

  async readNote(path: string): Promise<UntrustedNoteInput | undefined> {
    return this.notes.get(path);
  }

  async persistStixId(path: string, id: string): Promise<void> {
    const note = this.notes.get(path);
    if (note === undefined || note.frontmatter === null) {
      throw new Error(`Missing fake note ${path}.`);
    }
    const frontmatter = {
      ...(note.frontmatter as Record<string, unknown>),
      stix_id: id,
    };
    this.notes.set(path, { ...note, frontmatter });
    this.persistedIds.push({ path, id });
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
    this.relationshipSaveCount += 1;
  }

  async ensureFolder(): Promise<void> {}

  exists(path: string): boolean {
    return this.files.has(path);
  }

  async createFile(path: string, content: string): Promise<void> {
    if (this.files.has(path)) {
      throw new Error(`File exists: ${path}`);
    }
    this.files.set(path, content);
  }
}

function addReferenceInvestigation(host: FakeActiveGraphHost): void {
  host.notes.set("Objects/Indicator.md", {
    path: "Objects/Indicator.md",
    basename: "Fictional indicator",
    frontmatter: {
      stix_type: "indicator",
      spec_version: "2.1",
      created: "2026-07-26T10:00:00.000Z",
      modified: "2026-07-26T10:00:00.000Z",
      pattern: "[ipv4-addr:value = '198.51.100.3']",
      pattern_type: "stix",
      valid_from: "2026-07-26T10:00:00.000Z",
    },
    markdown: [
      "## Summary",
      "",
      "Fictional indicator using a reserved address.",
      "",
      "## Relationships",
      "",
      "- stix:based-on [[Reserved address]]",
    ].join("\n"),
    links: [
      {
        raw: "Reserved address",
        targetPath: "Objects/Reserved address.md",
      },
    ],
  });
  host.notes.set("Objects/Reserved address.md", {
    path: "Objects/Reserved address.md",
    basename: "Reserved address",
    frontmatter: {
      stix_type: "ipv4-addr",
      spec_version: "2.1",
      value: "198.51.100.3",
    },
    markdown: "",
    links: [],
  });
}

function validateTestBundle(bundle: StixBundle) {
  const diagnostics: Diagnostic[] = [];
  for (const object of bundle.objects) {
    if (object.type === "indicator" && typeof object.pattern !== "string") {
      diagnostics.push(
        createDiagnostic({
          authority: "schema",
          code: DIAGNOSTIC_CODES.schemaInvalid,
          severity: "error",
          message: "STIX schema required validation failed: pattern is required.",
          objectPath: "$/objects/0",
          field: "pattern",
          notePath: "Objects/Invalid indicator.md",
        }),
      );
    }
  }
  return diagnostics;
}

function graphDependencies(
  overrides: { now?: () => Date; randomUUID?: () => string } = {},
) {
  return {
    validateBundle: validateTestBundle,
    ...overrides,
  };
}

describe("active STIX graph validation and export", () => {
  it("validates without mutating notes, plugin state, or files", async () => {
    const host = new FakeActiveGraphHost();
    addReferenceInvestigation(host);

    const result = await validateActiveGraph(
      host,
      "Objects/Indicator.md",
      DEFAULT_SETTINGS,
      graphDependencies({
        now: () => new Date("2026-07-26T11:00:00.000Z"),
        randomUUID: () => "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      }),
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.objectCount).toBe(3);
      expect([...result.notePathById.values()]).toEqual(
        expect.arrayContaining(["Objects/Indicator.md", "Objects/Reserved address.md"]),
      );
    }
    expect(host.persistedIds).toEqual([]);
    expect(host.relationshipSaveCount).toBe(0);
    expect(host.files.size).toBe(0);
    const indicatorNote = host.notes.get("Objects/Indicator.md");
    if (indicatorNote === undefined) {
      throw new Error("Expected indicator fixture note.");
    }
    expect(
      (indicatorNote.frontmatter as Record<string, unknown>).stix_id,
    ).toBeUndefined();
  });

  it("persists generated identities once and creates stable non-overwritten exports", async () => {
    const host = new FakeActiveGraphHost();
    addReferenceInvestigation(host);
    const randomValues = [
      "11111111-1111-4111-8111-111111111111",
      "22222222-2222-4222-8222-222222222222",
      "33333333-3333-4333-8333-333333333333",
      "44444444-4444-4444-8444-444444444444",
    ];
    let randomIndex = 0;
    const dependencies = graphDependencies({
      now: () => new Date("2026-07-26T11:00:00.000Z"),
      randomUUID: () =>
        randomValues[randomIndex++] ?? "99999999-9999-4999-8999-999999999999",
    });

    const first = await exportActiveGraph(
      host,
      "Objects/Indicator.md",
      DEFAULT_SETTINGS,
      dependencies,
    );
    const persistedAfterFirst = [...host.persistedIds];
    const second = await exportActiveGraph(
      host,
      "Objects/Indicator.md",
      DEFAULT_SETTINGS,
      dependencies,
    );

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(first.outputPath).toBe("Exports/stix-bundle-20260726T110000000Z.json");
      expect(second.outputPath).toBe("Exports/stix-bundle-20260726T110000000Z-2.json");
      expect(first.bundle.objects).toEqual(second.bundle.objects);
      expect(first.bundle.id).not.toBe(second.bundle.id);
    }
    expect(persistedAfterFirst).toHaveLength(2);
    expect(host.persistedIds).toEqual(persistedAfterFirst);
    expect(host.relationshipSaveCount).toBe(1);
    expect(host.files.size).toBe(2);
  });

  it("blocks invalid Bundles before persisting IDs or writing output", async () => {
    const host = new FakeActiveGraphHost();
    host.notes.set("Objects/Invalid indicator.md", {
      path: "Objects/Invalid indicator.md",
      basename: "Invalid indicator",
      frontmatter: {
        stix_type: "indicator",
        spec_version: "2.1",
        created: "2026-07-26T10:00:00.000Z",
        modified: "2026-07-26T10:00:00.000Z",
        pattern_type: "stix",
        valid_from: "2026-07-26T10:00:00.000Z",
      },
      markdown: "",
      links: [],
    });

    const result = await exportActiveGraph(
      host,
      "Objects/Invalid indicator.md",
      DEFAULT_SETTINGS,
      graphDependencies({
        now: () => new Date("2026-07-26T11:00:00.000Z"),
        randomUUID: () => "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      }),
    );

    expect(result).toEqual({
      ok: false,
      errors: expect.arrayContaining([
        expect.objectContaining({
          code: DIAGNOSTIC_CODES.schemaInvalid,
          notePath: "Objects/Invalid indicator.md",
        }),
      ]),
      warnings: [],
    });
    expect(host.persistedIds).toEqual([]);
    expect(host.relationshipSaveCount).toBe(0);
    expect(host.files.size).toBe(0);
  });

  it("finds the first collision-free export path", () => {
    const occupied = new Set([
      "Exports/stix-bundle-20260726T110000000Z.json",
      "Exports/stix-bundle-20260726T110000000Z-2.json",
    ]);

    expect(
      nextAvailableExportPath("Exports", new Date("2026-07-26T11:00:00.000Z"), (path) =>
        occupied.has(path),
      ),
    ).toBe("Exports/stix-bundle-20260726T110000000Z-3.json");
  });
});
