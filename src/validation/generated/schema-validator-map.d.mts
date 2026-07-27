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

export const objectSchemaValidators: Readonly<Record<string, Validator>>;
