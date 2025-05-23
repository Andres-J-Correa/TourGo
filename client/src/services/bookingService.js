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

export const getPagedMinimalBookingsByDateRange = async (
  hotelId,
  startDate,
  endDate,
  pageIndex,
  pageSize,
  isArrivalDate,
  sortColumn,
  sortDirection,
  firstName,
  lastName,
  externalBookingId,
  statusId
) => {
  const queryParams = new URLSearchParams({
    pageIndex,
    pageSize,
  });
  if (sortColumn) queryParams.append("sortColumn", sortColumn);
  if (sortDirection) queryParams.append("sortDirection", sortDirection);
  if (startDate) queryParams.append("startDate", startDate);
  if (endDate) queryParams.append("endDate", endDate);
  if (isArrivalDate && startDate && endDate)
    queryParams.append("isArrivalDate", isArrivalDate);
  if (firstName) queryParams.append("firstName", firstName);
  if (lastName) queryParams.append("lastName", lastName);
  if (externalBookingId)
    queryParams.append("externalBookingId", externalBookingId);
  if (statusId) queryParams.append("statusId", statusId);

  const url = `${api}/hotel/${hotelId}/date-range?${queryParams.toString()}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: url,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};

export const getMinimalById = async (bookingId) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${api}/${bookingId}/minimal`,
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

export const update = async (payload) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
    url: `${api}/${payload.id}`,
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

export const getRoomBookingsByBookingId = async (bookingId) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${api}/${bookingId}/room-bookings`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};

export const updateStatusToCheckedIn = async (bookingId) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
    url: `${api}/${bookingId}/check-in`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};

export const updateStatusToNoShow = async (bookingId) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
    url: `${api}/${bookingId}/no-show`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};

export const updateStatusToCompleted = async (bookingId) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
    url: `${api}/${bookingId}/complete`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};

export const updateStatusToCancelled = async (bookingId) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
    url: `${api}/${bookingId}/cancel`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};
