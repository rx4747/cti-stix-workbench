import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { parseCanvas } from "../src/adapters/canvas/parser";
import { DIAGNOSTIC_CODES } from "../src/core/diagnostics";

describe("Canvas parser", () => {
  it("collects Markdown nodes and directed typed edges", async () => {
    const path = "tests/fixtures/example-vault/Canvases/Example Investigation.canvas";
    const result = parseCanvas(await readFile(path, "utf8"), path);

    expect(result.diagnostics).toEqual([]);
    expect(result.notePaths).toHaveLength(6);
    expect(result.relationships).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceNotePath: "03 STIX Objects/SDOs/Frost Lantern Indicator.md",
          relationshipType: "indicates",
          targetNotePath: "03 STIX Objects/SDOs/Frost Lantern.md",
        }),
      ]),
    );
  });

  it("can retain the Canvas scope while ignoring typed edges", () => {
    const result = parseCanvas(
      JSON.stringify({
        nodes: [
          { id: "a", type: "file", file: "Objects/A.md" },
          { id: "b", type: "file", file: "Objects/B.md" },
        ],
        edges: [{ fromNode: "a", toNode: "b", label: "stix:uses" }],
      }),
      "Graph.canvas",
      false,
    );

    expect(result.notePaths).toEqual(["Objects/A.md", "Objects/B.md"]);
    expect(result.relationships).toEqual([]);
  });

  it("reports invalid JSON, typed labels, and typed edge endpoints", () => {
    expect(parseCanvas("{", "Broken.canvas").diagnostics[0]?.code).toBe(
      DIAGNOSTIC_CODES.canvasInvalid,
    );
    const result = parseCanvas(
      JSON.stringify({
        nodes: [{ id: "a", type: "file", file: "A.md" }],
        edges: [
          { fromNode: "a", toNode: "missing", label: "stix:uses" },
          { fromNode: "a", toNode: "a", label: "stix:Not Valid" },
        ],
      }),
      "Broken.canvas",
    );
    expect(result.diagnostics).toHaveLength(2);
    expect(
      result.diagnostics.every((item) => item.code === DIAGNOSTIC_CODES.canvasInvalid),
    ).toBe(true);
  });

  it("includes generated Relationship notes without duplicating their edges", () => {
    const result = parseCanvas(
      JSON.stringify({
        nodes: [
          { id: "a", type: "file", file: "Objects/A.md" },
          { id: "b", type: "file", file: "Objects/B.md" },
        ],
        edges: [
          {
            id: "relationship",
            fromNode: "a",
            toNode: "b",
            label: "stix:uses",
            ctiStixRelationshipNote: "Relationships/A uses B.md",
          },
        ],
      }),
      "Generated.canvas",
    );

    expect(result.diagnostics).toEqual([]);
    expect(result.notePaths).toEqual([
      "Objects/A.md",
      "Objects/B.md",
      "Relationships/A uses B.md",
    ]);
    expect(result.relationships).toEqual([]);
  });
});
