declare module "./generated/schema-validators.mjs" {
  interface SchemaError {
    instancePath: string;
    schemaPath: string;
    keyword: string;
    params: Record<string, unknown>;
    message?: string;
  }

  interface Validator {
    (value: unknown): boolean;
    errors?: SchemaError[] | null;
  }

  export const validateBundleSchema: Validator;
  export const validateIndicatorSchema: Validator;
}
