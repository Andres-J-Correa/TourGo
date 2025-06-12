import axios from "axios";
import axiosRetry from "axios-retry";

const axiosClient = axios.create();

axiosClient.defaults.withCredentials = true;
// Add a request interceptor
axios.interceptors.request.use(function (config) {
  config.withCredentials = true;
  return config;
});

axiosRetry(axiosClient, {
  retries: 3, // Number of retry attempts
  retryDelay: (retryCount) => {
    // Exponential backoff: 1s, 2s, 4s
    return retryCount * 2000;
  },
  retryCondition: (error) => {
    // Retry on network errors or idempotent requests
    return axiosRetry.isNetworkOrIdempotentRequestError(error);
  },
});

export default axiosClient;
