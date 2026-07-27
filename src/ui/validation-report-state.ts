import { DIAGNOSTIC_CODES, type Diagnostic } from "../core/diagnostics";

export type DiagnosticGroup = "Object" | "Relationship" | "Canvas" | "Bundle";

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
