import { objectSchemaValidators } from "./generated/schema-validator-map.mjs";
import {
  validateBundleSchema,
  validateIndicatorSchema,
} from "./generated/schema-validators.mjs";

export interface SchemaError {
  readonly instancePath: string;
  readonly schemaPath: string;
  readonly keyword: string;
  readonly params: Readonly<Record<string, unknown>>;
  readonly message?: string;
}

export interface SchemaValidationResult {
  readonly valid: boolean;
  readonly errors: readonly SchemaError[];
}

interface CompiledValidator {
  (value: unknown): boolean;
  errors?: SchemaError[] | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function runSchemaValidator(
  validator: CompiledValidator,
  value: unknown,
): SchemaValidationResult {
  const valid = validator(value);
  return {
    valid,
    errors: validator.errors?.map((error) => ({ ...error })) ?? [],
  };
}

function prefixObjectError(error: SchemaError, objectIndex: number): SchemaError {
  return {
    ...error,
    instancePath: `/objects/${objectIndex}${error.instancePath}`,
  };
}

export function validateCompiledBundle(value: unknown): SchemaValidationResult {
  if (!isRecord(value)) {
    return runSchemaValidator(validateBundleSchema, value);
  }

  const envelope = {
    type: value.type,
    id: value.id,
  };
  const envelopeResult = runSchemaValidator(validateBundleSchema, envelope);
  const errors = [...envelopeResult.errors];
  if (value.objects === undefined) {
    return { valid: errors.length === 0, errors };
  }
  if (!Array.isArray(value.objects)) {
    errors.push({
      instancePath: "/objects",
      schemaPath: "#/properties/objects/type",
      keyword: "type",
      params: { type: "array" },
      message: "must be array",
    });
    return { valid: false, errors };
  }
  if (value.objects.length === 0) {
    errors.push({
      instancePath: "/objects",
      schemaPath: "#/properties/objects/minItems",
      keyword: "minItems",
      params: { limit: 1 },
      message: "must NOT have fewer than 1 items",
    });
  }

  for (const [index, object] of value.objects.entries()) {
    const type =
      isRecord(object) && typeof object.type === "string" ? object.type : undefined;
    const validator = type === undefined ? undefined : objectSchemaValidators[type];
    if (validator === undefined) {
      if (type?.startsWith("x-") === true) {
        continue;
      }
      errors.push({
        instancePath: `/objects/${index}/type`,
        schemaPath: "#/properties/objects/items/type",
        keyword: "enum",
        params: { type },
        message: "must identify a standard STIX 2.1 object schema",
      });
      continue;
    }
    const result = runSchemaValidator(validator, object);
    errors.push(...result.errors.map((error) => prefixObjectError(error, index)));
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateCompiledIndicator(value: unknown): SchemaValidationResult {
  return runSchemaValidator(validateIndicatorSchema, value);
}
