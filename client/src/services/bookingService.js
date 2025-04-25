import {
  onGlobalError,
  onGlobalSuccess,
  API_HOST_PREFIX,
  replaceEmptyStringsWithNull,
} from "../services/serviceHelpers";
import axiosClient from "services/axiosClient";

const api = `${API_HOST_PREFIX}/bookings`;

export const getRoomBookingsByDateRange = async (
  hotelId,
  startDate,
  endDate
) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${api}/hotel/${hotelId}/room-bookings?startDate=${startDate}&endDate=${endDate}`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};

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

export const getById = async (bookingId) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${api}/${bookingId}`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};

export const getChargesByBookingId = async (bookingId) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${api}/${bookingId}/extra-charges`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};
