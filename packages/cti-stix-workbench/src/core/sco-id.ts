import { stixCatalog } from "../catalog/stix-2.1";
import type { ObjectTypeDefinition } from "../catalog/types";
import {
  createDiagnostic,
  DIAGNOSTIC_CODES,
  type Diagnostic,
} from "./diagnostics";
import {
  createIdentifierService,
  type IdentifierResult,
} from "./identifiers";

export const STIX_SCO_UUID_NAMESPACE =
  "00abedb4-aa42-466c-9c01-fed23315a9b7";

type Sha1Digest = (input: Uint8Array) => Promise<Uint8Array>;

export interface ScoIdentifierDependencies {
  readonly randomUUID?: () => string;
  readonly sha1?: Sha1Digest;
}

const HASH_CONTRIBUTING_TYPES = new Set([
  "artifact",
  "file",
  "x509-certificate",
]);
const PREFERRED_HASH_ALGORITHMS = [
  "MD5",
  "SHA-1",
  "SHA-256",
  "SHA-512",
] as const;

function scoDefinition(type: string): ObjectTypeDefinition | undefined {
  const definition = stixCatalog.getObjectType(type);
  return definition?.family === "sco" ? definition : undefined;
}

function diagnostic(
  code: typeof DIAGNOSTIC_CODES.fieldRequired
    | typeof DIAGNOSTIC_CODES.stixTypeUnsupported
    | typeof DIAGNOSTIC_CODES.internalError,
  message: string,
  authority: Diagnostic["authority"],
  field?: string,
): IdentifierResult {
  return {
    ok: false,
    diagnostic: createDiagnostic({
      authority,
      code,
      severity: "error",
      message,
      ...(field === undefined
        ? {}
        : { field, objectPath: `$.${field}` }),
    }),
  };
}

function assertValidUnicode(value: string): void {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);
    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) {
        throw new TypeError(
          "Canonical JSON cannot contain a lone Unicode surrogate.",
        );
      }
      index += 1;
    } else if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      throw new TypeError(
        "Canonical JSON cannot contain a lone Unicode surrogate.",
      );
    }
  }
}

function canonicalizeString(value: string): string {
  assertValidUnicode(value);
  return JSON.stringify(value);
}

