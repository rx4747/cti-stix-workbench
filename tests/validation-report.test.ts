import { describe, expect, it } from "vitest";

import { createDiagnostic, DIAGNOSTIC_CODES } from "../src/core/diagnostics";
import {
  diagnosticGroup,
  diagnosticHint,
  groupDiagnostics,
} from "../src/ui/validation-report-state";

describe("validation report grouping", () => {
  it("distinguishes object, relationship, Canvas, and Bundle diagnostics", () => {
    const diagnostics = [
      createDiagnostic({
        authority: "schema",
        code: DIAGNOSTIC_CODES.schemaInvalid,
        severity: "error",
        message: "Object error",
        notePath: "Objects/A.md",
      }),
      createDiagnostic({
        authority: "mapping",
        code: DIAGNOSTIC_CODES.relationshipInvalid,
        severity: "error",
        message: "Relationship error",
      }),
      createDiagnostic({
        authority: "input",
        code: DIAGNOSTIC_CODES.canvasInvalid,
        severity: "error",
        message: "Canvas error",
      }),
      createDiagnostic({
        authority: "system",
        code: DIAGNOSTIC_CODES.exportBlocked,
        severity: "error",
        message: "Bundle error",
      }),
    ];

    expect(diagnostics.map(diagnosticGroup)).toEqual([
      "Object",
      "Relationship",
      "Canvas",
      "Bundle",
    ]);
    expect([...groupDiagnostics(diagnostics).keys()]).toEqual([
      "Object",
      "Relationship",
      "Canvas",
      "Bundle",
    ]);
  });

  it("provides human-readable repair guidance for common input errors", () => {
    const diagnostic = createDiagnostic({
      authority: "mapping",
      code: DIAGNOSTIC_CODES.referenceUnresolved,
      severity: "error",
      message: "Target could not be resolved.",
    });

    expect(diagnosticHint(diagnostic)).toContain("typed STIX note");
  });
});
