import { stixCatalog } from "../catalog/stix-2.1";

import type { JsonValue, StixObject } from "./types";

export function isVersionedStixObject(object: StixObject): boolean {
  const definition = stixCatalog.getObjectType(object.type);
  return (
    definition?.fields.some((field) => field.name === "modified") === true ||
    object.type.startsWith("x-")
  );
}

export function stixObjectVersionKey(object: StixObject): string {
  return stixVersionKey(object.type, object.id, object.modified);
}

export function stixVersionKey(type: string, id: string, modified: unknown): string {
  const definition = stixCatalog.getObjectType(type);
  const versioned =
    definition?.fields.some((field) => field.name === "modified") === true ||
    type.startsWith("x-");
  return versioned && typeof modified === "string" ? `${id}@${modified}` : id;
}

export function compareStixVersions(left: StixObject, right: StixObject): number {
  const leftTime =
    typeof left.modified === "string"
      ? Date.parse(left.modified)
      : Number.NEGATIVE_INFINITY;
  const rightTime =
    typeof right.modified === "string"
      ? Date.parse(right.modified)
      : Number.NEGATIVE_INFINITY;
  return leftTime - rightTime;
}

export function latestStixVersion(
  objects: readonly StixObject[],
): StixObject | undefined {
  return [...objects].sort(compareStixVersions).at(-1);
}

export function createNewStixVersion(
  object: StixObject,
  modified: string,
  patch: Readonly<Record<string, JsonValue>> = {},
): StixObject {
  if (!isVersionedStixObject(object)) {
    throw new TypeError(`${object.type} objects do not use STIX versioning.`);
  }
  if (object.revoked === true)
    throw new TypeError("A revoked STIX object cannot be versioned.");
  const previous =
    typeof object.modified === "string" ? Date.parse(object.modified) : Number.NaN;
  const next = Date.parse(modified);
  if (!Number.isFinite(next) || (Number.isFinite(previous) && next <= previous)) {
    throw new TypeError(
      "The new modified timestamp must be later than the current version.",
    );
  }
  const safePatch = Object.fromEntries(
    Object.entries(patch).filter(
      ([key]) =>
        key !== "id" &&
        key !== "created" &&
        key !== "created_by_ref" &&
        key !== "modified",
    ),
  );
  return Object.freeze({
    ...object,
    ...safePatch,
    id: object.id,
    modified,
  });
}

export function revokeStixObject(object: StixObject, modified: string): StixObject {
  return createNewStixVersion(object, modified, { revoked: true });
}
