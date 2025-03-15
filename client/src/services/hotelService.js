import {
  onGlobalError,
  onGlobalSuccess,
  API_HOST_PREFIX,
} from "../services/serviceHelpers";
import axiosClient from "services/axiosClient";

const api = `${API_HOST_PREFIX}/hotels`;

/**
 * @returns {Promise<{ item:
 *  {id: number,
 *  name: string,
 * }  ,isSuccessful: boolean, transactionId: string}>}
 */
export const getCurrentHotel = async () => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${api}/current`,
  };

  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};
