export interface ExtensionRegistry {
  readonly version: 1;
  readonly objectTypes: ReadonlySet<string>;
  readonly properties: ReadonlySet<string>;
  readonly extensionDefinitions: ReadonlySet<string>;
}

const CUSTOM_OBJECT_TYPE = /^x-[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const CUSTOM_PROPERTY = /^x_[a-z0-9]+(?:_[a-z0-9]+)*$/u;
const EXTENSION_DEFINITION_ID =
  /^extension-definition--[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function stringSet(
  value: unknown,
  field: string,
  pattern: RegExp,
): ReadonlySet<string> {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new TypeError(`${field} must be an array of strings.`);
  }
  const values = value as string[];
  for (const item of values) {
    if (!pattern.test(item)) {
      throw new TypeError(`${field} contains invalid value "${item}".`);
    }
  }
  if (new Set(values).size !== values.length) {
    throw new TypeError(`${field} cannot contain duplicates.`);
  }
  return new Set(values);
}

export function parseExtensionRegistry(input: string): ExtensionRegistry {
  let value: unknown;
  try {
    value = JSON.parse(input) as unknown;
  } catch (error) {
    throw new SyntaxError("The extension registry is not valid JSON.", {
      cause: error,
    });
  }
  if (!isRecord(value) || value.version !== 1) {
    throw new TypeError("The extension registry requires version 1.");
  }
  return Object.freeze({
    version: 1 as const,
    objectTypes: stringSet(
      value.object_types ?? [],
      "object_types",
      CUSTOM_OBJECT_TYPE,
    ),
    properties: stringSet(value.properties ?? [], "properties", CUSTOM_PROPERTY),
    extensionDefinitions: stringSet(
      value.extension_definitions ?? [],
      "extension_definitions",
      EXTENSION_DEFINITION_ID,
    ),
  });
}

export function isCustomObjectType(value: string): boolean {
  return CUSTOM_OBJECT_TYPE.test(value);
}

export function isCustomProperty(value: string): boolean {
  return CUSTOM_PROPERTY.test(value);
}

export function isExtensionDefinitionId(value: string): boolean {
  return EXTENSION_DEFINITION_ID.test(value);
}
