import { describe, expect, it } from "vitest";

import { parseExplicitRelationships } from "../src/adapters/markdown/relationships";
import { DIAGNOSTIC_CODES } from "../src/core/diagnostics";

describe("parseExplicitRelationships", () => {
  it("recognizes only explicit typed list items", () => {
    const result = parseExplicitRelationships(
      [
        "Context: [[Fictional tool]]",
        "",
        "- [[Fictional malware]]",
        "- stix:uses [[Fictional tool]]",
        "",
        "```markdown",
        "- stix:targets [[Text inside code]]",
        "```",
        "",
        "````markdown",
        "```",
        "- stix:targets [[Text inside nested code]]",
        "```",
        "````",
      ].join("\n"),
      "Objects/Fictional actor.md",
      [
        {
          raw: "Fictional tool",
          targetPath: "Objects/Fictional tool.md",
        },
        {
          raw: "Fictional malware",
          targetPath: "Objects/Fictional malware.md",
        },
      ],
    );

    expect(result.diagnostics).toEqual([]);
    expect(result.relationships).toEqual([
      {
        sourceNotePath: "Objects/Fictional actor.md",
        relationshipType: "uses",
        targetLink: "Fictional tool",
        location: {
          line: 4,
          column: 1,
        },
      },
    ]);
  });

  it("normalizes aliases and headings only for link resolution", () => {
    const result = parseExplicitRelationships(
      "- stix:based-on [[Evidence/Telemetry#Collection window|supporting telemetry]]",
      "Notes/Assessment.md",
      [
        {
          raw: "Evidence/Telemetry#Collection window",
          targetPath: "Evidence/Telemetry.md",
        },
      ],
    );

    expect(result.diagnostics).toEqual([]);
    expect(result.relationships[0]).toMatchObject({
      relationshipType: "based-on",
      targetLink: "Evidence/Telemetry",
    });
  });

  it("diagnoses unresolved and malformed typed relationship declarations", () => {
    const result = parseExplicitRelationships(
      [
        "- stix:uses [[Missing object]]",
        "- stix: [[No type]]",
        "- stix:uses [[One]] and [[Two]]",
      ].join("\n"),
      "Objects/Actor.md",
      [],
    );

    expect(result.relationships).toHaveLength(1);
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: DIAGNOSTIC_CODES.referenceUnresolved,
        field: "target_ref",
        location: expect.objectContaining({ line: 1 }),
      }),
      expect.objectContaining({
        code: DIAGNOSTIC_CODES.relationshipInvalid,
        location: expect.objectContaining({ line: 2 }),
      }),
      expect.objectContaining({
        code: DIAGNOSTIC_CODES.relationshipInvalid,
        location: expect.objectContaining({ line: 3 }),
      }),
    ]);
  });
});
