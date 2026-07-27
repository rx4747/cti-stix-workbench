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
  const notePath = notePathById.get(object.id);
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
  for (const object of bundle.objects) {
    if (Array.isArray(object.object_marking_refs)) {
      for (const reference of object.object_marking_refs) {
        if (
          typeof reference === "string" &&
          byId.get(reference)?.type !== "marking-definition"
        ) {
          diagnostics.push(
            diagnostic(
              object,
              notePathById,
              DIAGNOSTIC_CODES.referenceUnresolved,
              "object_marking_refs must reference included Marking Definition objects.",
              "object_marking_refs",
            ),
          );
        }
      }
    }
    if (isJsonArray(object.granular_markings)) {
      for (const [index, marking] of object.granular_markings.entries()) {
        if (
          isRecord(marking) &&
          typeof marking.marking_ref === "string" &&
          byId.get(marking.marking_ref)?.type !== "marking-definition"
        ) {
          diagnostics.push(
            diagnostic(
              object,
              notePathById,
              DIAGNOSTIC_CODES.referenceUnresolved,
              "granular_markings marking_ref must reference an included Marking Definition object.",
              `granular_markings[${index}].marking_ref`,
            ),
          );
        }
      }
    }
    if (object.type === "sighting") {
      const sighted =
        typeof object.sighting_of_ref === "string"
          ? byId.get(object.sighting_of_ref)
          : undefined;
      if (sighted === undefined || !["sdo", "custom"].includes(family(sighted))) {
        diagnostics.push(
          diagnostic(
            object,
            notePathById,
            DIAGNOSTIC_CODES.referenceUnresolved,
            "sighting_of_ref must reference an included Domain Object.",
            "sighting_of_ref",
          ),
        );
      }
      if (Array.isArray(object.observed_data_refs)) {
        for (const reference of object.observed_data_refs) {
          if (
            typeof reference === "string" &&
            byId.get(reference)?.type !== "observed-data"
          ) {
            diagnostics.push(
              diagnostic(
                object,
                notePathById,
                DIAGNOSTIC_CODES.referenceUnresolved,
                "observed_data_refs must reference included Observed Data objects.",
                "observed_data_refs",
              ),
            );
          }
        }
      }
      if (Array.isArray(object.where_sighted_refs)) {
        for (const reference of object.where_sighted_refs) {
          const target =
            typeof reference === "string" ? byId.get(reference) : undefined;
          if (target === undefined || !["identity", "location"].includes(target.type)) {
            diagnostics.push(
              diagnostic(
                object,
                notePathById,
                DIAGNOSTIC_CODES.referenceUnresolved,
                "where_sighted_refs must reference included Identity or Location objects.",
                "where_sighted_refs",
              ),
            );
          }
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
        diagnostics.push(
          diagnostic(
            object,
            notePathById,
            DIAGNOSTIC_CODES.referenceUnresolved,
            "Relationship source_ref and target_ref must reference included objects.",
            source === undefined ? "source_ref" : "target_ref",
          ),
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
      const target = byId.get(object.object_ref);
      if (target === undefined || target.type === "language-content") {
        diagnostics.push(
          diagnostic(
            object,
            notePathById,
            DIAGNOSTIC_CODES.referenceUnresolved,
            "object_ref must reference an included non-Language-Content STIX object.",
            "object_ref",
          ),
        );
      }
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
    ...validateExtensionDefinition(object, notePathById),
  ]);
  diagnostics.push(...validateCrossObjectReferences(bundle, notePathById, _mode));
  diagnostics.push(...validateCustomContent(bundle, notePathById, _mode, registry));
  return Object.freeze(diagnostics);
}
