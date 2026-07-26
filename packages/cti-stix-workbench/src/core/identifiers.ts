import {
  createDiagnostic,
  DIAGNOSTIC_CODES,
  type Diagnostic,
} from "./diagnostics";

const STIX_TYPE_PATTERN = /^[a-z][a-z0-9-]*$/u;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-([1-5])[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

export type IdentifierResult =
  | Readonly<{ ok: true; id: string }>
  | Readonly<{ ok: false; diagnostic: Diagnostic }>;

export interface IdentifierDependencies {
  readonly now?: () => Date;
  readonly randomUUID?: () => string;
}

export interface IdentifierService {
  readonly ensureUuid4: (
    type: string,
    existingId?: string,
  ) => IdentifierResult;
  readonly now: () => string;
}

function invalidIdentifier(message: string): IdentifierResult {
  return {
    ok: false,
    diagnostic: createDiagnostic({
      authority: "stix-normative",
      code: DIAGNOSTIC_CODES.stixIdInvalid,
      severity: "error",
      message,
      field: "id",
      objectPath: "$.id",
    }),
  };
}

function uuidVersion(uuid: string): number | undefined {
  const match = UUID_PATTERN.exec(uuid);
  const version = match?.[1];
  return version === undefined ? undefined : Number.parseInt(version, 10);
}

function validateType(type: string): IdentifierResult | undefined {
  if (!STIX_TYPE_PATTERN.test(type)) {
    return invalidIdentifier(
      `Cannot create a STIX identifier for invalid object type "${type}".`,
    );
  }

  return undefined;
}

export function validateStixIdentifier(
  expectedType: string,
  id: string,
): IdentifierResult {
  const typeFailure = validateType(expectedType);
  if (typeFailure !== undefined) {
    return typeFailure;
  }

  const separatorIndex = id.indexOf("--");
  const actualType = separatorIndex === -1
    ? undefined
    : id.slice(0, separatorIndex);
  const uuid = separatorIndex === -1
    ? undefined
    : id.slice(separatorIndex + 2);

  if (
    actualType === undefined
    || uuid === undefined
    || actualType.length === 0
    || uuid.includes("--")
    || uuidVersion(uuid) === undefined
  ) {
    return invalidIdentifier(
      `STIX identifier "${id}" must use the form <type>--<UUID>.`,
    );
  }

  if (actualType !== expectedType) {
    return {
      ok: false,
      diagnostic: createDiagnostic({
        authority: "stix-normative",
        code: DIAGNOSTIC_CODES.stixIdTypeMismatch,
        severity: "error",
        message:
          `STIX identifier type "${actualType}" does not match object type `
          + `"${expectedType}".`,
        field: "id",
        objectPath: "$.id",
      }),
    };
  }

  return { ok: true, id };
}

export function createIdentifierService(
  dependencies: IdentifierDependencies = {},
): IdentifierService {
  const randomUUID = dependencies.randomUUID
    ?? (() => crypto.randomUUID());
  const currentDate = dependencies.now ?? (() => new Date());

  return Object.freeze({
    ensureUuid4(type: string, existingId?: string): IdentifierResult {
      if (existingId !== undefined && existingId.length > 0) {
        const validated = validateStixIdentifier(type, existingId);
        if (!validated.ok) {
          return validated;
        }

        const uuid = existingId.slice(existingId.indexOf("--") + 2);
        if (uuidVersion(uuid) !== 4) {
          return invalidIdentifier(
            `STIX ${type} identifiers created by the workbench must use UUIDv4.`,
          );
        }

        return validated;
      }

      const typeFailure = validateType(type);
      if (typeFailure !== undefined) {
        return typeFailure;
      }

      const uuid = randomUUID();
      if (uuidVersion(uuid) !== 4) {
        return invalidIdentifier(
          "The configured random UUID source did not return a valid UUIDv4.",
        );
      }

      return { ok: true, id: `${type}--${uuid}` };
    },

    now(): string {
      return currentDate().toISOString();
    },
  });
}
