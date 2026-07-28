import { describe, expect, it } from "vitest";

import {
  analystWorkflowDefinitions,
  createAnalystWorkflowNote,
  defaultWorkflowPath,
} from "../src/workflows/analyst-workflows";

describe("analyst workflow library", () => {
  it("contains the complete unique 6/5/4 versioned workflow library", () => {
    expect(analystWorkflowDefinitions).toHaveLength(15);
    expect(new Set(analystWorkflowDefinitions.map(({ id }) => id)).size).toBe(
      analystWorkflowDefinitions.length,
    );
    expect(new Set(analystWorkflowDefinitions.map(({ title }) => title)).size).toBe(
      analystWorkflowDefinitions.length,
    );
    expect(
      analystWorkflowDefinitions.filter(({ introducedIn }) => introducedIn === "1.3.0"),
    ).toHaveLength(6);
    expect(
      analystWorkflowDefinitions.filter(({ introducedIn }) => introducedIn === "1.4.0"),
    ).toHaveLength(5);
    expect(
      analystWorkflowDefinitions.filter(({ introducedIn }) => introducedIn === "1.5.0"),
    ).toHaveLength(4);
  });

  it("creates a STIX Note draft linked to the active note", () => {
    const workflow = {
      id: "test-review",
      title: "Test Review",
      description: "Review a test.",
      introducedIn: "1.3.0",
      defaultFolder: "02 Investigations" as const,
      body: ["## Content", "", "Review it."],
    };
    const note = createAnalystWorkflowNote(
      workflow,
      "APT1 test review",
      new Date("2026-07-28T12:00:00.000Z"),
      {
        basename: "APT1",
        path: "03 STIX Objects/SDOs/APT1.md",
        includeInObjectRefs: true,
      },
    );
    expect(note).toContain('object_refs: ["[[03 STIX Objects/SDOs/APT1]]"]');
    expect(note).not.toContain("created_by_ref");
    expect(note).not.toContain("object_marking_refs");
    expect(note).not.toContain("external_references");
    expect(note).not.toContain("granular_markings");
    expect(note).not.toContain("extensions");
    expect(note).toContain("# APT1 test review");
    expect(note).toContain("- [[03 STIX Objects/SDOs/APT1]]");
    expect(defaultWorkflowPath(workflow, "APT1 / review")).toBe(
      "02 Investigations/APT1 - review.md",
    );
  });

  it("keeps an ordinary active note contextual rather than a STIX reference", () => {
    const workflow = analystWorkflowDefinitions[0];
    if (workflow === undefined) throw new TypeError("Workflow catalog is empty.");
    const note = createAnalystWorkflowNote(
      workflow,
      "Contextual review",
      new Date("2026-07-28T12:00:00.000Z"),
      {
        basename: "Case notes",
        path: "02 Investigations/Case notes.md",
        includeInObjectRefs: false,
      },
    );
    expect(note).toContain("object_refs: []");
    expect(note).toContain("- [[02 Investigations/Case notes]]");
  });
});
