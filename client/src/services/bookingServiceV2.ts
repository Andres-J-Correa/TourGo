import type { AxiosRequestConfig } from "axios";
import type {
  Booking,
  BookingMinimal,
  RoomBooking,
} from "types/entities/booking.types";
import type {
  ErrorResponse,
  ItemResponse,
  ItemsResponse,
  PagedResponse,
} from "types/apiResponse.types";

import {
  API_HOST_PREFIX,
  handleGlobalError,
  //   replaceEmptyStringsWithNull,
} from "./serviceHelpersV2";
import axiosClientV2 from "services/axiosClientV2";
import { BOOKING_VIEW_SORT_OPTIONS } from "components/bookings/bookings-view/constants";

const apiV2: string = `${API_HOST_PREFIX}/hotel/{hotelId}/bookings`;

export const getBookingById = async (
  bookingId: string,
  hotelId: string
): Promise<ItemResponse<Booking> | ErrorResponse> => {
  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${apiV2.replace(/{hotelId}/, hotelId)}/${bookingId}`,
  };
  try {
    const response = await axiosClientV2<ItemResponse<Booking>>(config);
    return response.data;
  } catch (error: unknown) {
    return handleGlobalError(error);
  }
};

export type GetPagedMinimalBookingsByDateRangeParams = {
  hotelId: string;
  pageIndex: number;
  pageSize: number;
  startDate?: string;
  endDate?: string;
  isArrivalDate?: boolean;
  sortColumn?: keyof typeof BOOKING_VIEW_SORT_OPTIONS;
  sortDirection: "ASC" | "DESC";
  firstName?: string;
  lastName?: string;
  externalBookingId?: string;
  statusId?: string;
  bookingId?: string;
};

// Update the function to use the new type
export const getPagedMinimalBookingsByDateRange = async (
  params: GetPagedMinimalBookingsByDateRangeParams
): Promise<PagedResponse<BookingMinimal> | ErrorResponse> => {
  const {
    hotelId,
    pageIndex,
    pageSize,
    startDate,
    endDate,
    isArrivalDate,
    sortColumn,
    sortDirection,
    firstName,
    lastName,
    externalBookingId,
    statusId,
    bookingId,
  } = params;
  const queryParams = new URLSearchParams({
    pageIndex: pageIndex.toString(),
    pageSize: pageSize.toString(),
  });
  if (sortColumn) {
    queryParams.append("sortColumn", sortColumn);
    queryParams.append("sortDirection", sortDirection);
  }
  if (startDate) queryParams.append("startDate", startDate);
  if (endDate) queryParams.append("endDate", endDate);
  if (isArrivalDate)
    queryParams.append("isArrivalDate", isArrivalDate.toString());
  if (firstName) queryParams.append("firstName", firstName);
  if (lastName) queryParams.append("lastName", lastName);
  if (externalBookingId)
    queryParams.append("externalBookingId", externalBookingId);
  if (statusId) queryParams.append("statusId", statusId);
  if (bookingId) queryParams.append("bookingId", bookingId);

  const url = `${apiV2.replace(
    /{hotelId}/,
    hotelId
  )}/date-range?${queryParams.toString()}`;

  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: url,
  };
  try {
    const response = await axiosClientV2<PagedResponse<BookingMinimal>>(config);

    return response.data;
  } catch (error: unknown) {
    return handleGlobalError(error);
  }
};

export const getRoomBookingsByDateRange = async (
  hotelId: string,
  startDate: string,
  endDate: string
): Promise<ItemsResponse<RoomBooking> | ErrorResponse> => {
  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${apiV2.replace(
      /{hotelId}/,
      hotelId
    )}/room-bookings?startDate=${startDate}&endDate=${endDate}`,
  };
  try {
    const response = await axiosClientV2<ItemsResponse<RoomBooking>>(config);
    return response.data;
  } catch (error: unknown) {
    return handleGlobalError(error);
  }
};
