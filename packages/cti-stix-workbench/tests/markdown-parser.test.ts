import { describe, expect, it } from "vitest";

import { parseMarkdownNote } from "../src/adapters/markdown/parser";
import { DIAGNOSTIC_CODES } from "../src/core/diagnostics";

describe("parseMarkdownNote", () => {
  it("normalizes complete nested STIX frontmatter and mapped prose", () => {
    const result = parseMarkdownNote({
      path: "Investigations/Reserved indicator.md",
      basename: "Reserved indicator",
      frontmatter: {
        stix_type: "indicator",
        stix_id: "indicator--e2e1a340-4415-4ba8-9671-f7343fbf0836",
        spec_version: "2.1",
        created: "2026-07-26T10:00:00.000Z",
        modified: "2026-07-26T10:00:00.000Z",
        pattern: "[ipv4-addr:value = '203.0.113.10']",
        pattern_type: "stix",
        valid_from: "2026-07-26T10:00:00.000Z",
        object_marking_refs: ["[[Reserved marking]]"],
        external_references: [
          {
            source_name: "Example source",
            external_id: "EX-001",
            hashes: {
              "SHA-256":
                "d2a4b37cac0a57e4c95a75e221fdfb3b6ce58b6008f40f9d4e5f70b20a2d9862",
            },
          },
        ],
        granular_markings: [
          {
            marking_ref: "[[Reserved marking]]",
            selectors: ["description"],
          },
        ],
        extensions: {
          x_example_test: {
            enabled: true,
          },
        },
        x_example_score: 7,
        cti_legacy_case_id: "CASE-001",
      },
      markdown: [
        "# Reserved indicator",
        "",
        "## Summary",
        "",
        "A fictional indicator used for parser verification.",
        "",
        "Context only: [[Reserved observation]].",
        "",
        "## Relationships",
        "",
        "- stix:indicates [[Fictional threat actor|display label]]",
      ].join("\n"),
      links: [
        {
          raw: "Fictional threat actor",
          targetPath: "Objects/Fictional threat actor.md",
        },
        {
          raw: "Reserved observation",
          targetPath: "Objects/Reserved observation.md",
        },
      ],
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.draft).toMatchObject({
      path: "Investigations/Reserved indicator.md",
      basename: "Reserved indicator",
      stixType: "indicator",
      stixId: "indicator--e2e1a340-4415-4ba8-9671-f7343fbf0836",
      properties: {
        type: "indicator",
        id: "indicator--e2e1a340-4415-4ba8-9671-f7343fbf0836",
        description:
          "A fictional indicator used for parser verification.\n\nContext only: [[Reserved observation]].",
        external_references: [
          expect.objectContaining({
            source_name: "Example source",
            external_id: "EX-001",
          }),
        ],
        granular_markings: [
          {
            marking_ref: "[[Reserved marking]]",
            selectors: ["description"],
          },
        ],
        extensions: {
          x_example_test: {
            enabled: true,
          },
        },
        x_example_score: 7,
      },
    });
    expect(result.draft).not.toHaveProperty("localMetadata");
    expect(result.draft?.properties).not.toHaveProperty("cti_legacy_case_id");
    expect(result.quarantinedKeys).toEqual(["cti_legacy_case_id"]);
    expect(result.draft?.relationships).toEqual([
      {
        sourceNotePath: "Investigations/Reserved indicator.md",
        relationshipType: "indicates",
        targetLink: "Fictional threat actor",
        location: {
          line: 11,
          column: 1,
        },
      },
    ]);
  });

  it("maps Note Content and Opinion Explanation without guessing other headings", () => {
    const note = parseMarkdownNote({
      path: "Notes/Assessment.md",
      basename: "Assessment",
      frontmatter: {
        stix_type: "note",
      },
      markdown: [
        "## Content",
        "",
        "Analytic rationale.",
        "",
        "## Analysis",
        "",
        "This heading is not an implicit STIX field.",
      ].join("\n"),
      links: [],
    });
    const opinion = parseMarkdownNote({
      path: "Opinions/Agreement.md",
      basename: "Agreement",
      frontmatter: {
        stix_type: "opinion",
      },
      markdown: "## Explanation\n\nThe cited assessment is well supported.",
      links: [],
    });

    expect(note.draft?.properties.content).toBe("Analytic rationale.");
    expect(note.draft?.properties).not.toHaveProperty("analysis");
    expect(opinion.draft?.properties.explanation).toBe(
      "The cited assessment is well supported.",
    );
  });

  it("diagnoses conflicting aliases and duplicate body mappings", () => {
    const aliases = parseMarkdownNote({
      path: "Objects/Conflicting aliases.md",
      basename: "Conflicting aliases",
      frontmatter: {
        stix_type: "indicator",
        type: "malware",
        description: "Frontmatter description.",
      },
      markdown: "## Summary\n\nBody description.",
      links: [],
    });
    const sections = parseMarkdownNote({
      path: "Objects/Duplicate summary.md",
      basename: "Duplicate summary",
      frontmatter: {
        stix_type: "indicator",
      },
      markdown: [
        "## Summary",
        "",
        "First.",
        "",
        "## Summary",
        "",
        "Second.",
      ].join("\n"),
      links: [],
    });

    expect(aliases.diagnostics).toEqual([
      expect.objectContaining({
        code: DIAGNOSTIC_CODES.fieldDuplicate,
        field: "type",
        severity: "error",
      }),
      expect.objectContaining({
        code: DIAGNOSTIC_CODES.fieldDuplicate,
        field: "description",
        severity: "error",
      }),
    ]);
    expect(sections.diagnostics).toEqual([
      expect.objectContaining({
        code: DIAGNOSTIC_CODES.fieldDuplicate,
        field: "description",
        severity: "error",
        location: expect.objectContaining({ line: 5 }),
      }),
    ]);
  });

  it("omits unsupported workflow fields but keeps deliberate custom STIX properties", () => {
    const result = parseMarkdownNote({
      path: "Notes/Strict draft.md",
      basename: "Strict draft",
      frontmatter: {
        stix_type: "note",
        workflow_status: "review",
        x_example_team: "fictional-analysis",
      },
      markdown: "",
      links: [],
    });

    expect(result.draft?.properties).not.toHaveProperty("workflow_status");
    expect(result.draft?.properties.x_example_team).toBe(
      "fictional-analysis",
    );
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: DIAGNOSTIC_CODES.fieldUnsupported,
        severity: "warning",
        field: "workflow_status",
      }),
    ]);
  });

  it("does not map headings or relationships inside fenced examples", () => {
    const result = parseMarkdownNote({
      path: "Notes/Documentation.md",
      basename: "Documentation",
      frontmatter: {
        stix_type: "note",
      },
      markdown: [
        "````markdown",
        "## Content",
        "- stix:targets [[Text inside example]]",
        "````",
      ].join("\n"),
      links: [],
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.draft?.properties).not.toHaveProperty("content");
    expect(result.draft?.relationships).toEqual([]);
  });

  it("returns diagnostics instead of throwing for invalid boundaries and types", () => {
    const invalidInput = parseMarkdownNote(null);
    const unsupported = parseMarkdownNote({
      path: "Objects/Unsupported.md",
      basename: "Unsupported",
      frontmatter: {
        stix_type: "not-a-stix-type",
      },
      markdown: "",
      links: [],
    });

    expect(invalidInput.draft).toBeUndefined();
    expect(invalidInput.diagnostics).toEqual([
      expect.objectContaining({
        code: DIAGNOSTIC_CODES.noteInputInvalid,
        severity: "error",
      }),
    ]);
    expect(unsupported.diagnostics).toEqual([
      expect.objectContaining({
        code: DIAGNOSTIC_CODES.stixTypeUnsupported,
        severity: "error",
      }),
    ]);
  });
});
