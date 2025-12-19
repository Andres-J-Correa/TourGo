import type { AxiosRequestConfig } from "axios";
import type { ApiResponse, ItemsResponse } from "types/apiResponse.types";
import type { ExtraCharge } from "types/entities/extraCharge.types";

import { handleGlobalError, handleGlobalSuccess } from "./serviceHelpersV2";
import axiosClientV2 from "services/axiosClientV2";

const api = `/hotel/{hotelId}/extra-charges`;

export const getByHotelId = async (
  hotelId: string,
  isActive: boolean
): Promise<ApiResponse<ItemsResponse<ExtraCharge>>> => {
  const queryParams = new URLSearchParams();
  if (isActive !== undefined && isActive !== null) {
    queryParams.append("isActive", isActive.toString());
  }

  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${api.replace(/{hotelId}/, hotelId)}?${queryParams.toString()}`,
  };
  try {
    const response = await axiosClientV2<ItemsResponse<ExtraCharge>>(config);
    handleGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return handleGlobalError(error);
  }
};
