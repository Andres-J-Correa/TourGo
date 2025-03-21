import {
  onGlobalError,
  onGlobalSuccess,
  API_HOST_PREFIX,
} from "../services/serviceHelpers";
import axiosClient from "services/axiosClient";

const api = `${API_HOST_PREFIX}/hotels`;

/**
 *
 * @param {{name: string,
 * phone: string,
 * address: string,
 * email: string,
 * taxId: string}} payload
 * @returns {Promise<{ item: number ,isSuccessful: boolean, transactionId: string}>}
 */
export const add = async (payload) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    url: `${api}`,
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
 *
 * @param {{name: string,
 * phone: string,
 * address: string,
 * email: string,
 * taxId: string}} payload
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

/**
 * returns a list of hotels with id and name
 * @returns {Promise<{id: number, name: string}[]>}
 */
export const getAll = async () => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${api}`,
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
 * @param {number} id
 * @returns {Promise<{
 *  id: number,
 *  name: string,
 *  phone: string,
 *  address: string,
 *  email: string,
 *  taxId: string,
 *  dateCreated: string,
 *  owner : {
 *   id: number,
 *  firstName: string,
 *  lastName: string}}>}
 */
export const getDetailsById = async (id) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${api}/details/${id}`,
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
 * @returns {Promise<{id: number, name: string}>}
 */
export const getMinimalById = async (id) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
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
