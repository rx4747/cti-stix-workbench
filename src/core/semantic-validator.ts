import { isRecommendedRelationship } from "../catalog/relationships";
import { stixCatalog } from "../catalog/stix-2.1";
import { parseStixPattern } from "../validation/pattern-validator";

import { createDiagnostic, DIAGNOSTIC_CODES, type Diagnostic } from "./diagnostics";
import {
  type ExtensionRegistry,
  isCustomObjectType,
  isCustomProperty,
  isExtensionDefinitionId,
} from "./extension-registry";
import type { JsonValue, StixBundle, StixObject } from "./types";
import { stixObjectVersionKey } from "./versioning";

export type SemanticValidationMode = "strict" | "lenient";

const EXTENSION_TYPES = new Set([
  "new-sdo",
  "new-sco",
  "new-sro",
  "property-extension",
  "toplevel-property-extension",
]);

const TEMPORAL_FIELDS = [
  ["created", "modified"],
  ["valid_from", "valid_until"],
  ["first_seen", "last_seen"],
  ["first_observed", "last_observed"],
  ["start_time", "stop_time"],
  ["start", "end"],
] as const;

const STANDARD_TLP_MARKINGS: ReadonlyMap<
  string,
  Readonly<{ id: string; name: string; created: string }>
> = new Map([
  [
    "white",
    {
      id: "marking-definition--613f2e26-407d-48c7-9eca-b8e91df99dc9",
      name: "TLP:WHITE",
      created: "2017-01-20T00:00:00.000Z",
    },
  ],
  [
    "green",
    {
      id: "marking-definition--34098fce-860f-48ae-8e50-ebd3cc5e41da",
      name: "TLP:GREEN",
      created: "2017-01-20T00:00:00.000Z",
    },
  ],
  [
    "amber",
    {
      id: "marking-definition--f88d31f6-486f-44da-b317-01333bde0b82",
      name: "TLP:AMBER",
      created: "2017-01-20T00:00:00.000Z",
    },
  ],
  [
    "red",
    {
      id: "marking-definition--5e57c739-391a-4eb3-b6be-7d15ca92d5ed",
      name: "TLP:RED",
      created: "2017-01-20T00:00:00.000Z",
    },
  ],
] as const);

function isRecord(
  value: JsonValue | undefined,
): value is Readonly<Record<string, JsonValue>> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isJsonArray(value: JsonValue | undefined): value is readonly JsonValue[] {
  return Array.isArray(value);
}

function diagnostic(
  object: StixObject,
  notePathById: ReadonlyMap<string, string>,
  code: Diagnostic["code"],
  message: string,
  field?: string,
  severity: Diagnostic["severity"] = "error",
  authority: Diagnostic["authority"] = "stix-normative",
): Diagnostic {
  const notePath =
    notePathById.get(stixObjectVersionKey(object)) ?? notePathById.get(object.id);
  return createDiagnostic({
    authority,
    code,
    severity,
    message,
    ...(field === undefined ? {} : { field, objectPath: `$.${field}` }),
    ...(notePath === undefined ? {} : { notePath }),
  });
}

function validTimestamp(value: JsonValue | undefined): number | undefined {
  if (typeof value !== "string") return undefined;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : undefined;
}

function selectorExists(object: StixObject, selector: string): boolean {
  const segments = selector
    .replaceAll(/\[(\d+)\]/gu, ".$1")
    .split(".")
    .filter(Boolean);
  let current: JsonValue = object;
  for (const segment of segments) {
    if (isJsonArray(current)) {
      const index = Number.parseInt(segment, 10);
      if (!Number.isInteger(index) || !Object.hasOwn(current, index)) return false;
      const next = current.at(index);
      if (next === undefined) return false;
      current = next;
      continue;
    }
    if (!isRecord(current) || !Object.hasOwn(current, segment)) return false;
    const next = current[segment];
    if (next === undefined) return false;
    current = next;
  }
  return true;
}

