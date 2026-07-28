import { describe, expect, it } from "vitest";

import {
  buildStixViewerModel,
  parseStixViewerJson,
  StixViewerModelError,
} from "../src/viewer/model";

const indicator = {
  type: "indicator",
  id: "indicator--11111111-1111-4111-8111-111111111111",
  name: "Suspicious domain",
  created_by_ref: "identity--22222222-2222-4222-8222-222222222222",
  object_marking_refs: ["marking-definition--33333333-3333-4333-8333-333333333333"],
};

const actor = {
  type: "threat-actor",
  id: "threat-actor--44444444-4444-4444-8444-444444444444",
  name: "Fictional actor",
};

describe("STIX viewer model", () => {
  it("reads Bundles, uses relationship objects as edges, and attaches note paths", () => {
    const notePathById = new Map([
      [indicator.id, "Objects/Suspicious domain.md"],
      [
        "relationship--55555555-5555-4555-8555-555555555555",
        "Relationships/Indicator indicates actor.md",
      ],
    ]);
    const model = buildStixViewerModel(
      {
        type: "bundle",
        id: "bundle--aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        objects: [
          indicator,
          actor,
          {
            type: "relationship",
            id: "relationship--55555555-5555-4555-8555-555555555555",
            relationship_type: "indicates",
            source_ref: indicator.id,
            target_ref: actor.id,
          },
        ],
      },
      notePathById,
    );

    expect(model.objectCount).toBe(3);
    expect(model.nodes).toHaveLength(4);
    expect(model.nodes).not.toContainEqual(
      expect.objectContaining({ type: "relationship" }),
    );
    expect(model.nodes).toContainEqual(
      expect.objectContaining({
        id: indicator.id,
        label: "Suspicious domain",
        notePath: "Objects/Suspicious domain.md",
        placeholder: false,
      }),
    );
    expect(model.edges).toContainEqual(
      expect.objectContaining({
        sourceId: indicator.id,
        targetId: actor.id,
        label: "indicates",
        kind: "relationship",
        notePath: "Relationships/Indicator indicates actor.md",
      }),
    );
    expect(model.edges).toContainEqual(
      expect.objectContaining({ field: "created_by_ref", label: "created by" }),
    );
    expect(model.edges).toContainEqual(
      expect.objectContaining({ field: "object_marking_refs", label: "marked by" }),
    );
  });

  it("creates placeholders for missing references and deduplicates equivalent edges", () => {
    const model = buildStixViewerModel([
      indicator,
      {
        type: "grouping",
        id: "grouping--66666666-6666-4666-8666-666666666666",
        object_refs: [indicator.id, indicator.id, "not-a-stix-id"],
      },
    ]);

    expect(model.placeholderCount).toBe(3);
    expect(model.nodes).toContainEqual(
      expect.objectContaining({
        id: "identity--22222222-2222-4222-8222-222222222222",
        type: "identity",
        placeholder: true,
      }),
    );
    expect(model.nodes).toContainEqual(
      expect.objectContaining({
        id: "not-a-stix-id",
        type: "unresolved-reference",
        placeholder: true,
      }),
    );
    expect(
      model.edges.filter(
        (edge) =>
          edge.sourceId.startsWith("grouping--") && edge.targetId === indicator.id,
      ),
    ).toHaveLength(1);
    expect(model.edges).toContainEqual(
      expect.objectContaining({ field: "object_refs", label: "contains" }),
    );
  });

  it("preserves distinct reference fields with the same endpoints", () => {
    const sourceId = "x-reference-test--77777777-7777-4777-8777-777777777777";
    const model = buildStixViewerModel([
      indicator,
      {
        type: "x-reference-test",
        id: sourceId,
        object_ref: indicator.id,
        object_refs: [indicator.id],
      },
    ]);

    expect(
      model.edges.filter(
        (edge) => edge.sourceId === sourceId && edge.targetId === indicator.id,
      ),
    ).toHaveLength(2);
  });

  it("accepts a single object and rejects invalid JSON and duplicate versions", () => {
    expect(parseStixViewerJson(JSON.stringify(indicator)).nodes).toHaveLength(3);
    expect(() => parseStixViewerJson("{")).toThrow(StixViewerModelError);
    expect(() => buildStixViewerModel([indicator, indicator])).toThrow(
      `STIX object version ${indicator.id} is duplicated.`,
    );
    expect(() => buildStixViewerModel({ type: "bundle", id: "bundle--x" })).toThrow(
      "A STIX Bundle requires an objects array.",
    );
    expect(() =>
      buildStixViewerModel({
        type: "relationship",
        id: "relationship--55555555-5555-4555-8555-555555555555",
      }),
    ).toThrow("requires string source_ref and target_ref values");
    expect(() =>
      buildStixViewerModel({
        type: "relationship",
        id: "relationship--55555555-5555-4555-8555-555555555555",
        source_ref: " ",
        target_ref: actor.id,
      }),
    ).toThrow("requires string source_ref and target_ref values");
  });

  it("retains multiple versions and resolves references to the latest version", () => {
    const oldVersion = {
      ...indicator,
      created: "2026-07-01T10:00:00.000Z",
      modified: "2026-07-01T10:00:00.000Z",
      name: "Old indicator",
    };
    const newVersion = {
      ...oldVersion,
      modified: "2026-07-02T10:00:00.000Z",
      name: "Current indicator",
    };
    const model = buildStixViewerModel([
      oldVersion,
      newVersion,
      { ...actor, object_ref: indicator.id },
    ]);

    expect(model.nodes.filter((node) => node.id === indicator.id)).toHaveLength(2);
    expect(model.edges.find((edge) => edge.sourceId === actor.id)?.targetKey).toContain(
      "@2026-07-02T10:00:00.000Z",
    );
  });

  it("retains distinct authored Relationship objects with the same triple", () => {
    const relationship = {
      type: "relationship",
      id: "relationship--55555555-5555-4555-8555-555555555555",
      relationship_type: "indicates",
      source_ref: indicator.id,
      target_ref: actor.id,
    };
    const model = buildStixViewerModel([
      indicator,
      actor,
      relationship,
      {
        ...relationship,
        id: "relationship--77777777-7777-4777-8777-777777777777",
      },
    ]);

    expect(model.edges.filter((edge) => edge.kind === "relationship")).toHaveLength(2);
  });
});
