import { performance } from "node:perf_hooks";

import { describe, expect, it } from "vitest";

import {
  type ScopedGraphHost,
  validateScopedGraph,
} from "../src/adapters/obsidian/scoped-export";
import type {
  PersistedRelationshipIdentity,
  UntrustedNoteInput,
} from "../src/core/types";
import { DEFAULT_SETTINGS } from "../src/settings";

class LargeVaultHost implements ScopedGraphHost {
  readonly notes = new Map<string, UntrustedNoteInput>();

  async readNote(path: string): Promise<UntrustedNoteInput | undefined> {
    return this.notes.get(path);
  }

  async readTextFile(): Promise<string | undefined> {
    return undefined;
  }

  listMarkdownPaths(): readonly string[] {
    return [...this.notes.keys()];
  }

  async persistStixId(): Promise<void> {}

  async loadRelationshipIdentities(): Promise<
    Readonly<Record<string, PersistedRelationshipIdentity>>
  > {
    return {};
  }

  async saveRelationshipIdentities(): Promise<void> {}
  async ensureFolder(): Promise<void> {}
  exists(): boolean {
    return false;
  }
  async createFile(): Promise<void> {}
}

describe("large-vault scope budget", () => {
  it("maps 1,000 typed notes within the documented desktop budget", async () => {
    const host = new LargeVaultHost();
    for (let index = 0; index < 1_000; index += 1) {
      const suffix = index.toString(16).padStart(12, "0");
      const path = `Objects/Identity ${index}.md`;
      host.notes.set(path, {
        path,
        basename: `Identity ${index}`,
        frontmatter: {
          stix_type: "identity",
          stix_id: `identity--60000000-0000-4000-8000-${suffix}`,
          spec_version: "2.1",
          created: "2026-07-27T10:00:00.000Z",
          modified: "2026-07-27T10:00:00.000Z",
          name: `Fictional identity ${index}`,
          identity_class: "organization",
        },
        markdown: "",
        links: [],
      });
    }

    const start = performance.now();
    const result = await validateScopedGraph(
      host,
      host.listMarkdownPaths(),
      [],
      DEFAULT_SETTINGS,
      {
        randomUUID: () => "60000000-0000-4000-8000-000000001001",
        validateBundle: () => [],
      },
    );
    const elapsed = performance.now() - start;

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.objectCount).toBe(1_000);
    expect(elapsed).toBeLessThan(10_000);
  }, 15_000);
});
