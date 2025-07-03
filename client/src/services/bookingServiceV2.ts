import type { Booking, BookingMinimal } from "@/types/entities/booking.types";
import type {
  ItemResponse,
  ErrorResponse,
  PagedResponse,
} from "@/types/apiResponse.types";

import {
  onGlobalError,
  onGlobalSuccess,
  API_HOST_PREFIX,
  //   replaceEmptyStringsWithNull,
} from "./serviceHelpersV2";
import axiosClient from "services/axiosClient";

const apiV2: string = `${API_HOST_PREFIX}/hotel/{hotelId}/bookings`;

export const getBookingById = async (
  bookingId: string,
  hotelId: string
): Promise<Partial<ItemResponse<Booking>>> => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${apiV2.replace(/{hotelId}/, hotelId)}/${bookingId}`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data as ItemResponse<Booking>;
  } catch (error: unknown) {
    return onGlobalError(error as ErrorResponse);
  }
};

export const getPagedMinimalBookingsByDateRange = async (
  hotelId: string,
  pageIndex: number,
  pageSize: number,
  startDate?: string | null,
  endDate?: string | null,
  isArrivalDate?: boolean | null,
  sortColumn?: string | null,
  sortDirection?: string | null,
  firstName?: string | null,
  lastName?: string | null,
  externalBookingId?: string | null,
  statusId?: number | null
): Promise<Partial<PagedResponse<BookingMinimal>>> => {
  const queryParams = new URLSearchParams({
    pageIndex: pageIndex.toString(),
    pageSize: pageSize.toString(),
  });
  if (sortColumn) queryParams.append("sortColumn", sortColumn);
  if (sortDirection) queryParams.append("sortDirection", sortDirection);
  if (startDate) queryParams.append("startDate", startDate);
  if (endDate) queryParams.append("endDate", endDate);
  if (isArrivalDate && startDate && endDate)
    queryParams.append("isArrivalDate", isArrivalDate.toString());
  if (firstName) queryParams.append("firstName", firstName);
  if (lastName) queryParams.append("lastName", lastName);
  if (externalBookingId)
    queryParams.append("externalBookingId", externalBookingId);
  if (statusId) queryParams.append("statusId", statusId.toString());

  const url = `${apiV2.replace(
    /{hotelId}/,
    hotelId
  )}/date-range?${queryParams.toString()}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: url,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data as PagedResponse<BookingMinimal>;
  } catch (error) {
    return onGlobalError(error as ErrorResponse);
  }
};
