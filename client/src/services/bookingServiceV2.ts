import type { AxiosRequestConfig } from "axios";
import type {
  Booking,
  BookingMinimal,
  RoomBooking,
  GetPagedMinimalBookingsByDateRangeParams,
} from "types/entities/booking.types";
import type {
  ApiResponse,
  ItemResponse,
  ItemsResponse,
  PagedResponse,
  SuccessfulResponse,
} from "types/apiResponse.types";

import {
  handleGlobalError,
  //   replaceEmptyStringsWithNull,
} from "./serviceHelpersV2";
import axiosClientV2 from "services/axiosClientV2";

const apiV2: string = `/hotel/{hotelId}/bookings`;

export const getBookingById = async (
  bookingId: string,
  hotelId: string
): Promise<ApiResponse<ItemResponse<Booking>>> => {
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

// Update the function to use the new type
export const getPagedMinimalBookingsByDateRange = async (
  params: GetPagedMinimalBookingsByDateRangeParams
): Promise<ApiResponse<PagedResponse<BookingMinimal>>> => {
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
): Promise<ApiResponse<ItemsResponse<RoomBooking>>> => {
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

export const toggleRoomBookingShouldClean = async (
  roomBooking: Pick<RoomBooking, "bookingId" | "date" | "room">,
  hotelId: string
): Promise<ApiResponse<SuccessfulResponse>> => {
  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
    url: `${apiV2.replace(
      /{hotelId}/,
      hotelId
    )}/room-booking/toggle-should-clean`,
    data: {
      ...roomBooking,
      roomId: roomBooking.room.id,
    },
  };
  try {
    const response = await axiosClientV2<SuccessfulResponse>(config);
    return response.data;
  } catch (error: unknown) {
    return handleGlobalError(error);
  }
};
