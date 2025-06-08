import {
  onGlobalError,
  onGlobalSuccess,
  API_HOST_PREFIX,
} from "../services/serviceHelpers";
import axiosClient from "services/axiosClient";

const api = `${API_HOST_PREFIX}/financial-reports/hotel`;

/**
 * Gets category performance over time for a hotel.
 * @param {number} hotelId - The hotel ID.
 * @param {number} categoryId - The transaction category enum value.
 * @param {string} startDate - Start date (YYYY-MM-DD).
 * @param {string} endDate - End date (YYYY-MM-DD).
 * @param {string} currencyCode - Currency code (e.g., "USD").
 * @returns {Promise<Object>} API response with items array.
 */
export const getCategoryPerformanceOverTime = async (
  hotelId,
  categoryId,
  startDate,
  endDate,
  currencyCode = "COP"
) => {
  const queryParams = new URLSearchParams({
    categoryId,
    startDate,
    endDate,
    currencyCode,
  }).toString();
  const config = {
    headers: { "Content-Type": "application/json" },
    method: "GET",
    url: `${api}/${hotelId}/category-performance?${queryParams}`,
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
 * Gets cost-to-revenue ratio for a hotel.
 * @param {number} hotelId - The hotel ID.
 * @param {number} revenueCategoryId - Revenue category enum value.
 * @param {number} expenseCategoryId - Expense category enum value.
 * @param {string} startDate - Start date (YYYY-MM-DD).
 * @param {string} endDate - End date (YYYY-MM-DD).
 * @param {string} currencyCode - Currency code.
 * @returns {Promise<Object>} API response with items array.
 */
export const getCostToRevenueRatio = async (
  hotelId,
  revenueCategoryId,
  expenseCategoryId,
  startDate,
  endDate,
  currencyCode = "COP"
) => {
  const queryParams = new URLSearchParams({
    revenueCategoryId,
    expenseCategoryId,
    startDate,
    endDate,
    currencyCode,
  }).toString();
  const config = {
    headers: { "Content-Type": "application/json" },
    method: "GET",
    url: `${api}/${hotelId}/cost-to-revenue-ratio?${queryParams}`,
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
 * Gets expense breakdown for a hotel.
 * @param {number} hotelId - The hotel ID.
 * @param {string} startDate - Start date (YYYY-MM-DD).
 * @param {string} endDate - End date (YYYY-MM-DD).
 * @param {string} currencyCode - Currency code.
 * @returns {Promise<Object>} API response with items array.
 */
export const getExpenseBreakdown = async (
  hotelId,
  startDate,
  endDate,
  currencyCode = "COP"
) => {
  const queryParams = new URLSearchParams({
    startDate,
    endDate,
    currencyCode,
  }).toString();
  const config = {
    headers: { "Content-Type": "application/json" },
    method: "GET",
    url: `${api}/${hotelId}/expense-breakdown?${queryParams}`,
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
 * Gets payment methods totals for a hotel.
 * @param {number} hotelId - The hotel ID.
 * @param {string} currencyCode - Currency code.
 * @param {string} startDate - Start date (YYYY-MM-DD).
 * @param {string} endDate - End date (YYYY-MM-DD).
 * @returns {Promise<Object>} API response with items array.
 */
export const getPaymentMethodsTotalsByHotelId = async (
  hotelId,
  startDate,
  endDate,
  currencyCode = "COP"
) => {
  const queryParams = new URLSearchParams({
    currencyCode,
  });

  if (startDate) queryParams.append("startDate", startDate);
  if (endDate) queryParams.append("endDate", endDate);

  const config = {
    headers: { "Content-Type": "application/json" },
    method: "GET",
    url: `${api}/${hotelId}/payment-methods-totals?${queryParams.toString()}`,
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
 * Gets profit and loss summary for a hotel.
 * @param {number} hotelId - The hotel ID.
 * @param {string} startDate - Start date (YYYY-MM-DD).
 * @param {string} endDate - End date (YYYY-MM-DD).
 * @param {string} currencyCode - Currency code.
 * @returns {Promise<Object>} API response with item object.
 */
export const getProfitAndLossSummary = async (
  hotelId,
  startDate,
  endDate,
  currencyCode = "COP"
) => {
  const queryParams = new URLSearchParams({
    startDate,
    endDate,
    currencyCode,
  }).toString();
  const config = {
    headers: { "Content-Type": "application/json" },
    method: "GET",
    url: `${api}/${hotelId}/profit-and-loss-summary?${queryParams}`,
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
 * Gets revenue breakdown for a hotel.
 * @param {number} hotelId - The hotel ID.
 * @param {string} startDate - Start date (YYYY-MM-DD).
 * @param {string} endDate - End date (YYYY-MM-DD).
 * @param {string} currencyCode - Currency code.
 * @returns {Promise<Object>} API response with items array.
 */
export const getRevenueBreakdown = async (
  hotelId,
  startDate,
  endDate,
  currencyCode = "COP"
) => {
  const queryParams = new URLSearchParams({
    startDate,
    endDate,
    currencyCode,
  }).toString();
  const config = {
    headers: { "Content-Type": "application/json" },
    method: "GET",
    url: `${api}/${hotelId}/revenue-breakdown?${queryParams}`,
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
 * Gets subcategory analysis for a hotel.
 * @param {number} hotelId - The hotel ID.
 * @param {number} categoryId - The transaction category enum value.
 * @param {string} startDate - Start date (YYYY-MM-DD).
 * @param {string} endDate - End date (YYYY-MM-DD).
 * @param {string} currencyCode - Currency code.
 * @returns {Promise<Object>} API response with items array.
 */
export const getSubcategoryAnalysis = async (
  hotelId,
  categoryId,
  startDate,
  endDate,
  currencyCode = "COP"
) => {
  const queryParams = new URLSearchParams({
    categoryId,
    startDate,
    endDate,
    currencyCode,
  }).toString();
  const config = {
    headers: { "Content-Type": "application/json" },
    method: "GET",
    url: `${api}/${hotelId}/subcategory-analysis?${queryParams}`,
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
 * Gets utility cost analysis for a hotel.
 * @param {number} hotelId - The hotel ID.
 * @param {string} startDate - Start date (YYYY-MM-DD).
 * @param {string} endDate - End date (YYYY-MM-DD).
 * @param {string} currencyCode - Currency code.
 * @returns {Promise<Object>} API response with items array.
 */
export const getUtilityCostAnalysis = async (
  hotelId,
  startDate,
  endDate,
  currencyCode = "COP"
) => {
  const queryParams = new URLSearchParams({
    startDate,
    endDate,
    currencyCode,
  }).toString();
  const config = {
    headers: { "Content-Type": "application/json" },
    method: "GET",
    url: `${api}/${hotelId}/utility-cost-analysis?${queryParams}`,
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
 * Gets RevPAR over time for a hotel.
 * @param {number} hotelId - The hotel ID.
 * @param {string} startDate - Start date (YYYY-MM-DD).
 * @param {string} endDate - End date (YYYY-MM-DD).
 * @returns {Promise<Object>} API response with items array.
 */
export const getRevPAROverTime = async (hotelId, startDate, endDate) => {
  const queryParams = new URLSearchParams({
    startDate,
    endDate,
  }).toString();
  const config = {
    headers: { "Content-Type": "application/json" },
    method: "GET",
    url: `${api}/${hotelId}/revpar-over-time?${queryParams}`,
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
 * Gets hotel occupancy over time.
 * @param {number} hotelId - The hotel ID.
 * @param {string} startDate - Start date (YYYY-MM-DD).
 * @param {string} endDate - End date (YYYY-MM-DD).
 * @returns {Promise<Object>} API response with items array.
 */
export const getHotelOccupancyOverTime = async (
  hotelId,
  startDate,
  endDate
) => {
  const queryParams = new URLSearchParams({
    startDate,
    endDate,
  }).toString();
  const config = {
    headers: { "Content-Type": "application/json" },
    method: "GET",
    url: `${api}/${hotelId}/occupancy-over-time?${queryParams}`,
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
 * Gets room occupancy by date range.
 * @param {number} hotelId - The hotel ID.
 * @param {number} roomId - The room ID.
 * @param {string} startDate - Start date (YYYY-MM-DD).
 * @param {string} endDate - End date (YYYY-MM-DD).
 * @returns {Promise<Object>} API response with item (decimal).
 */
export const getRoomOccupancyByDateRange = async (
  hotelId,
  roomId,
  startDate,
  endDate
) => {
  const queryParams = new URLSearchParams({
    startDate,
    endDate,
  }).toString();
  const config = {
    headers: { "Content-Type": "application/json" },
    method: "GET",
    url: `${api}/${hotelId}/occupancy/room/${roomId}?${queryParams}`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};
