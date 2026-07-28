import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { parseCanvas } from "../src/adapters/canvas/parser";
import {
  generateCanvasDocument,
  nextAvailableCanvasPath,
} from "../src/canvas/generator";
import { parseStixBundleJson, planBundleImport } from "../src/import/bundle-import";
import { buildStixViewerModel } from "../src/viewer/model";

const ACTOR_ID = "threat-actor--11111111-1111-4111-8111-111111111111";
const MALWARE_ID = "malware--22222222-2222-4222-8222-222222222222";
const RELATIONSHIP_ID = "relationship--33333333-3333-4333-8333-333333333333";

describe("Canvas generator", () => {
  it("creates deterministic file nodes and relationship-note-backed edges", () => {
    const notePaths = new Map([
      [ACTOR_ID, "Objects/Actor.md"],
      [MALWARE_ID, "Objects/Malware.md"],
      [RELATIONSHIP_ID, "Relationships/Actor uses malware.md"],
    ]);
    const model = buildStixViewerModel(
      {
        type: "bundle",
        id: "bundle--44444444-4444-4444-8444-444444444444",
        objects: [
          { type: "threat-actor", id: ACTOR_ID, name: "Actor" },
          { type: "malware", id: MALWARE_ID, name: "Malware" },
          {
            type: "relationship",
            id: RELATIONSHIP_ID,
            relationship_type: "uses",
            source_ref: ACTOR_ID,
            target_ref: MALWARE_ID,
          },
        ],
      },
      notePaths,
    );

    const document = generateCanvasDocument(model);

    expect(document.nodes).toHaveLength(2);
    expect(document.nodes.map((node) => node.file).sort()).toEqual([
      "Objects/Actor.md",
      "Objects/Malware.md",
    ]);
    expect(document.edges).toEqual([
      expect.objectContaining({
        label: "stix:uses",
        ctiStixRelationshipNote: "Relationships/Actor uses malware.md",
      }),
    ]);
    expect(generateCanvasDocument(model)).toEqual(document);
  });

  it("uses collision-safe Canvas paths", () => {
    expect(nextAvailableCanvasPath("APT1", () => false)).toBe(
      "Canvases/APT1 STIX.canvas",
    );
    expect(
      nextAvailableCanvasPath("APT1", (path) => path.endsWith("STIX.canvas")),
    ).toBe("Canvases/APT1 STIX-2.canvas");
  });

  it("keeps every official APT1 relationship note in generated Canvas scope", async () => {
    const source = await readFile(
      new URL("fixtures/oasis/apt1.json", import.meta.url),
      "utf8",
    );
    const bundle = parseStixBundleJson(source);
    const plan = planBundleImport(bundle);
    const notePaths = new Map(
      plan.notes.flatMap((note) =>
        typeof note.object.id === "string"
          ? [
              [
                note.object.id,
                `Examples/OASIS APT1/Generated Notes/${note.relativePath}`,
              ] as const,
            ]
          : [],
      ),
    );

    const document = generateCanvasDocument(buildStixViewerModel(bundle, notePaths));
    const parsed = parseCanvas(
      JSON.stringify(document),
      "Examples/OASIS APT1/APT1 Investigation.canvas",
    );

    expect(document.nodes).toHaveLength(46);
    expect(document.edges).toHaveLength(30);
    expect(parsed.notePaths).toHaveLength(76);
    expect(new Set(parsed.notePaths)).toHaveLength(76);
    expect(parsed.relationships).toEqual([]);
    expect(parsed.diagnostics).toEqual([]);
  });
});
