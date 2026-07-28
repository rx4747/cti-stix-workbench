import { describe, expect, it } from "vitest";

import {
  analystWorkflowDefinitions,
  createAnalystWorkflowNote,
  defaultWorkflowPath,
} from "../src/workflows/analyst-workflows";

describe("analyst workflow library", () => {
  it("keeps workflow identifiers and titles unique", () => {
    expect(new Set(analystWorkflowDefinitions.map(({ id }) => id)).size).toBe(
      analystWorkflowDefinitions.length,
    );
    expect(new Set(analystWorkflowDefinitions.map(({ title }) => title)).size).toBe(
      analystWorkflowDefinitions.length,
    );
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
      { basename: "APT1", path: "03 STIX Objects/SDOs/APT1.md" },
    );
    expect(note).toContain('object_refs: ["[[03 STIX Objects/SDOs/APT1]]"]');
    expect(note).toContain("# APT1 test review");
    expect(note).toContain("- [[03 STIX Objects/SDOs/APT1]]");
    expect(defaultWorkflowPath(workflow, "APT1 / review")).toBe(
      "02 Investigations/APT1 - review.md",
    );
  });
});
