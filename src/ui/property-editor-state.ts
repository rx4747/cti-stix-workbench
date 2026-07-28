import { stixCatalog } from "../catalog/stix-2.1";
import type { CatalogField, ObjectTypeDefinition } from "../catalog/types";
import { advanceStixTimestamp } from "../core/versioning";

const bodyMappedFields = new Set(["content", "description", "explanation"]);

export function stixReferenceLink(path: string): string {
  const notePath = path.endsWith(".md") ? path.slice(0, -3) : path;
  return friendlyStixReference(`[[${notePath}]]`);
}

export function friendlyStixReference(reference: string): string {
  const trimmed = reference.trim();
  const wikiMatch = /^\[\[([^\]]+)\]\]$/u.exec(trimmed);
  const inner = wikiMatch?.[1] ?? trimmed;
  if (inner.includes("|") || !inner.includes("/")) {
    return trimmed;
  }
  const target = inner.split("#", 1)[0]?.trim() ?? inner;
  const label = target.slice(target.lastIndexOf("/") + 1).trim();
  return label === "" ? trimmed : `[[${inner}|${label}]]`;
}

export function referenceTypeAllowed(
  stixType: string,
  targetTypes: readonly string[],
): boolean {
  return targetTypes.includes("*") || targetTypes.includes(stixType);
}

export function wikiLinkTarget(reference: string): string | undefined {
  const match = /^\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]$/u.exec(reference.trim());
  return match?.[1]?.trim();
}

