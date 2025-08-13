import axios, { AxiosError, type AxiosResponse } from "axios";

import type { ErrorResponse } from "types/apiResponse.types";

import { ERROR_CODES } from "constants/errorCodes";

const API_HOST_PREFIX = process.env.REACT_APP_API_HOST_PREFIX;

const isErrorResponse = (data: unknown): data is ErrorResponse => {
  return (
    typeof data === "object" &&
    data !== null &&
    "errors" in data &&
    "code" in data &&
    "isSuccessful" in data &&
    "transactionId" in data
  );
};

export const handleGlobalSuccess = <T>(res: AxiosResponse<T>): T => {
  return res.data;
};

export const handleGlobalError = (error: unknown): ErrorResponse => {
  if (axios.isAxiosError(error) && isErrorResponse(error.response?.data)) {
    return { ...error.response.data, error: error };
  }

  const baseErrorResponse: Omit<ErrorResponse, "error"> = {
    isSuccessful: false,
    transactionId: "",
    errors: ["An unexpected error occurred."],
    code: ERROR_CODES.UNKNOWN_ERROR,
  };

  if (axios.isAxiosError(error)) {
    // Case 2: It's an Axios error but does not have a valid ErrorResponse
    return {
      ...baseErrorResponse,
      error, // keep the real Axios error
    };
  }

  // Case 3: Not an Axios error, preserve original error as much as possible
  const wrappedError =
    error instanceof Error ? error : new Error(String(error));

  return {
    ...baseErrorResponse,
    error: wrappedError as unknown as AxiosError, // Cast for type safety, but keep real error
  };
};

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

export { API_HOST_PREFIX, replaceEmptyStringsWithNull };