function validateTemporalOrder(
  object: StixObject,
  notePathById: ReadonlyMap<string, string>,
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  for (const [firstField, lastField] of TEMPORAL_FIELDS) {
    const first = validTimestamp(object[firstField]);
    const last = validTimestamp(object[lastField]);
    if (first !== undefined && last !== undefined && last < first) {
      diagnostics.push(
        diagnostic(
          object,
          notePathById,
          DIAGNOSTIC_CODES.fieldTypeInvalid,
          `${lastField} must not be earlier than ${firstField}.`,
          lastField,
        ),
      );
    }
  }
  return diagnostics;
}

function validatePattern(
  object: StixObject,
  notePathById: ReadonlyMap<string, string>,
): Diagnostic[] {
  if (
    object.type !== "indicator" ||
    object.pattern_type !== "stix" ||
    typeof object.pattern !== "string"
  ) {
    return [];
  }
  return parseStixPattern(object.pattern).map((error) => {
    const base = diagnostic(
      object,
      notePathById,
      DIAGNOSTIC_CODES.patternInvalid,
      `Invalid STIX pattern at ${error.line}:${error.column + 1}: ${error.message}`,
      "pattern",
      "error",
      "pattern",
    );
    return {
      ...base,
      location: { line: error.line, column: error.column + 1 },
    };
  });
}

function validateRelationship(
  object: StixObject,
  notePathById: ReadonlyMap<string, string>,
): Diagnostic[] {
  if (object.type !== "relationship") return [];
  if (
    typeof object.source_ref === "string" &&
    object.source_ref === object.target_ref
  ) {
    return [
      diagnostic(
        object,
        notePathById,
        DIAGNOSTIC_CODES.relationshipInvalid,
        "A STIX Relationship cannot use the same object as source_ref and target_ref.",
        "target_ref",
      ),
    ];
  }
  return [];
}

function validateGranularMarkings(
  object: StixObject,
  notePathById: ReadonlyMap<string, string>,
): Diagnostic[] {
  if (!isJsonArray(object.granular_markings)) return [];
  const diagnostics: Diagnostic[] = [];
  for (const [index, value] of object.granular_markings.entries()) {
    if (!isRecord(value) || !isJsonArray(value.selectors)) continue;
    const hasLanguage = typeof value.lang === "string";
    const hasMarkingReference = typeof value.marking_ref === "string";
    if (hasLanguage === hasMarkingReference) {
      diagnostics.push(
        diagnostic(
          object,
          notePathById,
          DIAGNOSTIC_CODES.fieldTypeInvalid,
          "A granular marking must contain exactly one of lang or marking_ref.",
          `granular_markings[${index}]`,
        ),
      );
    }
    const selectors = value.selectors.filter(
      (selector): selector is string => typeof selector === "string",
    );
    for (const selector of selectors) {
      if (!selectorExists(object, selector)) {
        diagnostics.push(
          diagnostic(
            object,
            notePathById,
            DIAGNOSTIC_CODES.fieldTypeInvalid,
            `Granular marking selector "${selector}" does not identify an exported property.`,
            `granular_markings[${index}].selectors`,
          ),
        );
      }
    }
    if (new Set(selectors).size !== selectors.length) {
      diagnostics.push(
        diagnostic(
          object,
          notePathById,
          DIAGNOSTIC_CODES.fieldDuplicate,
          "A granular marking cannot contain duplicate selectors.",
          `granular_markings[${index}].selectors`,
        ),
      );
    }
  }
  return diagnostics;
}

