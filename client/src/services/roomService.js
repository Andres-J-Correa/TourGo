import {
  onGlobalError,
  onGlobalSuccess,
  API_HOST_PREFIX,
  replaceEmptyStringsWithNull,
} from "../services/serviceHelpers";
import axiosClient from "services/axiosClient";

const api = `${API_HOST_PREFIX}/rooms`;

/**
 *
 * @param {number} hotelId
 * @param {boolean} isActive nullable
 * @returns {Promise<{id: number, name: string, description: string, capacity: number}[]>}
 */
export const getByHotelId = async (hotelId, isActive) => {
  const queryParams = new URLSearchParams();
  if (isActive !== undefined && isActive !== null) {
    queryParams.append("isActive", isActive);
  }

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${api}/hotel/${hotelId}?${queryParams.toString()}`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};

/**
 * @param {{name: string, description: string, capacity: number}} payload
 * @param {number} hotelId
 * @returns {Promise<{item: number, isSuccessful: boolean, transactionId: string}>}
 * */
export const add = async (payload, hotelId) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    url: `${api}/hotel/${hotelId}`,
    data: replaceEmptyStringsWithNull(payload),
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};

/**
 * @param {{name: string, description: string, capacity: number}} payload
 * @param {number} id
 * @returns {Promise<{item: number, isSuccessful: boolean, transactionId: string}>}
 */
export const updateById = async (payload, id) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
    url: `${api}/${id}`,
    data: replaceEmptyStringsWithNull(payload),
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};

/**
 * @param {number} id
 * @returns {Promise<{isSuccessful: boolean, transactionId: string}>}
 */
export const deleteById = async (id) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "DELETE",
    url: `${api}/${id}`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};
