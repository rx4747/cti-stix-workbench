import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { createDiagnostic, DIAGNOSTIC_CODES } from "../../src/core/diagnostics";
import { createExportResult, type StixBundle } from "../../src/core/types";

const representativeBundle: StixBundle = {
  type: "bundle",
  id: "bundle--dcf1983b-f7e5-4c3f-8447-9b825f73a875",
  objects: [],
};

describe("diagnostic contracts", () => {
  it("publishes unique stable diagnostic codes", () => {
    expect(new Set(Object.values(DIAGNOSTIC_CODES)).size).toBe(
      Object.keys(DIAGNOSTIC_CODES).length,
    );
    expect(DIAGNOSTIC_CODES.fieldRequired).toBe("CTI_FIELD_REQUIRED");
  });

  it("forces normative violations to block export", () => {
    const diagnostic = createDiagnostic({
      authority: "stix-normative",
      code: DIAGNOSTIC_CODES.fieldRequired,
      severity: "warning",
      message: "Identity name is required.",
      notePath: "03 STIX Objects/Identity/Example Analysis Team.md",
      objectPath: "$.name",
      field: "name",
      location: { line: 4, column: 1 },
    });

    expect(diagnostic.severity).toBe("error");
    expect(createExportResult(representativeBundle, [diagnostic])).toEqual({
      ok: false,
      errors: [diagnostic],
      warnings: [],
    });
  });

  it("returns a Bundle only when no blocking diagnostics exist", () => {
    const warning = createDiagnostic({
      authority: "mapping",
      code: DIAGNOSTIC_CODES.relationshipNotRecommended,
      severity: "warning",
      message: "Relationship is valid but not recommended.",
    });

    expect(createExportResult(representativeBundle, [warning])).toEqual({
      ok: true,
      bundle: representativeBundle,
      warnings: [warning],
    });
  });
});

describe("pure core boundary", () => {
  it("does not import Obsidian", async () => {
    const coreDirectory = fileURLToPath(new URL("../../src/core/", import.meta.url));
    const files = await readdir(coreDirectory);

    for (const filename of files.filter((entry) => entry.endsWith(".ts"))) {
      const source = await readFile(path.join(coreDirectory, filename), "utf8");
      expect(source).not.toMatch(/from\s+["']obsidian["']/u);
    }
  });
});
