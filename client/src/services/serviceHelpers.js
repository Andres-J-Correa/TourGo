/**
 * Will unpack the response body from reponse object
 * @param {*} response
 *
 */
const onGlobalSuccess = (response) => {
  /// Should not use if you need access to anything other than the data
  return response.data;
};

const onGlobalError = (err) => {
  var errors = "Unknown";
  if (err && err.response && err.response?.data && err.response?.data.errors) {
    errors = err.response?.data.errors;
  } else if (err.response && err.response?.status) {
    errors = err.response?.status;
  }
  err.appErrors = errors;
  return Promise.reject(err);
};

function replaceEmptyStringsWithNull(data) {
  // Handle null or non-object inputs
  if (data === null || typeof data !== "object") {
    return data;
  }

  // Create a new object to avoid mutating the original
  const result = Array.isArray(data) ? [] : {};

  // Iterate through all properties
  for (const [key, value] of Object.entries(data)) {
    if (value === "") {
      // Replace empty string with null
      result[key] = null;
    } else if (typeof value === "object" && value !== null) {
      // Recursively process nested objects or arrays
      result[key] = replaceEmptyStringsWithNull(value);
    } else {
      // Copy other values as-is
      result[key] = value;
    }
  }

  return result;
}

export { onGlobalError, onGlobalSuccess, replaceEmptyStringsWithNull };
