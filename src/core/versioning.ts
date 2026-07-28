import { stixCatalog } from "../catalog/stix-2.1";

import { canonicalizeJson } from "./sco-id";
import type {
  GeneratedIdentity,
  JsonValue,
  NormalizedStixDraft,
  StixObject,
} from "./types";

function isVersionedStixType(type: string): boolean {
  const definition = stixCatalog.getObjectType(type);
  return (
    definition?.fields.some((field) => field.name === "modified") === true ||
    type.startsWith("x-")
  );
}

export function isVersionedStixObject(object: StixObject): boolean {
  return isVersionedStixType(object.type);
}

export function stixObjectVersionKey(object: StixObject): string {
  return stixVersionKey(object.type, object.id, object.modified);
}

export function stixVersionKey(type: string, id: string, modified: unknown): string {
  return isVersionedStixType(type) && typeof modified === "string"
    ? `${id}@${modified}`
    : id;
}

function versionTime(object: StixObject): number {
  const parsed =
    typeof object.modified === "string" ? Date.parse(object.modified) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}

export function compareStixVersions(left: StixObject, right: StixObject): number {
  const leftTime = versionTime(left);
  const rightTime = versionTime(right);
  if (leftTime !== rightTime) return leftTime < rightTime ? -1 : 1;
  return canonicalizeJson(left).localeCompare(canonicalizeJson(right));
}

export function latestStixVersion(
  objects: readonly StixObject[],
): StixObject | undefined {
  return [...objects].sort(compareStixVersions).at(-1);
}

export function stixDraftPathsById(
  drafts: readonly NormalizedStixDraft[],
  identities: readonly GeneratedIdentity[],
): ReadonlyMap<string, string> {
  const paths = new Map<string, string>();
  const versionsById = new Map<string, StixObject[]>();
  for (const draft of drafts) {
    const id =
      draft.stixId ??
      (typeof draft.properties.id === "string" ? draft.properties.id : undefined);
    const type =
      draft.stixType ??
      (typeof draft.properties.type === "string" ? draft.properties.type : undefined);
    if (id === undefined || type === undefined) continue;
    const object = { ...draft.properties, type, id } as StixObject;
    paths.set(stixObjectVersionKey(object), draft.path);
    const versions = versionsById.get(id) ?? [];
    versions.push(object);
    versionsById.set(id, versions);
  }
  for (const [id, versions] of versionsById) {
    const latest = latestStixVersion(versions);
    if (latest === undefined) continue;
    const path = paths.get(stixObjectVersionKey(latest));
    if (path !== undefined) paths.set(id, path);
  }
  for (const identity of identities) {
    if (identity.kind === "note") paths.set(identity.id, identity.notePath);
  }
  return paths;
}

export function advanceStixTimestamp(previous: string | undefined, now: Date): string {
  const previousTime = previous === undefined ? Number.NaN : Date.parse(previous);
  let nextTime = now.getTime();
  if (Number.isFinite(previousTime) && nextTime <= previousTime) {
    nextTime = previousTime + 1;
  }
  return new Date(nextTime).toISOString();
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
  const immutable = new Set([
    "type",
    "id",
    "spec_version",
    "created",
    "created_by_ref",
    "modified",
  ]);
  const safePatch = Object.fromEntries(
    Object.entries(patch).filter(([key]) => !immutable.has(key)),
  );
  return Object.freeze({
    ...object,
    ...safePatch,
    type: object.type,
    id: object.id,
    ...(typeof object.spec_version === "string"
      ? { spec_version: object.spec_version }
      : {}),
    modified,
  });
}

export function revokeStixObject(object: StixObject, modified: string): StixObject {
  return createNewStixVersion(object, modified, { revoked: true });
}
