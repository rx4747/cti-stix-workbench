import { describe, expect, it } from "vitest";

import { DIAGNOSTIC_CODES } from "../src/core/diagnostics";
import { validateBundleSemantics } from "../src/core/semantic-validator";
import type { StixBundle, StixObject } from "../src/core/types";

const uuid = "00000000-0000-4000-8000-000000000001";

function bundle(...objects: StixObject[]): StixBundle {
  return {
    type: "bundle",
    id: `bundle--${uuid}`,
    objects,
  };
}

describe("normative STIX semantics", () => {
  it("allows references to objects outside the Bundle and warns when type is unverifiable", () => {
    const diagnostics = validateBundleSemantics(
      bundle({
        type: "indicator",
        id: `indicator--${uuid}`,
        created_by_ref: "identity--00000000-0000-4000-8000-000000000099",
        object_marking_refs: [
          "marking-definition--00000000-0000-4000-8000-000000000098",
        ],
      }),
    );

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "created_by_ref", severity: "warning" }),
        expect.objectContaining({
          field: "object_marking_refs",
          severity: "warning",
        }),
      ]),
    );
    expect(diagnostics).toHaveLength(2);
  });

  it("rejects an included created_by_ref target with the wrong type", () => {
    const actorId = `threat-actor--${uuid}`;
    const diagnostics = validateBundleSemantics(
      bundle(
        {
          type: "indicator",
          id: `indicator--${uuid}`,
          created_by_ref: actorId,
        },
        { type: "threat-actor", id: actorId },
      ),
    );

    expect(diagnostics).toEqual([
      expect.objectContaining({
        field: "created_by_ref",
        severity: "error",
        message: expect.stringContaining("Identity"),
      }),
    ]);
  });

  it("reports pattern syntax with a source location", () => {
    const diagnostics = validateBundleSemantics(
      bundle({
        type: "indicator",
        id: `indicator--${uuid}`,
        pattern_type: "stix",
        pattern: "[ipv4-addr:value = ]",
      }),
    );

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: DIAGNOSTIC_CODES.patternInvalid,
          field: "pattern",
          location: expect.objectContaining({ line: 1 }),
        }),
      ]),
    );
  });

  it("rejects reversed time windows and self relationships", () => {
    const id = `relationship--${uuid}`;
    const diagnostics = validateBundleSemantics(
      bundle({
        type: "relationship",
        id,
        source_ref: id,
        target_ref: id,
        start_time: "2026-07-27T11:00:00.000Z",
        stop_time: "2026-07-27T10:00:00.000Z",
      }),
    );

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "stop_time" }),
        expect.objectContaining({
          code: DIAGNOSTIC_CODES.relationshipInvalid,
          field: "target_ref",
        }),
      ]),
    );
  });

  it("validates granular selectors and marking reference types", () => {
    const wrongMarking = `identity--${uuid}`;
    const diagnostics = validateBundleSemantics(
      bundle(
        {
          type: "indicator",
          id: `indicator--${uuid}`,
          name: "Example",
          object_marking_refs: [wrongMarking],
          granular_markings: [
            {
              marking_ref: wrongMarking,
              selectors: ["missing", "name", "name"],
            },
          ],
        },
        { type: "identity", id: wrongMarking },
      ),
    );

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: DIAGNOSTIC_CODES.fieldTypeInvalid,
          message: expect.stringContaining("missing"),
        }),
        expect.objectContaining({ code: DIAGNOSTIC_CODES.fieldDuplicate }),
        expect.objectContaining({ field: "object_marking_refs" }),
      ]),
    );
  });

  it("rejects granular selectors that resolve only through the prototype", () => {
    const markingId = `marking-definition--${uuid}`;
    const diagnostics = validateBundleSemantics(
      bundle(
        {
          type: "indicator",
          id: `indicator--${uuid}`,
          granular_markings: [
            {
              marking_ref: markingId,
              selectors: ["toString"],
            },
          ],
        },
        { type: "marking-definition", id: markingId },
      ),
    );

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: DIAGNOSTIC_CODES.fieldTypeInvalid,
          message: expect.stringContaining("toString"),
        }),
      ]),
    );
  });

  it("enforces granular marking choice and fixed TLP marking definitions", () => {
    const tlpId = "marking-definition--00000000-0000-4000-8000-000000000088";
    const diagnostics = validateBundleSemantics(
      bundle(
        {
          type: "indicator",
          id: `indicator--${uuid}`,
          name: "Example",
          granular_markings: [{ lang: "en", marking_ref: tlpId, selectors: ["name"] }],
        },
        {
          type: "marking-definition",
          id: tlpId,
          created: "2026-07-28T10:00:00.000Z",
          name: "TLP:GREEN",
          definition_type: "tlp",
          definition: { tlp: "green" },
          object_marking_refs: [tlpId],
        },
      ),
    );

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("exactly one"),
        }),
        expect.objectContaining({
          message: expect.stringContaining("four fixed"),
        }),
        expect.objectContaining({
          message: expect.stringContaining("cannot mark itself"),
        }),
      ]),
    );
  });

  it("accepts the five standard Extension Definition modes", () => {
    const diagnostics = validateBundleSemantics(
      bundle({
        type: "extension-definition",
        id: `extension-definition--${uuid}`,
        extension_types: [
          "new-sdo",
          "new-sco",
          "new-sro",
          "property-extension",
          "toplevel-property-extension",
        ],
      }),
    );

    expect(diagnostics).toEqual([]);
  });

  it("reports non-recommended relationships only in strict mode", () => {
    const sourceId = `indicator--${uuid}`;
    const targetId = "ipv4-addr--00000000-0000-4000-8000-000000000002";
    const relationship = {
      type: "relationship",
      id: "relationship--00000000-0000-4000-8000-000000000003",
      source_ref: sourceId,
      target_ref: targetId,
      relationship_type: "based-on",
    } satisfies StixObject;
    const graph = bundle(
      { type: "indicator", id: sourceId },
      { type: "ipv4-addr", id: targetId },
      relationship,
    );

    expect(validateBundleSemantics(graph, new Map(), "strict")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: DIAGNOSTIC_CODES.relationshipNotRecommended,
          severity: "warning",
        }),
      ]),
    );
    expect(validateBundleSemantics(graph, new Map(), "lenient")).toEqual([]);
  });

  it("enforces invariants across multiple versions of one object", () => {
    const id = `indicator--${uuid}`;
    const original = {
      type: "indicator",
      id,
      created: "2026-07-01T10:00:00.000Z",
      modified: "2026-07-01T10:00:00.000Z",
      revoked: true,
    } satisfies StixObject;
    const invalidLater = {
      ...original,
      created: "2026-07-02T10:00:00.000Z",
      modified: "2026-07-03T10:00:00.000Z",
      revoked: false,
    } satisfies StixObject;

    expect(validateBundleSemantics(bundle(original, invalidLater))).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "created" }),
        expect.objectContaining({
          field: "modified",
          message: expect.stringContaining("revoked"),
        }),
      ]),
    );
  });
});
