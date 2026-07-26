import { stixCatalog } from "../catalog/stix-2.1";
import type {
  CatalogField,
  ObjectTypeDefinition,
} from "../catalog/types";

const bodyMappedFields = new Set([
  "content",
  "description",
  "explanation",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function scalarEditorText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (
    typeof value === "number"
    || typeof value === "boolean"
    || typeof value === "bigint"
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
      Object.entries(value).map(([key, nested]) => [
        key,
        cloneEditorValue(nested),
      ]),
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
    children.map((child) => [
      child.name,
      createEmptyFieldValue(child),
    ]),
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
    field.children === undefined
      ? {}
      : createObjectFromChildren(field.children);
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
      .filter((field) => !bodyMappedFields.has(field.name))
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

function cleanUnknownEditorValue(value: unknown): unknown {
  if (
    value === undefined
    || value === null
    || (typeof value === "string" && value.trim() === "")
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
    const cleaned = field === undefined
      ? cleanUnknownEditorValue(nested)
      : cleanFieldEditorValue(field, nested);
    if (cleaned !== undefined) {
      return [[key, cleaned] as const];
    }
    return field?.required === true
      ? [[key, cloneEditorValue(nested)] as const]
      : [];
  });
  return entries.length === 0 ? undefined : Object.fromEntries(entries);
}

function cleanFieldEditorValue(
  field: CatalogField,
  value: unknown,
): unknown {
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
