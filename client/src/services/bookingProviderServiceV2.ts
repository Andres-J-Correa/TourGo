import type { AxiosRequestConfig } from "axios";
import type { ApiResponse, ItemsResponse } from "types/apiResponse.types";
import type { BookingProviderMinimal } from "types/entities/bookingProviders.types";

import {
  API_HOST_PREFIX,
  handleGlobalError,
  handleGlobalSuccess,
} from "./serviceHelpersV2";
import axiosClientV2 from "services/axiosClientV2";

const api = `${API_HOST_PREFIX}/hotel/{hotelId}/booking-providers`;

export const getBookingProvidersMinimalByHotelId = async (
  hotelId: string
): Promise<ApiResponse<ItemsResponse<BookingProviderMinimal>>> => {
  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${api.replace(/{hotelId}/, hotelId)}/minimal`,
  };
  try {
    const response = await axiosClientV2<ItemsResponse<BookingProviderMinimal>>(
      config
    );
    handleGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return handleGlobalError(error);
  }
};