function validateMarkingDefinition(
  object: StixObject,
  notePathById: ReadonlyMap<string, string>,
): Diagnostic[] {
  if (object.type !== "marking-definition") return [];
  const diagnostics: Diagnostic[] = [];
  if (
    isJsonArray(object.object_marking_refs) &&
    object.object_marking_refs.includes(object.id)
  ) {
    diagnostics.push(
      diagnostic(
        object,
        notePathById,
        DIAGNOSTIC_CODES.referenceUnresolved,
        "A Marking Definition cannot mark itself through object_marking_refs.",
        "object_marking_refs",
      ),
    );
  }
  if (isJsonArray(object.granular_markings)) {
    for (const [index, marking] of object.granular_markings.entries()) {
      if (isRecord(marking) && marking.marking_ref === object.id) {
        diagnostics.push(
          diagnostic(
            object,
            notePathById,
            DIAGNOSTIC_CODES.referenceUnresolved,
            "A Marking Definition cannot mark itself through granular_markings.",
            `granular_markings[${index}].marking_ref`,
          ),
        );
      }
    }
  }
  if (object.definition_type !== "tlp" || !isRecord(object.definition)) {
    return diagnostics;
  }
  const tlp = object.definition.tlp;
  const expected = typeof tlp === "string" ? STANDARD_TLP_MARKINGS.get(tlp) : undefined;
  if (
    expected === undefined ||
    object.id !== expected.id ||
    object.name !== expected.name ||
    object.created !== expected.created
  ) {
    diagnostics.push(
      diagnostic(
        object,
        notePathById,
        DIAGNOSTIC_CODES.fieldTypeInvalid,
        "TLP markings must use one of the four fixed STIX 2.1 marking definitions without altered identity metadata.",
        "definition",
      ),
    );
  }
  return diagnostics;
}

function validateExtensionDefinition(
  object: StixObject,
  notePathById: ReadonlyMap<string, string>,
): Diagnostic[] {
  if (object.type !== "extension-definition") return [];
  if (!Array.isArray(object.extension_types)) return [];
  const diagnostics: Diagnostic[] = [];
  for (const extensionType of object.extension_types) {
    if (typeof extensionType !== "string" || !EXTENSION_TYPES.has(extensionType)) {
      diagnostics.push(
        diagnostic(
          object,
          notePathById,
          DIAGNOSTIC_CODES.extensionInvalid,
          `Unsupported Extension Definition mode "${String(extensionType)}".`,
          "extension_types",
          "error",
          "extension",
        ),
      );
    }
  }
  return diagnostics;
}

function validateCrossObjectReferences(
  bundle: StixBundle,
  notePathById: ReadonlyMap<string, string>,
  mode: SemanticValidationMode,
): Diagnostic[] {
  const byId = new Map(bundle.objects.map((object) => [object.id, object]));
  const diagnostics: Diagnostic[] = [];
  const referenceTarget = (
    object: StixObject,
    reference: string,
    field: string,
    expected: string,
    valid: (target: StixObject) => boolean,
  ): void => {
    const target = byId.get(reference);
    if (target === undefined) {
      diagnostics.push(
        diagnostic(
          object,
          notePathById,
          DIAGNOSTIC_CODES.referenceUnresolved,
          `${field} references external STIX ID "${reference}"; its ${expected} type cannot be verified in this Bundle.`,
          field,
          "warning",
          "mapping",
        ),
      );
    } else if (!valid(target)) {
      diagnostics.push(
        diagnostic(
          object,
          notePathById,
          DIAGNOSTIC_CODES.referenceUnresolved,
          `${field} must reference ${expected}; included target ${reference} has type ${target.type}.`,
          field,
        ),
      );
    }
  };
  for (const object of bundle.objects) {
    if (typeof object.created_by_ref === "string") {
      referenceTarget(
        object,
        object.created_by_ref,
        "created_by_ref",
        "an Identity object",
        (target) => target.type === "identity",
      );
    }
    if (Array.isArray(object.object_marking_refs)) {
      for (const reference of object.object_marking_refs) {
        if (typeof reference === "string")
          referenceTarget(
            object,
            reference,
            "object_marking_refs",
            "a Marking Definition object",
            (target) => target.type === "marking-definition",
          );
      }
    }
    if (isJsonArray(object.granular_markings)) {
      for (const [index, marking] of object.granular_markings.entries()) {
        if (isRecord(marking) && typeof marking.marking_ref === "string")
          referenceTarget(
            object,
            marking.marking_ref,
            `granular_markings[${index}].marking_ref`,
            "a Marking Definition object",
            (target) => target.type === "marking-definition",
          );
      }
    }
    if (object.type === "sighting") {
      if (typeof object.sighting_of_ref === "string")
        referenceTarget(
          object,
          object.sighting_of_ref,
          "sighting_of_ref",
          "a Domain Object",
          (target) => ["sdo", "custom"].includes(family(target)),
        );
      if (Array.isArray(object.observed_data_refs)) {
        for (const reference of object.observed_data_refs) {
          if (typeof reference === "string")
            referenceTarget(
              object,
              reference,
              "observed_data_refs",
              "an Observed Data object",
              (target) => target.type === "observed-data",
            );
        }
      }
      if (Array.isArray(object.where_sighted_refs)) {
        for (const reference of object.where_sighted_refs) {
          if (typeof reference === "string")
            referenceTarget(
              object,
              reference,
              "where_sighted_refs",
              "an Identity or Location object",
              (target) => ["identity", "location"].includes(target.type),
            );
        }
      }
    }
    if (
      object.type === "relationship" &&
      typeof object.source_ref === "string" &&
      typeof object.target_ref === "string" &&
      typeof object.relationship_type === "string"
    ) {
      const source = byId.get(object.source_ref);
      const target = byId.get(object.target_ref);
      if (source === undefined || target === undefined) {
        if (source === undefined)
          referenceTarget(
            object,
            object.source_ref,
            "source_ref",
            "a STIX object",
            () => true,
          );
        if (target === undefined)
          referenceTarget(
            object,
            object.target_ref,
            "target_ref",
            "a STIX object",
            () => true,
          );
        continue;
      }
      if (
        mode === "strict" &&
        !isRecommendedRelationship(source.type, object.relationship_type, target.type)
      ) {
        diagnostics.push(
          diagnostic(
            object,
            notePathById,
            DIAGNOSTIC_CODES.relationshipNotRecommended,
            `${source.type} ${object.relationship_type} ${target.type} is not a relationship recommended by STIX 2.1. Custom relationships remain valid.`,
            "relationship_type",
            "warning",
            "mapping",
          ),
        );
      }
    }
    if (object.type === "language-content" && typeof object.object_ref === "string") {
      referenceTarget(
        object,
        object.object_ref,
        "object_ref",
        "a non-Language-Content STIX object",
        (candidate) => candidate.type !== "language-content",
      );
    }
  }
  return diagnostics;
}

