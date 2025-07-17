import type { AxiosRequestConfig } from "axios";
import type { ErrorResponse, ItemsResponse } from "types/apiResponse.types";
import type { Room } from "types/entities/room.types";

import { API_HOST_PREFIX, handleGlobalError } from "./serviceHelpersV2";
import axiosClientV2 from "services/axiosClientV2";

const apiV2: string = `${API_HOST_PREFIX}/hotel/{hotelId}/rooms`;

export const getByHotelId = async (
  hotelId: string,
  isActive?: boolean
): Promise<ItemsResponse<Room[]> | ErrorResponse> => {
  const queryParams = new URLSearchParams();
  if (isActive) {
    queryParams.append("isActive", isActive.toString());
  }

  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${apiV2.replace(/{hotelId}/, hotelId)}?${queryParams.toString()}`,
  };
  try {
    const response = await axiosClientV2<ItemsResponse<Room[]>>(config);
    return response.data;
  } catch (error: unknown) {
    return handleGlobalError(error);
  }
};
