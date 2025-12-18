export const flattenObject = (
  obj: Record<string, any>,
  prefix: string = "",
  result: Record<string, any> = {}
): Record<string, any> => {
  for (const [key, value] of Object.entries(obj)) {
    const newKey: string = prefix ? `${prefix}-${key}` : key;

    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      value !== null
    ) {
      // Recursively flatten nested objects
      flattenObject(value, newKey, result);
    } else {
      // Assign non-object values directly
      result[newKey] = value;
    }
  }
  return result;
};
