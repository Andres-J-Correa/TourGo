import type { AxiosError } from "axios";

export interface BaseResponse {
  isSuccessful: boolean;
  transactionId: string;
}
export interface SuccessfulResponse extends BaseResponse {
  isSuccessful: true;
}

export interface ItemResponse<T> extends SuccessfulResponse {
  item: T;
}

export interface ItemsResponse<T> extends SuccessfulResponse {
  items: T[];
}

export interface ErrorResponse extends BaseResponse {
  errors: string[];
  code: number;
  error: AxiosError;
  isSuccessful: false;
}

export interface PagedResponse<T> extends SuccessfulResponse {
  item: {
    pagedItems: T[];
    totalCount: number;
    pageIndex: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export type ApiResponse<T> = T extends SuccessfulResponse
  ? T | ErrorResponse
  : never;
