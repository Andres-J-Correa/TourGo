// Helper function to convert arrays to readable strings
function arrayToReadableString(arr) {
  if (!arr.length) return "None";

  return arr
    .map((item) => {
      if (typeof item === "object" && item !== null) {
        // For objects in arrays, create a readable format (e.g., "name (ID: id)")
        const name = item.name || "Unknown";
        const id = item.id ? `ID: ${item.id}` : "";
        return `${name}${id ? ` (${id})` : ""}`;
      }
      return String(item); // Non-object items are converted to strings
    })
    .join(", "); // Join multiple items with commas
}

export const flattenObject = (obj, prefix = "", result = {}) => {
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}-${key}` : key;

    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      value !== null
    ) {
      // Recursively flatten nested objects
      flattenObject(value, newKey, result);
    } else if (Array.isArray(value)) {
      // Handle arrays by converting them to a readable string
      result[newKey] = arrayToReadableString(value);
    } else {
      // Assign non-object, non-array values directly
      result[newKey] = value;
    }
  }
  return result;
};
