import type { AxiosRequestConfig } from "axios";
import type {
  ApiResponse,
  ItemResponse,
  SuccessfulResponse,
} from "types/apiResponse.types";
import type { Customer, CustomerPayload } from "types/customer.types";

import {
  handleGlobalError,
  handleGlobalSuccess,
  replaceEmptyStringsWithNull,
} from "./serviceHelpersV2";
import axiosClientV2 from "services/axiosClientV2";

const api = `/customers`;

export const getByDocumentNumber = async (
  hotelId: string,
  documentNumber: string
): Promise<ApiResponse<ItemResponse<Customer>>> => {
  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    url: `${api}/hotel/${hotelId}/dn`,
    data: {
      id: documentNumber,
    },
  };
  try {
    const response = await axiosClientV2<ItemResponse<Customer>>(config);
    return handleGlobalSuccess(response);
  } catch (error) {
    return handleGlobalError(error);
  }
};

export const add = async (
  payload: CustomerPayload,
  hotelId: string
): Promise<ApiResponse<ItemResponse<number>>> => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    url: `${api}/hotel/${hotelId}`,
    data: replaceEmptyStringsWithNull(payload),
  };
  try {
    const response = await axiosClientV2<ItemResponse<number>>(config);
    return handleGlobalSuccess(response);
  } catch (error) {
    return handleGlobalError(error);
  }
};

export const update = async (
  payload: CustomerPayload,
  hotelId: string,
  customerId: number
): Promise<ApiResponse<SuccessfulResponse>> => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
    url: `${api}/${customerId}/hotel/${hotelId}`,
    data: replaceEmptyStringsWithNull(payload),
  };
  try {
    const response = await axiosClientV2<SuccessfulResponse>(config);
    return handleGlobalSuccess(response);
  } catch (error) {
    return handleGlobalError(error);
  }
};