function canonicalize(value: unknown): string {
  if (typeof value === "string") {
    return canonicalizeString(value);
  }

  if (value === null || typeof value === "boolean") {
    return JSON.stringify(value);
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError("Canonical JSON cannot contain a non-finite number.");
    }
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalize(item)).join(",")}]`;
  }

  if (typeof value === "object") {
    const object = value as Record<string, unknown>;
    const prototype = Object.getPrototypeOf(object);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError("Canonical JSON accepts plain objects only.");
    }

    return `{${Object.keys(object)
      .sort()
      .map((key) => `${canonicalizeString(key)}:${canonicalize(object[key])}`)
      .join(",")}}`;
  }

  throw new TypeError(`Canonical JSON cannot contain ${typeof value}.`);
}

function selectOneHash(value: unknown): unknown {
  if (
    value === null
    || typeof value !== "object"
    || Array.isArray(value)
  ) {
    return value;
  }

  const hashes = value as Readonly<Record<string, unknown>>;
  const available = Object.keys(hashes).sort();
  const selected = PREFERRED_HASH_ALGORITHMS.find(
    (algorithm) => Object.hasOwn(hashes, algorithm),
  ) ?? available[0];

  return selected === undefined ? {} : { [selected]: hashes[selected] };
}

function hasProperty(
  properties: Readonly<Record<string, unknown>>,
  field: string,
): boolean {
  return Object.hasOwn(properties, field) && properties[field] !== undefined;
}

export function canonicalizeJson(value: unknown): string {
  return canonicalize(value);
}

function uuidToBytes(uuid: string): Uint8Array {
  const hexadecimal = uuid.replaceAll("-", "");
  const bytes = new Uint8Array(16);

  for (let index = 0; index < bytes.length; index += 1) {
    const offset = index * 2;
    bytes[index] = Number.parseInt(
      hexadecimal.slice(offset, offset + 2),
      16,
    );
  }

  return bytes;
}

function bytesToUuid(bytes: Uint8Array): string {
  const hexadecimal = Array.from(
    bytes,
    (byte) => byte.toString(16).padStart(2, "0"),
  ).join("");

  return [
    hexadecimal.slice(0, 8),
    hexadecimal.slice(8, 12),
    hexadecimal.slice(12, 16),
    hexadecimal.slice(16, 20),
    hexadecimal.slice(20),
  ].join("-");
}

async function browserSha1(input: Uint8Array): Promise<Uint8Array> {
  const buffer = new ArrayBuffer(input.byteLength);
  new Uint8Array(buffer).set(input);
  const digest = await globalThis.crypto.subtle.digest("SHA-1", buffer);
  return new Uint8Array(digest);
}

async function createUuid5(
  name: string,
  sha1: Sha1Digest,
): Promise<string> {
  const namespace = uuidToBytes(STIX_SCO_UUID_NAMESPACE);
  const nameBytes = new TextEncoder().encode(name);
  const input = new Uint8Array(namespace.length + nameBytes.length);
  input.set(namespace);
  input.set(nameBytes, namespace.length);

  const digest = await sha1(input);
  if (digest.length < 16) {
    throw new TypeError("SHA-1 digest must contain at least 16 bytes.");
  }

  const uuidBytes = digest.slice(0, 16);
  const versionByte = uuidBytes[6];
  const variantByte = uuidBytes[8];
  if (versionByte === undefined || variantByte === undefined) {
    throw new TypeError("SHA-1 digest could not be converted to UUIDv5.");
  }
  uuidBytes[6] = (versionByte & 0x0f) | 0x50;
  uuidBytes[8] = (variantByte & 0x3f) | 0x80;

  return bytesToUuid(uuidBytes);
}

export async function createDeterministicScoId(
  type: string,
  properties: Readonly<Record<string, unknown>>,
  dependencies: ScoIdentifierDependencies = {},
): Promise<IdentifierResult> {
  const definition = scoDefinition(type);
  const idContributingProperties = definition?.idContributingProperties;
  if (definition === undefined || idContributingProperties === undefined) {
    return diagnostic(
      DIAGNOSTIC_CODES.stixTypeUnsupported,
      `Deterministic ID generation is not implemented for SCO type "${type}".`,
      "stix-normative",
      "type",
    );
  }

  const contributing: Record<string, unknown> = {};
  for (const field of idContributingProperties) {
    const catalogField = definition.fields.find(
      (candidate) => candidate.name === field,
    );
    if (catalogField?.required === true && !hasProperty(properties, field)) {
      return diagnostic(
        DIAGNOSTIC_CODES.fieldRequired,
        `SCO type "${type}" requires ID-contributing property "${field}".`,
        "stix-normative",
        field,
      );
    }
    if (hasProperty(properties, field)) {
      const value = properties[field];
      contributing[field] =
        field === "hashes" && HASH_CONTRIBUTING_TYPES.has(type)
          ? selectOneHash(value)
          : value;
    }
  }

  if (Object.keys(contributing).length === 0) {
    return createIdentifierService({
      randomUUID: dependencies.randomUUID,
    }).ensureUuid4(type);
  }

  try {
    const canonicalProperties = canonicalizeJson(contributing);
    const uuid = await createUuid5(
      canonicalProperties,
      dependencies.sha1 ?? browserSha1,
    );
    return { ok: true, id: `${type}--${uuid}` };
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : "Unknown failure.";
    return diagnostic(
      DIAGNOSTIC_CODES.internalError,
      `Could not create deterministic SCO identifier: ${detail}`,
      "system",
    );
  }
}