function family(object: StixObject): "sdo" | "sro" | "sco" | "smo" | "custom" {
  if (object.type.startsWith("x-")) return "custom";
  const catalogFamily = stixCatalog.getObjectType(object.type)?.family;
  return catalogFamily === "sdo" ||
    catalogFamily === "sro" ||
    catalogFamily === "sco" ||
    catalogFamily === "smo"
    ? catalogFamily
    : "custom";
}

function validateCustomContent(
  bundle: StixBundle,
  notePathById: ReadonlyMap<string, string>,
  mode: SemanticValidationMode,
  registry: ExtensionRegistry | undefined,
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const includedExtensionDefinitions = new Set(
    bundle.objects
      .filter((object) => object.type === "extension-definition")
      .map((object) => object.id),
  );
  for (const object of bundle.objects) {
    if (
      isCustomObjectType(object.type) &&
      mode === "strict" &&
      registry?.objectTypes.has(object.type) !== true
    ) {
      diagnostics.push(
        diagnostic(
          object,
          notePathById,
          DIAGNOSTIC_CODES.extensionInvalid,
          `Custom object type "${object.type}" is not listed in the local extension registry.`,
          "type",
          "error",
          "extension",
        ),
      );
    }
    for (const key of Object.keys(object)) {
      if (!key.startsWith("x_")) continue;
      if (!isCustomProperty(key)) {
        diagnostics.push(
          diagnostic(
            object,
            notePathById,
            DIAGNOSTIC_CODES.extensionInvalid,
            `Custom property name "${key}" is invalid.`,
            key,
            "error",
            "extension",
          ),
        );
      } else if (mode === "strict" && registry?.properties.has(key) !== true) {
        diagnostics.push(
          diagnostic(
            object,
            notePathById,
            DIAGNOSTIC_CODES.extensionInvalid,
            `Custom property "${key}" is not listed in the local extension registry.`,
            key,
            "error",
            "extension",
          ),
        );
      }
    }
    if (!isRecord(object.extensions)) continue;
    for (const extensionName of Object.keys(object.extensions)) {
      const predefined = stixCatalog.getObjectType(extensionName);
      if (predefined?.family === "predefined-extension") continue;
      if (
        isExtensionDefinitionId(extensionName) &&
        (includedExtensionDefinitions.has(extensionName) ||
          registry?.extensionDefinitions.has(extensionName) === true)
      ) {
        continue;
      }
      diagnostics.push(
        diagnostic(
          object,
          notePathById,
          DIAGNOSTIC_CODES.extensionInvalid,
          `Extension "${extensionName}" is neither predefined nor backed by an included or registered Extension Definition.`,
          "extensions",
          "error",
          "extension",
        ),
      );
    }
  }
  return diagnostics;
}

