import {
  onGlobalError,
  onGlobalSuccess,
  API_HOST_PREFIX,
} from "../services/serviceHelpers";
import axiosClient from "services/axiosClient";

const api = `${API_HOST_PREFIX}/users/auth`;

/**
 *
 * @param {{name: string,
 * email: string,
 * phone: string,
 * authProvider: number,
 * role: number,
 * password: string,
 * confirmPassword: string}} payload
 * @returns {Promise<{ item: number ,isSuccessful: boolean, transactionId: string}>}
 */
export const usersRegister = async (payload) => {
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
 * @param {{email: string, password: string}} payload
 * @returns {Promise<{item: boolean, isSuccessful: boolean, transactionId: string}>}
 */
export const usersLogin = async (payload) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    url: `${api}/login`,
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
 * @returns {Promise<{
 * item: {id: number, name: string, roles: string[]},
 * isSuccessful: boolean,
 * transactionId: string}>}
 */
export const getCurrentUser = async () => {
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

/**
 *
 * @returns {Promise<{isSuccessful: boolean, transactionId: string}>}
 */
export const usersLogout = async () => {
  const config = {
    method: "POST",
    url: `${api}/logout`,
    withCredentials: true,
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
 * @param {string} email
 * @returns {Promise<{item: boolean, isSuccessful: boolean, transactionId: string}>}
 */
export const userExists = async (email) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    url: `${api}/exists`,
    data: { email },
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
 * @param {string} phone
 * @returns {Promise<{item: boolean, isSuccessful: boolean, transactionId: string}>}
 */
export const phoneExists = async (phone) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    url: `${api}/exists/phone`,
    data: { phone },
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
 * @param {{email: string}} payload
 * @returns {Promise<{isSuccessful: boolean, transactionId: string}>}
 */
export const forgotPassword = async (payload) => {
  const config = {
    method: "POST",
    url: `${api}/forgotPassword`,
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
export const resetPassword = async (payload) => {
  const config = {
    method: "POST",
    url: `${api}/resetPassword`,
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
 * @param {string} token
 * @returns {Promise<{item: boolean, isSuccessful: boolean, transactionId: string}>}
 */
export const validateToken = async (token) => {
  const config = {
    method: "GET",
    url: `${api}/validateToken/${token}`,
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
 * @param {{token: string, password: string, confirmPassword: string}} payload
 * @returns {Promise<{isSuccessful: boolean, transactionId: string}>}
 */
export const changePassword = async (payload) => {
  const config = {
    method: "PUT",
    url: `${api}/changePassword`,
    data: payload,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError()(error);
  }
};
