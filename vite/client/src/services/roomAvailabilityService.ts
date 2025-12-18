import type { AxiosRequestConfig } from "axios";
import type {
  RoomAvailabilityRequest,
  RoomAvailability,
} from "types/entities/roomAvailability.types";

import type {
  ApiResponse,
  SuccessfulResponse,
  ItemsResponse,
} from "types/apiResponse.types";

import { handleGlobalError } from "./serviceHelpersV2";
import axiosClientV2 from "services/axiosClientV2";

const apiV2: string = `/hotel/{hotelId}/room-availability`;

export const upsertRoomAvailability = async (
  hotelId: string,
  roomAvailabilityRequest: RoomAvailabilityRequest
): Promise<ApiResponse<SuccessfulResponse>> => {
  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    url: `${apiV2.replace(/{hotelId}/, hotelId)}`,
    data: roomAvailabilityRequest,
  };
  try {
    const response = await axiosClientV2<SuccessfulResponse>(config);
    return response.data;
  } catch (error: unknown) {
    return handleGlobalError(error);
  }
};

export const getRoomAvailabilityByDateRange = async (
  hotelId: string,
  startDate: string,
  endDate: string
): Promise<ApiResponse<ItemsResponse<RoomAvailability>>> => {
  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${apiV2.replace(/{hotelId}/, hotelId)}/date-range`,
    params: {
      startDate,
      endDate,
    },
  };
  try {
    const response = await axiosClientV2<ItemsResponse<RoomAvailability>>(
      config
    );
    return response.data;
  } catch (error: unknown) {
    return handleGlobalError(error);
  }
};