function validateObjectVersions(
  bundle: StixBundle,
  notePathById: ReadonlyMap<string, string>,
): Diagnostic[] {
  const byId = new Map<string, StixObject[]>();
  for (const object of bundle.objects) {
    const versions = byId.get(object.id) ?? [];
    versions.push(object);
    byId.set(object.id, versions);
  }
  const diagnostics: Diagnostic[] = [];
  for (const versions of byId.values()) {
    if (versions.length < 2) continue;
    const first = versions[0];
    if (first === undefined) continue;
    if (family(first) === "sco") {
      diagnostics.push(
        diagnostic(
          first,
          notePathById,
          DIAGNOSTIC_CODES.fieldDuplicate,
          `SCO ID ${first.id} occurs more than once; SCOs do not use STIX object versioning.`,
          "id",
        ),
      );
      continue;
    }
    const modifiedValues = new Set<string>();
    const baselineCreated = first.created;
    const baselineCreator = first.created_by_ref;
    let revokedAt = Number.POSITIVE_INFINITY;
    for (const object of versions) {
      if (object.created !== baselineCreated) {
        diagnostics.push(
          diagnostic(
            object,
            notePathById,
            DIAGNOSTIC_CODES.fieldTypeInvalid,
            "All versions of a STIX object must retain the same created timestamp.",
            "created",
          ),
        );
      }
      if (object.created_by_ref !== baselineCreator) {
        diagnostics.push(
          diagnostic(
            object,
            notePathById,
            DIAGNOSTIC_CODES.fieldTypeInvalid,
            "All versions of a STIX object must retain the same created_by_ref value.",
            "created_by_ref",
          ),
        );
      }
      if (typeof object.modified !== "string") continue;
      if (modifiedValues.has(object.modified)) {
        diagnostics.push(
          diagnostic(
            object,
            notePathById,
            DIAGNOSTIC_CODES.fieldDuplicate,
            `Object version ${object.id}@${object.modified} occurs more than once.`,
            "modified",
          ),
        );
      }
      modifiedValues.add(object.modified);
      const timestamp = Date.parse(object.modified);
      if (object.revoked === true) revokedAt = Math.min(revokedAt, timestamp);
    }
    if (Number.isFinite(revokedAt)) {
      for (const object of versions) {
        const modified =
          typeof object.modified === "string"
            ? Date.parse(object.modified)
            : Number.NEGATIVE_INFINITY;
        if (modified > revokedAt) {
          diagnostics.push(
            diagnostic(
              object,
              notePathById,
              DIAGNOSTIC_CODES.fieldTypeInvalid,
              "A revoked STIX object cannot have a later version.",
              "modified",
            ),
          );
        }
      }
    }
  }
  return diagnostics;
}

export function validateBundleSemantics(
  bundle: StixBundle,
  notePathById: ReadonlyMap<string, string> = new Map(),
  _mode: SemanticValidationMode = "strict",
  registry?: ExtensionRegistry,
): readonly Diagnostic[] {
  const diagnostics = bundle.objects.flatMap((object) => [
    ...validateTemporalOrder(object, notePathById),
    ...validatePattern(object, notePathById),
    ...validateRelationship(object, notePathById),
    ...validateGranularMarkings(object, notePathById),
    ...validateMarkingDefinition(object, notePathById),
    ...validateExtensionDefinition(object, notePathById),
  ]);
  diagnostics.push(...validateCrossObjectReferences(bundle, notePathById, _mode));
  diagnostics.push(...validateObjectVersions(bundle, notePathById));
  diagnostics.push(...validateCustomContent(bundle, notePathById, _mode, registry));
  return Object.freeze(diagnostics);
}
