import { DIAGNOSTIC_CODES, type Diagnostic } from "../core/diagnostics";

export type DiagnosticGroup = "Object" | "Relationship" | "Canvas" | "Bundle";

const DIAGNOSTIC_HINTS: Readonly<Partial<Record<Diagnostic["code"], string>>> = {
  [DIAGNOSTIC_CODES.stixTypeMissing]:
    "Add a STIX type with Create STIX object or choose one in the property editor.",
  [DIAGNOSTIC_CODES.stixTypeUnsupported]:
    "Use a standard STIX 2.1 type or a custom type beginning with x-.",
  [DIAGNOSTIC_CODES.stixIdInvalid]:
    "Leave a new note's ID empty and let export create it, or enter a valid type--UUID identifier.",
  [DIAGNOSTIC_CODES.stixIdTypeMismatch]:
    "Make the identifier prefix match the note's STIX type.",
  [DIAGNOSTIC_CODES.fieldRequired]:
    "Open Edit STIX properties and complete the required field.",
  [DIAGNOSTIC_CODES.fieldTypeInvalid]:
    "Open Edit STIX properties and replace this value with the expected type. References should use a typed-note picker or a valid STIX ID.",
  [DIAGNOSTIC_CODES.fieldUnsupported]:
    "Remove the field or move its information to a supported property.",
  [DIAGNOSTIC_CODES.referenceUnresolved]:
    "Choose an existing typed STIX note or enter a valid external STIX ID.",
  [DIAGNOSTIC_CODES.relationshipInvalid]:
    "Use a directed Canvas edge or a list item in the form: stix:uses [[Target note]].",
  [DIAGNOSTIC_CODES.patternInvalid]:
    "Correct the Indicator pattern in Edit STIX properties, then validate again.",
  [DIAGNOSTIC_CODES.canvasInvalid]:
    "Check that Canvas file nodes resolve to Markdown notes and typed edges connect two file nodes.",
  [DIAGNOSTIC_CODES.extensionInvalid]:
    "Review the extension fields or register the custom extension locally.",
  [DIAGNOSTIC_CODES.exportBlocked]:
    "Choose a typed STIX note, a Canvas containing typed note files, or a folder containing completed STIX notes.",
};

export function diagnosticHint(diagnostic: Diagnostic): string | undefined {
  return DIAGNOSTIC_HINTS[diagnostic.code];
}

export function diagnosticGroup(diagnostic: Diagnostic): DiagnosticGroup {
  if (diagnostic.code === DIAGNOSTIC_CODES.canvasInvalid) return "Canvas";
  if (
    diagnostic.code === DIAGNOSTIC_CODES.relationshipInvalid ||
    diagnostic.code === DIAGNOSTIC_CODES.relationshipNotRecommended ||
    diagnostic.field === "source_ref" ||
    diagnostic.field === "target_ref" ||
    diagnostic.field === "relationship_type"
  ) {
    return "Relationship";
  }
  if (diagnostic.notePath !== undefined) return "Object";
  return "Bundle";
}

export function groupDiagnostics(
  diagnostics: readonly Diagnostic[],
): ReadonlyMap<DiagnosticGroup, readonly Diagnostic[]> {
  const grouped = new Map<DiagnosticGroup, Diagnostic[]>();
  for (const diagnostic of diagnostics) {
    const group = diagnosticGroup(diagnostic);
    grouped.set(group, [...(grouped.get(group) ?? []), diagnostic]);
  }
  return grouped;
}
