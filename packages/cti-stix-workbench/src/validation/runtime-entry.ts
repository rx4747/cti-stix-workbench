import { parseStixPattern } from "./pattern-validator.js";
import {
  validateCompiledBundle,
  validateCompiledIndicator,
} from "./schema-runtime.js";

interface ValidationResult<TError> {
  valid: boolean;
  errors: TError[];
}

export function validateBundle(
  value: unknown,
): ReturnType<typeof validateCompiledBundle> {
  return validateCompiledBundle(value);
}

export function validateIndicator(
  value: unknown,
): ReturnType<typeof validateCompiledIndicator> {
  return validateCompiledIndicator(value);
}

export function validatePattern(input: string): ValidationResult<ReturnType<typeof parseStixPattern>[number]> {
  const errors = parseStixPattern(input);
  return { valid: errors.length === 0, errors };
}
