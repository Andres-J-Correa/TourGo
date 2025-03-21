import {
  onGlobalError,
  onGlobalSuccess,
  API_HOST_PREFIX,
} from "../services/serviceHelpers";
import axiosClient from "services/axiosClient";

const api = `${API_HOST_PREFIX}/extra-charges`;

/**
 *
 * @param {number} hotelId
 * @returns {Promise<{id: number, name: string, amount: number, type: { id: number, name: string }}[]>}
 */
export const getByHotelId = async (hotelId) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${api}/hotel/${hotelId}`,
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
    url: `${api}/hotel/${hotelId}`,
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
 * @returns {Promise<{isSuccessful: boolean, transactionId: string}>}
 */
export const updateById = async (payload, id) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
    url: `${api}/${id}`,
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
