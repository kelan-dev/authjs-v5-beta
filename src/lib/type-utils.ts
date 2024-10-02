import { z } from "zod";

// ################################################################################################

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Retrieves a property from an object if it exists and is of the correct type.
 *
 * Example Usage:
 *
 * const token = getProp(response.data, "token", z.string().uuid());
 *
 * const code = getProp(error, "cause.err.code", z.string().nullable());
 *
 * @param obj - The object to retrieve the property from.
 * @param path - The dot notation path to the property.
 * @param schema - The Zod schema to parse the property with.
 * @returns The parsed property value, or undefined if the property does not exist.
 */
export function getProp<T extends z.ZodType>(
  obj: unknown,
  path: string,
  schema: T,
): z.infer<T> | null | undefined {
  const keys = path.split(".");
  let value: unknown = obj;

  for (const key of keys) {
    if (!isObject(value) || !(key in value)) return undefined;
    value = (value as Record<string, unknown>)[key];
  }

  return schema.safeParse(value).success ? schema.parse(value) : undefined;
}
