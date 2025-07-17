import axios, { AxiosError, AxiosHeaders } from "axios";

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

export const handleGlobalError = (error: unknown): ErrorResponse => {
  if (axios.isAxiosError(error) && isErrorResponse(error.response?.data)) {
    return error.response.data;
  } else if (axios.isAxiosError(error)) {
    return {
      isSuccessful: false,
      errors: ["An unexpected error occurred."],
      code: ERROR_CODES.UNKNOWN_ERROR,
      error,
    };
  } else {
    const axiosError = new AxiosError();
    axiosError.response = {
      status: 500,
      statusText: "Internal Server Error",
      data: null,
      config: {
        headers: new AxiosHeaders({
          "Content-Type": "application/json",
        }),
      },
      headers: new AxiosHeaders(),
    };

    return {
      isSuccessful: false,
      errors: ["An unexpected error occurred."],
      code: ERROR_CODES.UNKNOWN_ERROR,
      error: axiosError,
    };
  }
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
