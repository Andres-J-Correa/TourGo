import {
  onGlobalError,
  onGlobalSuccess,
  replaceEmptyStringsWithNull,
} from "../services/serviceHelpers";
import axiosClient from "services/axiosClient";

const apiV2 = `/hotel/{hotelId}/bookings`;

export const getBookingById = async (bookingId, hotelId) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${apiV2.replace(/{hotelId}/, hotelId)}/${bookingId}`,
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

  const url = `${apiV2.replace(
    /{hotelId}/,
    hotelId
  )}/date-range?${queryParams.toString()}`;

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

export const getMinimalById = async (bookingId, hotelId) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${apiV2.replace(/{hotelId}/, hotelId)}/${bookingId}/minimal`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};

export const updateStatusToCheckedIn = async (bookingId, hotelId) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
    url: `${apiV2.replace(/{hotelId}/, hotelId)}/${bookingId}/check-in`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};

export const updateStatusToNoShow = async (bookingId, hotelId) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
    url: `${apiV2.replace(/{hotelId}/, hotelId)}/${bookingId}/no-show`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};

export const updateStatusToCompleted = async (bookingId, hotelId) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
    url: `${apiV2.replace(/{hotelId}/, hotelId)}/${bookingId}/complete`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};

export const updateStatusToCancelled = async (bookingId, hotelId) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
    url: `${apiV2.replace(/{hotelId}/, hotelId)}/${bookingId}/cancel`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};

export const getChargesByBookingId = async (bookingId, hotelId) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${apiV2.replace(/{hotelId}/, hotelId)}/${bookingId}/extra-charges`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};

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
    url: `${apiV2.replace(
      /{hotelId}/,
      hotelId
    )}/room-bookings?startDate=${startDate}&endDate=${endDate}`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};

export const getArrivals = async (hotelId, date) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${apiV2.replace(/{hotelId}/, hotelId)}/arrivals?date=${date}`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};

export const getDepartures = async (hotelId, date) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${apiV2.replace(/{hotelId}/, hotelId)}/departures?date=${date}`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};

export const getStays = async (hotelId, date) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${apiV2.replace(/{hotelId}/, hotelId)}/stays?date=${date}`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};

export const getArrivingRooms = async (hotelId, date) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${apiV2.replace(/{hotelId}/, hotelId)}/arrivals/rooms?date=${date}`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};

export const getDepartingRooms = async (hotelId, date) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${apiV2.replace(/{hotelId}/, hotelId)}/departures/rooms?date=${date}`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};

export const getForCleaningRooms = async (hotelId, date) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${apiV2.replace(
      /{hotelId}/,
      hotelId
    )}/for-cleaning/rooms?date=${date}`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};

export const update = async (payload, hotelId) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
    url: `${apiV2.replace(/{hotelId}/, hotelId)}/${payload.id}`,
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

export const add = async (payload, hotelId) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    url: `${apiV2.replace(/{hotelId}/, hotelId)}`,
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

export const activateBooking = async (bookingId, hotelId, customerId) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
    url: `${apiV2.replace(/{hotelId}/, hotelId)}/${bookingId}/activate`,
    data: customerId,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};
