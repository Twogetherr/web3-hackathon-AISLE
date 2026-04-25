import { AppError } from "./errors.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates that a value is a UUID string.
 *
 * @param value The value to validate.
 * @returns The validated UUID string.
 * @throws {AppError} Throws when the value is not a valid UUID.
 */
export function assertValidUuid(value: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new AppError("INVALID_ID", "Product id must be a valid UUID.", 400);
  }

  return value;
}

/**
 * Parses an optional positive numeric query parameter.
 *
 * @param value The raw query-string value.
 * @param fieldName The field name to mention in validation errors.
 * @returns The parsed number, or undefined when the query value is absent.
 * @throws {AppError} Throws when the value is not a positive number.
 */
export function parseOptionalPositiveNumber(
  value: string | undefined,
  fieldName: string
): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    throw new AppError("INVALID_PRICE", `${fieldName} must be greater than 0.`, 400);
  }

  return parsedValue;
}
