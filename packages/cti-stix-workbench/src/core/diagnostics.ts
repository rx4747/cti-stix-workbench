export const DIAGNOSTIC_CODES = {
  noteInputInvalid: "CTI_NOTE_INPUT_INVALID",
  stixTypeMissing: "CTI_STIX_TYPE_MISSING",
  stixTypeUnsupported: "CTI_STIX_TYPE_UNSUPPORTED",
  stixIdInvalid: "CTI_STIX_ID_INVALID",
  stixIdTypeMismatch: "CTI_STIX_ID_TYPE_MISMATCH",
  scoIdFallback: "CTI_SCO_ID_FALLBACK",
  fieldRequired: "CTI_FIELD_REQUIRED",
  fieldTypeInvalid: "CTI_FIELD_TYPE_INVALID",
  fieldUnsupported: "CTI_FIELD_UNSUPPORTED",
  fieldDuplicate: "CTI_FIELD_DUPLICATE",
  referenceUnresolved: "CTI_REFERENCE_UNRESOLVED",
  relationshipInvalid: "CTI_RELATIONSHIP_INVALID",
  relationshipNotRecommended: "CTI_RELATIONSHIP_NOT_RECOMMENDED",
  patternInvalid: "CTI_PATTERN_INVALID",
  schemaInvalid: "CTI_SCHEMA_INVALID",
  canvasInvalid: "CTI_CANVAS_INVALID",
  extensionInvalid: "CTI_EXTENSION_INVALID",
  exportBlocked: "CTI_EXPORT_BLOCKED",
  internalError: "CTI_INTERNAL_ERROR",
} as const;

export type DiagnosticCode =
  (typeof DIAGNOSTIC_CODES)[keyof typeof DIAGNOSTIC_CODES];
export type DiagnosticSeverity = "error" | "warning";
export type DiagnosticAuthority =
  | "input"
  | "stix-normative"
  | "schema"
  | "pattern"
  | "mapping"
  | "extension"
  | "system";

export interface SourceLocation {
  readonly line: number;
  readonly column: number;
  readonly endLine?: number;
  readonly endColumn?: number;
}

export interface Diagnostic {
  readonly authority: DiagnosticAuthority;
  readonly code: DiagnosticCode;
  readonly severity: DiagnosticSeverity;
  readonly message: string;
  readonly notePath?: string;
  readonly objectPath?: string;
  readonly field?: string;
  readonly location?: SourceLocation;
}

export interface DiagnosticInput extends Omit<Diagnostic, "severity" | "location"> {
  readonly severity: DiagnosticSeverity;
  readonly location?: SourceLocation;
}

export function createDiagnostic(input: DiagnosticInput): Diagnostic {
  const location = input.location === undefined
    ? undefined
    : Object.freeze({ ...input.location });

  return Object.freeze({
    ...input,
    severity: input.authority === "stix-normative" ? "error" : input.severity,
    ...(location === undefined ? {} : { location }),
  });
}
