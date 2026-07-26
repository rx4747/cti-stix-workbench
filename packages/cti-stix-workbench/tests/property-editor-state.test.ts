import { describe, expect, it } from "vitest";

import { stixCatalog } from "../src/catalog/stix-2.1";
import {
  addObjectListItem,
  applyEditorValues,
  createEditorValues,
  createExtensionValue,
  editableStixDefinition,
  scalarEditorText,
  updateObjectListItemField,
} from "../src/ui/property-editor-state";

describe("STIX property editor state", () => {
  it("creates all external-reference child fields only when an item is added", () => {
    const definition = stixCatalog.getObjectType("indicator");
    const field = definition?.fields.find(
      (candidate) => candidate.name === "external_references",
    );

    expect(field).toBeDefined();
    expect(addObjectListItem([], field!)).toEqual([
      {
        source_name: "",
        external_id: "",
        description: "",
        url: "",
        hashes: {},
      },
    ]);
  });

  it("creates visible granular-marking children without mutating existing items", () => {
    const definition = stixCatalog.getObjectType("indicator");
    const field = definition?.fields.find(
      (candidate) => candidate.name === "granular_markings",
    );
    const existing = [
      {
        selectors: ["description"],
        marking_ref: "[[TLP Amber]]",
      },
    ];

    const next = addObjectListItem(existing, field!);

    expect(next).toEqual([
      existing[0],
      {
        selectors: [],
        lang: "",
        marking_ref: "",
      },
    ]);
    expect(existing).toHaveLength(1);
  });

  it("preserves existing nested values and unknown frontmatter during save", () => {
    const definition = stixCatalog.getObjectType("indicator")!;
    const frontmatter = {
      stix_type: "indicator",
      stix_id: "indicator--e2e1a340-4415-4ba8-9671-f7343fbf0836",
      external_references: [
        {
          source_name: "Example source",
          url: "https://example.test/report",
        },
      ],
      cti_legacy_case_id: "CASE-001",
      unrelated_plugin_key: true,
    };
    const values = createEditorValues(definition, frontmatter);
    values.confidence = 75;

    const saved = applyEditorValues(frontmatter, definition, values);

    expect(saved).toMatchObject({
      stix_type: "indicator",
      stix_id: "indicator--e2e1a340-4415-4ba8-9671-f7343fbf0836",
      confidence: 75,
      external_references: frontmatter.external_references,
      cti_legacy_case_id: "CASE-001",
      unrelated_plugin_key: true,
    });
    expect(saved).not.toBe(frontmatter);
  });

  it("omits untouched optional fields and empty optional nested children", () => {
    const definition = stixCatalog.getObjectType("indicator")!;
    const frontmatter = {
      stix_type: "indicator",
      stix_id: "indicator--e2e1a340-4415-4ba8-9671-f7343fbf0836",
      spec_version: "2.1",
      created: "2026-07-26T10:00:00.000Z",
      modified: "2026-07-26T10:00:00.000Z",
      pattern: "[ipv4-addr:value = '198.51.100.3']",
      pattern_type: "stix",
      valid_from: "2026-07-26T10:00:00.000Z",
    };
    const values = createEditorValues(definition, frontmatter);
    values.external_references = [
      {
        source_name: "Fictional Registry",
        external_id: "TEST-001",
        description: "",
        url: "",
        hashes: {},
      },
    ];

    const saved = applyEditorValues(frontmatter, definition, values);

    expect(saved.external_references).toEqual([
      {
        source_name: "Fictional Registry",
        external_id: "TEST-001",
      },
    ]);
    for (
      const absent of
      [
        "revoked",
        "lang",
        "object_marking_refs",
        "granular_markings",
        "extensions",
        "valid_until",
        "kill_chain_phases",
      ]
    ) {
      expect(saved).not.toHaveProperty(absent);
    }
  });

  it("deletes an optional property when the analyst clears it", () => {
    const definition = stixCatalog.getObjectType("indicator")!;
    const frontmatter = {
      stix_type: "indicator",
      confidence: 75,
    };
    const values = createEditorValues(definition, frontmatter);
    values.confidence = "";

    expect(
      applyEditorValues(frontmatter, definition, values),
    ).not.toHaveProperty("confidence");
  });

  it("creates every field for a predefined extension", () => {
    const extension = stixCatalog.getObjectType("archive-ext");

    expect(extension).toBeDefined();
    expect(createExtensionValue(extension!)).toEqual({
      contains_refs: [],
      comment: "",
    });
  });

  it("enables editing only for authorable standard STIX notes", () => {
    expect(
      editableStixDefinition({ stix_type: "indicator" })?.type,
    ).toBe("indicator");
    expect(editableStixDefinition({ stix_type: "bundle" })).toBeUndefined();
    expect(
      editableStixDefinition({ stix_type: "archive-ext" }),
    ).toBeUndefined();
    expect(
      editableStixDefinition({ stix_type: "not-a-type" }),
    ).toBeUndefined();
    expect(editableStixDefinition({})).toBeUndefined();
  });

  it("keeps an absent optional boolean unset until the analyst chooses it", () => {
    const definition = stixCatalog.getObjectType("ipv4-addr")!;
    const values = createEditorValues(definition, {
      stix_type: "ipv4-addr",
    });

    expect(values.defanged).toBe("");
  });

  it("preserves earlier edits when multiple child fields change", () => {
    let items: readonly unknown[] = [
      {
        source_name: "",
        url: "",
      },
    ];

    items = updateObjectListItemField(
      items,
      0,
      "source_name",
      "Example source",
    );
    items = updateObjectListItemField(
      items,
      0,
      "url",
      "https://example.test/report",
    );

    expect(items).toEqual([
      {
        source_name: "Example source",
        url: "https://example.test/report",
      },
    ]);
  });

  it("does not stringify nested objects as meaningless scalar text", () => {
    expect(scalarEditorText("value")).toBe("value");
    expect(scalarEditorText(42)).toBe("42");
    expect(scalarEditorText(true)).toBe("true");
    expect(scalarEditorText({ nested: true })).toBe("");
    expect(scalarEditorText(["value"])).toBe("");
  });
});
