import {
  onGlobalError,
  onGlobalSuccess,
  API_HOST_PREFIX,
  replaceEmptyStringsWithNull,
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
    url: `${api}/${id}/details`,
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

/**
 * @param {number} id
 * @returns {Promise<{id: number, name: string, roleId: number}>}
 */
export const getMinimalWithUserRoleById = async (id) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${api}/minimal/${id}`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};

export const getAllRolePermissions = async () => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${api}/roles/permissions`,
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
 * @param {string} hotelId
 * @param {{terms:string}} payload
 * @returns {Promise<{isSuccessful: boolean, transactionId: string}>}
 */
export const upsertInvoicesTC = async (hotelId, payload) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    url: `${api}/${hotelId}/invoices-tc`,
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
 * @param {string} hotelId
 * @returns {Promise<{
 *  isSuccessful: boolean,
 *  transactionId: string,
 *  item: {
 *    terms: string,
 *    dateCreated: string,
 *    dateModified: string,
 *    modifiedBy:{
 *      id: string,
 *      firstName: string,
 *      lastName: string
 *    },
 *    createdBy:{
 *      id: string,
 *      firstName: string,
 *      lastName: string
 *    }
 *  }
 *}}
 */
export const getInvoicesTC = async (hotelId) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${api}/${hotelId}/invoices-tc`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};
