import { validateCompiledBundle } from "../validation/schema-runtime";

import { createDiagnostic, DIAGNOSTIC_CODES, type Diagnostic } from "./diagnostics";
import type { ExtensionRegistry } from "./extension-registry";
import {
  type SemanticValidationMode,
  validateBundleSemantics,
} from "./semantic-validator";
import type { StixBundle } from "./types";

function fieldFromError(
  instancePath: string,
  params: Readonly<Record<string, unknown>>,
): string | undefined {
  if (typeof params.missingProperty === "string") {
    return params.missingProperty;
  }
  const segment = instancePath.split("/").filter(Boolean).at(-1);
  return segment === undefined || /^\d+$/u.test(segment)
    ? undefined
    : segment.replaceAll("~1", "/").replaceAll("~0", "~");
}

function notePathForError(
  bundle: StixBundle,
  instancePath: string,
  notePathById: ReadonlyMap<string, string>,
): string | undefined {
  const objectIndex = /^\/objects\/(\d+)(?:\/|$)/u.exec(instancePath)?.[1];
  if (objectIndex === undefined) {
    return undefined;
  }
  const object = bundle.objects[Number.parseInt(objectIndex, 10)];
  return object === undefined ? undefined : notePathById.get(object.id);
}

export function validateBundleSchema(
  bundle: StixBundle,
  notePathById: ReadonlyMap<string, string> = new Map(),
  mode: SemanticValidationMode = "strict",
  registry?: ExtensionRegistry,
): readonly Diagnostic[] {
  const validated = validateCompiledBundle(bundle);
  const schemaDiagnostics = validated.errors.map((error) => {
    const field = fieldFromError(error.instancePath, error.params);
    const notePath = notePathForError(bundle, error.instancePath, notePathById);
    return createDiagnostic({
      authority: "schema",
      code: DIAGNOSTIC_CODES.schemaInvalid,
      severity: "error",
      message:
        `STIX schema ${error.keyword} validation failed` +
        (error.message === undefined ? "." : `: ${error.message}.`),
      objectPath: error.instancePath === "" ? "$" : `$${error.instancePath}`,
      ...(field === undefined ? {} : { field }),
      ...(notePath === undefined ? {} : { notePath }),
    });
  });
  return Object.freeze([
    ...schemaDiagnostics,
    ...validateBundleSemantics(bundle, notePathById, mode, registry),
  ]);
}
