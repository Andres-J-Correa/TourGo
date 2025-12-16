import axios from "axios";
import axiosRetry from "axios-retry";

const axiosClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosRetry(axiosClient, {
  retries: 3, // Number of retry attempts
  retryDelay: (retryCount) => {
    // Exponential backoff: 1s, 2s, 4s
    return retryCount * 2000;
  },
  retryCondition: (error) => {
    // Retry on network errors
    return axiosRetry.isNetworkError(error);
  },
});

export default axiosClient;
