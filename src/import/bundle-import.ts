import { stixCatalog } from "../catalog/stix-2.1";
import type { StixBundle, StixObject } from "../core/types";
import { latestStixVersion, stixObjectVersionKey } from "../core/versioning";
import { safeNoteTitle } from "../ui/object-creator-state";

const BODY_FIELDS = new Map([
  ["description", "Summary"],
  ["content", "Content"],
  ["explanation", "Explanation"],
]);

const FAMILY_FOLDERS: Readonly<Record<string, string>> = {
  sdo: "SDOs",
  sro: "SROs",
  sco: "SCOs",
  smo: "Meta Objects",
};

export interface BundleImportNotePlan {
  readonly object: StixObject;
  readonly relativePath: string;
  readonly frontmatter: Readonly<Record<string, unknown>>;
  readonly markdownBody: string;
}

export interface BundleImportPlan {
  readonly bundleId: string;
  readonly objectCount: number;
  readonly countsByType: Readonly<Record<string, number>>;
  readonly notes: readonly BundleImportNotePlan[];
  readonly overviewPath: string;
  readonly overviewBody: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isUnknownArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

export function parseStixBundleJson(source: string): StixBundle {
  let value: unknown;
  try {
    value = JSON.parse(source) as unknown;
  } catch (error) {
    throw new TypeError("The selected file is not valid JSON.", { cause: error });
  }
  if (
    !isRecord(value) ||
    value.type !== "bundle" ||
    typeof value.id !== "string" ||
    !Array.isArray(value.objects)
  ) {
    throw new TypeError("The selected JSON file is not a STIX Bundle.");
  }
  return value as unknown as StixBundle;
}

function labelFor(object: StixObject): string {
  for (const key of ["name", "value", "subject"]) {
    const value = object[key];
    if (typeof value === "string" && value.trim() !== "") return value.trim();
  }
  return object.type.replaceAll("-", " ");
}

function idSuffix(id: string): string {
  return id.split("--", 2)[1]?.replaceAll("-", "").slice(0, 12) ?? "object";
}

function folderFor(object: StixObject): string {
  const family = stixCatalog.getObjectType(object.type)?.family;
  return family === undefined
    ? "Custom Objects"
    : (FAMILY_FOLDERS[family] ?? "Custom Objects");
}

function replaceReferences(
  value: unknown,
  key: string,
  pathsById: ReadonlyMap<string, string>,
): unknown {
  if (typeof value === "string" && (key.endsWith("_ref") || key.endsWith("_refs"))) {
    const path = pathsById.get(value);
    return path === undefined ? value : `[[${path.replace(/\.md$/u, "")}]]`;
  }
  if (isUnknownArray(value)) {
    return value.map((item: unknown) => replaceReferences(item, key, pathsById));
  }
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([nestedKey, nested]) => [
        nestedKey,
        replaceReferences(nested, nestedKey, pathsById),
      ]),
    );
  }
  return value;
}

function noteBody(object: StixObject, title: string): string {
  const sections = [...BODY_FIELDS].flatMap(([field, heading]) => {
    const value = object[field];
    return typeof value === "string" && value !== ""
      ? [`## ${heading}`, "", value, ""]
      : [];
  });
  return [
    `# ${title}`,
    "",
    ...sections,
    "## Relationships",
    "",
    "-",
    "",
    "## Sources",
    "",
    "-",
    "",
  ].join("\n");
}

export function planBundleImport(bundle: StixBundle): BundleImportPlan {
  const versionsById = new Map<string, StixObject[]>();
  for (const object of bundle.objects) {
    const versions = versionsById.get(object.id) ?? [];
    versions.push(object);
    versionsById.set(object.id, versions);
  }
  const pathsByVersion = new Map<string, string>();
  for (const object of bundle.objects) {
    const versionSuffix =
      (versionsById.get(object.id)?.length ?? 0) > 1 &&
      typeof object.modified === "string"
        ? ` - ${object.modified.replaceAll(/[^0-9]/gu, "").slice(0, 14)}`
        : "";
    const title = safeNoteTitle(
      `${labelFor(object)} - ${idSuffix(object.id)}${versionSuffix}`,
    );
    const path = `${folderFor(object)}/${title}.md`;
    if ([...pathsByVersion.values()].includes(path)) {
      throw new TypeError(`The Bundle produces a duplicate note path: ${path}`);
    }
    pathsByVersion.set(stixObjectVersionKey(object), path);
  }
  const pathsById = new Map(
    [...versionsById].flatMap(([id, versions]) => {
      const latest = latestStixVersion(versions);
      const path =
        latest === undefined
          ? undefined
          : pathsByVersion.get(stixObjectVersionKey(latest));
      return path === undefined ? [] : [[id, path] as const];
    }),
  );

  const counts = new Map<string, number>();
  const notes = bundle.objects.map((object) => {
    counts.set(object.type, (counts.get(object.type) ?? 0) + 1);
    const relativePath = pathsByVersion.get(stixObjectVersionKey(object));
    if (relativePath === undefined)
      throw new TypeError(`Missing path for ${object.id}.`);
    const frontmatter: Record<string, unknown> = {
      stix_type: object.type,
      stix_id: object.id,
    };
    for (const [key, value] of Object.entries(object)) {
      if (key === "type" || key === "id" || BODY_FIELDS.has(key)) continue;
      frontmatter[key] = replaceReferences(value, key, pathsById);
    }
    return Object.freeze({
      object,
      relativePath,
      frontmatter: Object.freeze(frontmatter),
      markdownBody: noteBody(object, labelFor(object)),
    });
  });

  const links = notes.map((note) => `- [[${note.relativePath.replace(/\.md$/u, "")}]]`);
  return Object.freeze({
    bundleId: bundle.id,
    objectCount: notes.length,
    countsByType: Object.freeze(Object.fromEntries([...counts].sort())),
    notes: Object.freeze(notes),
    overviewPath: "Import Overview.md",
    overviewBody: [
      "# STIX Bundle Import",
      "",
      `Source Bundle: \`${bundle.id}\``,
      "",
      `Objects: ${notes.length}`,
      "",
      "## Imported objects",
      "",
      ...links,
      "",
    ].join("\n"),
  });
}