export function rawStixReferenceLabel(reference: string): string {
  const match = /^([a-z][a-z0-9-]*)--([0-9a-f-]+)$/iu.exec(reference.trim());
  if (match?.[1] === undefined || match[2] === undefined) {
    return reference;
  }
  const identifier = match[2];
  return `${match[1]} · ${identifier.slice(0, 8)}…${identifier.slice(-4)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function scalarEditorText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return String(value);
  }
  return "";
}

export function cloneEditorValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => cloneEditorValue(item));
  }
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, cloneEditorValue(nested)]),
    );
  }
  return value;
}

export function createEmptyFieldValue(field: CatalogField): unknown {
  if (field.dataType.startsWith("array<")) {
    return [];
  }
  if (field.dataType === "object") {
    return {};
  }
  return "";
}

export function editableStixDefinition(
  frontmatter: unknown,
): ObjectTypeDefinition | undefined {
  if (!isRecord(frontmatter)) {
    return undefined;
  }
  const type =
    typeof frontmatter.stix_type === "string"
      ? frontmatter.stix_type
      : typeof frontmatter.type === "string"
        ? frontmatter.type
        : undefined;
  if (type === undefined) {
    return undefined;
  }
  const definition = stixCatalog.getObjectType(type);
  return definition === undefined ||
    definition.family === "bundle" ||
    definition.family === "predefined-extension"
    ? undefined
    : definition;
}

function createObjectFromChildren(
  children: readonly CatalogField[],
): Record<string, unknown> {
  return Object.fromEntries(
    children.map((child) => [child.name, createEmptyFieldValue(child)]),
  );
}

export function addObjectListItem(
  current: unknown,
  field: CatalogField,
): readonly unknown[] {
  const items = Array.isArray(current)
    ? current.map((item) => cloneEditorValue(item))
    : [];
  const nextItem =
    field.children === undefined ? {} : createObjectFromChildren(field.children);
  return [...items, nextItem];
}

export function updateObjectListItemField(
  current: readonly unknown[],
  itemIndex: number,
  fieldName: string,
  value: unknown,
): readonly unknown[] {
  return current.map((item, index) => {
    if (index !== itemIndex) {
      return cloneEditorValue(item);
    }
    const record = isRecord(item) ? item : {};
    return {
      ...record,
      [fieldName]: cloneEditorValue(value),
    };
  });
}

export function createExtensionValue(
  extension: ObjectTypeDefinition,
): Readonly<Record<string, unknown>> {
  return Object.freeze(createObjectFromChildren(extension.fields));
}

function frontmatterKey(fieldName: string): string {
  if (fieldName === "type") {
    return "stix_type";
  }
  if (fieldName === "id") {
    return "stix_id";
  }
  return fieldName;
}

export function createEditorValues(
  definition: ObjectTypeDefinition,
  frontmatter: Readonly<Record<string, unknown>>,
): Record<string, unknown> {
  return Object.fromEntries(
    definition.fields
      .filter((field) => {
        if (bodyMappedFields.has(field.name)) return false;
        const key = frontmatterKey(field.name);
        return field.required || Object.hasOwn(frontmatter, key);
      })
      .map((field) => {
        const key = frontmatterKey(field.name);
        return [
          key,
          Object.hasOwn(frontmatter, key)
            ? cloneEditorValue(frontmatter[key])
            : createEmptyFieldValue(field),
        ];
      }),
  );
}

export function availableOptionalFields(
  definition: ObjectTypeDefinition,
  values: Readonly<Record<string, unknown>>,
): readonly CatalogField[] {
  return definition.fields.filter((field) => {
    if (field.required || bodyMappedFields.has(field.name)) return false;
    return !Object.hasOwn(values, frontmatterKey(field.name));
  });
}

export function addOptionalEditorField(
  values: Readonly<Record<string, unknown>>,
  field: CatalogField,
): Record<string, unknown> {
  const initial = field.dataType.includes("array<object>")
    ? addObjectListItem([], field)
    : createEmptyFieldValue(field);
  return { ...values, [frontmatterKey(field.name)]: initial };
}

export function removeOptionalEditorField(
  values: Readonly<Record<string, unknown>>,
  field: CatalogField,
): Record<string, unknown> {
  if (field.required) return { ...values };
  const next = { ...values };
  delete next[frontmatterKey(field.name)];
  return next;
}

function cleanUnknownEditorValue(value: unknown): unknown {
  if (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return undefined;
  }
  if (Array.isArray(value)) {
    const items = value
      .map((item) => cleanUnknownEditorValue(item))
      .filter((item) => item !== undefined);
    return items.length === 0 ? undefined : items;
  }
  if (isRecord(value)) {
    const entries = Object.entries(value).flatMap(([key, nested]) => {
      const cleaned = cleanUnknownEditorValue(nested);
      return cleaned === undefined ? [] : [[key, cleaned] as const];
    });
    return entries.length === 0 ? undefined : Object.fromEntries(entries);
  }
  return cloneEditorValue(value);
}

function cleanNestedEditorValue(
  value: unknown,
  fields: readonly CatalogField[],
): unknown {
  if (!isRecord(value)) {
    return cleanUnknownEditorValue(value);
  }
  const fieldsByName = new Map(fields.map((field) => [field.name, field]));
  const entries = Object.entries(value).flatMap(([key, nested]) => {
    const field = fieldsByName.get(key);
    const cleaned =
      field === undefined
        ? cleanUnknownEditorValue(nested)
        : cleanFieldEditorValue(field, nested);
    if (cleaned !== undefined) {
      return [[key, cleaned] as const];
    }
    return field?.required === true ? [[key, cloneEditorValue(nested)] as const] : [];
  });
  return entries.length === 0 ? undefined : Object.fromEntries(entries);
}

function cleanFieldEditorValue(field: CatalogField, value: unknown): unknown {
  if (field.reference !== undefined) {
    const cleaned = cleanUnknownEditorValue(value);
    if (Array.isArray(cleaned)) {
      const items: readonly unknown[] = cleaned;
      return items.map((item) =>
        typeof item === "string" ? friendlyStixReference(item) : item,
      );
    }
    return typeof cleaned === "string" ? friendlyStixReference(cleaned) : cleaned;
  }
  if (field.children === undefined) {
    return cleanUnknownEditorValue(value);
  }
  if (Array.isArray(value)) {
    const items = value
      .map((item) => cleanNestedEditorValue(item, field.children ?? []))
      .filter((item) => item !== undefined);
    return items.length === 0 ? undefined : items;
  }
  return cleanNestedEditorValue(value, field.children);
}

export function applyEditorValues(
  frontmatter: Readonly<Record<string, unknown>>,
  definition: ObjectTypeDefinition,
  values: Readonly<Record<string, unknown>>,
): Record<string, unknown> {
  const next = { ...frontmatter };
  for (const field of definition.fields) {
    if (bodyMappedFields.has(field.name)) {
      continue;
    }
    const key = frontmatterKey(field.name);
    if (Object.hasOwn(values, key)) {
      const cleaned = cleanFieldEditorValue(field, values[key]);
      if (cleaned !== undefined) {
        next[key] = cleaned;
      } else if (field.required) {
        next[key] = cloneEditorValue(values[key]);
      } else {
        delete next[key];
      }
    }
  }
  return next;
}

export function advanceModifiedForEdit(
  before: Readonly<Record<string, unknown>>,
  after: Readonly<Record<string, unknown>>,
  now: Date,
): Record<string, unknown> {
  const next = { ...after };
  const type = typeof before.stix_type === "string" ? before.stix_type : before.type;
  const definition =
    typeof type === "string" ? stixCatalog.getObjectType(type) : undefined;
  if (
    definition?.fields.some((field) => field.name === "modified") !== true ||
    JSON.stringify(canonicalReferenceAliases(before)) ===
      JSON.stringify(canonicalReferenceAliases(after))
  ) {
    return next;
  }
  next.modified = advanceStixTimestamp(
    typeof before.modified === "string" ? before.modified : undefined,
    now,
  );
  return next;
}

function canonicalReferenceAliases(value: unknown): unknown {
  if (typeof value === "string") {
    const match = /^\[\[([^\]|]+)(?:\|[^\]]*)?\]\]$/u.exec(value.trim());
    return match?.[1] === undefined ? value : `[[${match[1]}]]`;
  }
  if (Array.isArray(value)) {
    return value.map((item) => canonicalReferenceAliases(item));
  }
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [
        key,
        canonicalReferenceAliases(nested),
      ]),
    );
  }
  return value;
}
