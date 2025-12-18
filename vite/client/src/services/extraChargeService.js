import { onGlobalError, onGlobalSuccess } from "../services/serviceHelpers";
import axiosClient from "services/axiosClient";

const api = `/hotel/{hotelId}/extra-charges`;

/**
 *
 * @param {number} hotelId
 * @param {boolean} isActive nullable
 * @returns {Promise<{id: number, name: string, amount: number, type: { id: number, name: string }}[]>}
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
    url: `${api.replace(/{hotelId}/, hotelId)}?${queryParams.toString()}`,
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
 *
 * @param {{name: string, typeId: number, amount: number}} payload
 * @param {number} hotelId
 * @returns {Promise<{ item: number ,isSuccessful: boolean, transactionId: string}>}
 */
export const add = async (payload, hotelId) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    url: `${api.replace(/{hotelId}/, hotelId)}`,
    data: payload,
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
 * @param {{name: string, typeId: number, amount: number}} payload
 * @param {number} id
 * @param {string} hotelId
 * @returns {Promise<{ item: number ,isSuccessful: boolean, transactionId: string}>}
 */
export const updateById = async (payload, id, hotelId) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
    url: `${api.replace(/{hotelId}/, hotelId)}/${id}`,
    data: payload,
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
 * @param {string} hotelId
 * @returns {Promise<{isSuccessful: boolean, transactionId: string}>}
 */
export const deleteById = async (id, hotelId) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "DELETE",
    url: `${api.replace(/{hotelId}/, hotelId)}/${id}`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};
