export interface BaseResponse {
  isSuccessful: boolean;
  transactionId?: string;
}

export interface ItemResponse<T> extends BaseResponse {
  item: T;
}

export interface ItemsResponse<T> extends BaseResponse {
  items: T[];
}

export interface ErrorResponse extends BaseResponse {
  errors: string[];
  code: number;
}

export interface PagedResponse<T> extends BaseResponse {
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
