/**
 * Will unpack the response body from reponse object
 * @param {*} response
 *
 */

const onGlobalSuccess = <T extends { data?: unknown }>(
  response: T
): T["data"] | T => {
  /// Should not use if you need access to anything other than the data
  return response.data ?? response;
};

const onGlobalError = <T>(err: T): Promise<T> => {
  return Promise.reject(err);
};

const API_HOST_PREFIX = process.env.REACT_APP_API_HOST_PREFIX;

type ReplaceEmptyWithNull<T> = T extends ""
  ? null // replace empty string
  : T extends Array<infer U>
  ? Array<ReplaceEmptyWithNull<U>> // handle arrays
  : T extends object
  ? {
      [K in keyof T]: ReplaceEmptyWithNull<T[K]>;
    }
  : T;

function replaceEmptyStringsWithNull<T>(data: T): ReplaceEmptyWithNull<T> {
  if (data === null || typeof data !== "object") {
    return (data === "" ? null : data) as ReplaceEmptyWithNull<T>;
  }

  const isArray = Array.isArray(data);

  const result = (isArray ? [] : {}) as ReplaceEmptyWithNull<T>;

  for (const [key, value] of Object.entries(data)) {
    const val =
      value === ""
        ? null
        : typeof value === "object" && value !== null
        ? replaceEmptyStringsWithNull(value)
        : value;

    if (isArray) {
      (result as unknown as unknown[]).push(val);
    } else {
      (result as any)[key] = val;
    }
  }

  return result;
}

export {
  onGlobalError,
  onGlobalSuccess,
  API_HOST_PREFIX,
  replaceEmptyStringsWithNull,
};
