import type { CatalogField, ObjectTypeDefinition } from "../catalog/types";

const FAMILY_FOLDERS = {
  sdo: "SDOs",
  sro: "SROs",
  sco: "SCOs",
  smo: "Meta Objects",
} as const;

function requiredValue(field: CatalogField, title: string, timestamp: string): unknown {
  if (field.name === "spec_version") return "2.1";
  if (["created", "modified", "valid_from"].includes(field.name)) return timestamp;
  if (field.name === "name") return title;
  if (field.name === "is_family") return false;
  if (field.name === "pattern") return "[ipv4-addr:value = '198.51.100.10']";
  if (field.name === "pattern_type") return "stix";
  if (field.name === "relationship_type") return "related-to";
  if (field.name === "context") return "suspicious-activity";
  if (field.name === "opinion") return "neutral";
  if (field.name === "extension_types") return ["property-extension"];
  if (field.name === "version") return "1.0.0";
  if (field.dataType.startsWith("array<")) return [];
  if (field.dataType === "object") return {};
  if (field.dataType === "boolean") return false;
  if (field.dataType === "integer" || field.dataType === "number") return 0;
  return "";
}

export function safeNoteTitle(value: string): string {
  return value
    .trim()
    .replaceAll(/[\\/:*?"<>|#^[\]]/gu, "-")
    .replaceAll(/\s+/gu, " ")
    .replaceAll(/-+/gu, "-")
    .replace(/^[-. ]+|[-. ]+$/gu, "")
    .slice(0, 120);
}

export function defaultObjectPath(
  definition: ObjectTypeDefinition,
  title: string,
): string {
  const folder = FAMILY_FOLDERS[definition.family as keyof typeof FAMILY_FOLDERS];
  if (folder === undefined) {
    throw new TypeError(`${definition.type} is not a standalone authorable type.`);
  }
  const safeTitle = safeNoteTitle(title);
  if (safeTitle === "") throw new TypeError("A STIX note title is required.");
  return `STIX Objects/${folder}/${safeTitle}.md`;
}

export function createObjectFrontmatter(
  definition: ObjectTypeDefinition,
  title: string,
  now: Date,
): Readonly<Record<string, unknown>> {
  const timestamp = now.toISOString();
  const frontmatter: Record<string, unknown> = {
    stix_type: definition.type,
    stix_id: "",
  };
  for (const field of definition.fields) {
    if (
      !field.required ||
      field.name === "type" ||
      field.name === "id" ||
      ["content", "description", "explanation"].includes(field.name)
    ) {
      continue;
    }
    frontmatter[field.name] = requiredValue(field, title.trim(), timestamp);
  }
  if (definition.type === "marking-definition") {
    frontmatter.definition_type = "statement";
    frontmatter.definition = { statement: "" };
  }
  return Object.freeze(frontmatter);
}

function yamlScalar(value: unknown): string {
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value) && value.length === 0) return "[]";
  if (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  ) {
    return "{}";
  }
  return JSON.stringify(value);
}

function yamlLines(value: Readonly<Record<string, unknown>>, indent = ""): string[] {
  return Object.entries(value).flatMap(([key, item]) => {
    if (item !== null && typeof item === "object" && !Array.isArray(item)) {
      return [
        `${indent}${key}:`,
        ...yamlLines(item as Readonly<Record<string, unknown>>, `${indent}  `),
      ];
    }
    return [`${indent}${key}: ${yamlScalar(item)}`];
  });
}

export function createObjectNote(
  definition: ObjectTypeDefinition,
  title: string,
  now: Date,
): string {
  const frontmatter = createObjectFrontmatter(definition, title, now);
  const sections = new Set(
    definition.fields.flatMap((field) => {
      if (field.name === "description") return ["Summary"];
      if (field.name === "content") return ["Content"];
      if (field.name === "explanation") return ["Explanation"];
      return [];
    }),
  );
  return [
    "---",
    ...yamlLines(frontmatter),
    "---",
    "",
    `# ${title.trim()}`,
    "",
    ...[...sections].flatMap((section) => [`## ${section}`, "", ""]),
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
