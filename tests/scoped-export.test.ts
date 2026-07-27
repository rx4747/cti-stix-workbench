import { describe, expect, it } from "vitest";

import {
  exportCanvasGraph,
  exportScopedGraph,
  type ScopedGraphHost,
  validateCanvasGraph,
  validateScopedGraph,
} from "../src/adapters/obsidian/scoped-export";
import { validateBundleSchema } from "../src/core/bundle-validator";
import type {
  PersistedRelationshipIdentity,
  UntrustedNoteInput,
} from "../src/core/types";
import { DEFAULT_SETTINGS } from "../src/settings";

const CREATED = "2026-07-27T10:00:00.000Z";

class FakeScopedHost implements ScopedGraphHost {
  readonly notes = new Map<string, UntrustedNoteInput>();
  readonly textFiles = new Map<string, string>();
  readonly files = new Map<string, string>();
  readonly persistedIds: Array<{ path: string; id: string }> = [];
  relationships: Record<string, PersistedRelationshipIdentity> = {};

  async readNote(path: string): Promise<UntrustedNoteInput | undefined> {
    return this.notes.get(path);
  }

  async readTextFile(path: string): Promise<string | undefined> {
    return this.textFiles.get(path);
  }

  listMarkdownPaths(folderPath?: string): readonly string[] {
    const prefix = folderPath === undefined ? "" : `${folderPath}/`;
    return [...this.notes.keys()].filter(
      (path) => prefix === "" || path.startsWith(prefix),
    );
  }

  async persistStixId(path: string, id: string): Promise<void> {
    this.persistedIds.push({ path, id });
  }

  async loadRelationshipIdentities(): Promise<
    Readonly<Record<string, PersistedRelationshipIdentity>>
  > {
    return { ...this.relationships };
  }

  async saveRelationshipIdentities(
    identities: Readonly<Record<string, PersistedRelationshipIdentity>>,
  ): Promise<void> {
    this.relationships = { ...identities };
  }

  async ensureFolder(): Promise<void> {}

  exists(path: string): boolean {
    return this.files.has(path);
  }

  async createFile(path: string, content: string): Promise<void> {
    this.files.set(path, content);
  }
}

function fixtureHost(): FakeScopedHost {
  const host = new FakeScopedHost();
  host.notes.set("Objects/Actor.md", {
    path: "Objects/Actor.md",
    basename: "Actor",
    frontmatter: {
      stix_type: "threat-actor",
      stix_id: "threat-actor--50000000-0000-4000-8000-000000000001",
      spec_version: "2.1",
      created: CREATED,
      modified: CREATED,
      name: "Fictional actor",
    },
    markdown: "## Relationships\n\n- stix:uses [[Malware]]",
    links: [{ raw: "Malware", targetPath: "Objects/Malware.md" }],
  });
  host.notes.set("Objects/Malware.md", {
    path: "Objects/Malware.md",
    basename: "Malware",
    frontmatter: {
      stix_type: "malware",
      stix_id: "malware--50000000-0000-4000-8000-000000000002",
      spec_version: "2.1",
      created: CREATED,
      modified: CREATED,
      is_family: false,
      name: "Fictional sample",
    },
    markdown: "",
    links: [],
  });
  host.notes.set("Objects/Ordinary.md", {
    path: "Objects/Ordinary.md",
    basename: "Ordinary",
    frontmatter: { tags: ["context"] },
    markdown: "Not a STIX note.",
    links: [],
  });
  host.textFiles.set(
    "Canvases/Graph.canvas",
    JSON.stringify({
      nodes: [
        { id: "actor", type: "file", file: "Objects/Actor.md" },
        { id: "malware", type: "file", file: "Objects/Malware.md" },
      ],
      edges: [
        {
          id: "edge",
          fromNode: "actor",
          toNode: "malware",
          label: "stix:uses",
        },
      ],
    }),
  );
  return host;
}

const dependencies = {
  now: () => new Date("2026-07-27T12:00:00.000Z"),
  randomUUID: () => "50000000-0000-4000-8000-000000000003",
  validateBundle: validateBundleSchema,
};

describe("Canvas, folder, and vault scopes", () => {
  it("deduplicates the same explicit Markdown and typed Canvas relationship", async () => {
    const result = await validateCanvasGraph(
      fixtureHost(),
      "Canvases/Graph.canvas",
      DEFAULT_SETTINGS,
      dependencies,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(
      result.bundle.objects.filter((object) => object.type === "relationship"),
    ).toHaveLength(1);
    expect(result.objectCount).toBe(3);
  });

  it("skips non-STIX notes in folder and vault scopes", async () => {
    const host = fixtureHost();
    const result = await validateScopedGraph(
      host,
      host.listMarkdownPaths("Objects"),
      [],
      DEFAULT_SETTINGS,
      dependencies,
    );

    expect(result.ok).toBe(true);
    expect(result.skippedCount).toBe(1);
  });

  it("writes collision-safe Canvas and whole-vault exports only after validation", async () => {
    const host = fixtureHost();
    const canvas = await exportCanvasGraph(
      host,
      "Canvases/Graph.canvas",
      DEFAULT_SETTINGS,
      dependencies,
    );
    const vault = await exportScopedGraph(
      host,
      host.listMarkdownPaths(),
      [],
      DEFAULT_SETTINGS,
      dependencies,
    );

    expect(canvas.ok).toBe(true);
    expect(vault.ok).toBe(true);
    if (canvas.ok && vault.ok) {
      expect(canvas.outputPath).not.toBe(vault.outputPath);
    }
    expect(host.files).toHaveLength(2);
  });

  it("cancels before persisting identities or writing a partial Bundle", async () => {
    const host = fixtureHost();
    const controller = new AbortController();
    controller.abort();

    await expect(
      exportScopedGraph(
        host,
        host.listMarkdownPaths(),
        [],
        DEFAULT_SETTINGS,
        dependencies,
        [],
        { signal: controller.signal },
      ),
    ).rejects.toThrow("cancelled before any Bundle was written");
    expect(host.persistedIds).toEqual([]);
    expect(host.files).toHaveLength(0);
  });

  it("honors cancellation raised during final validation before committing", async () => {
    const host = fixtureHost();
    const controller = new AbortController();

    await expect(
      exportScopedGraph(
        host,
        host.listMarkdownPaths(),
        [],
        DEFAULT_SETTINGS,
        {
          ...dependencies,
          validateBundle: (bundle, paths, mode) => {
            controller.abort();
            return validateBundleSchema(bundle, paths, mode);
          },
        },
        [],
        { signal: controller.signal },
      ),
    ).rejects.toThrow("cancelled before any Bundle was written");
    expect(host.persistedIds).toEqual([]);
    expect(host.files).toHaveLength(0);
  });
});
