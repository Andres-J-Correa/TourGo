import axios, { type AxiosInstance, type AxiosError } from "axios";
import axiosRetry, { type IAxiosRetryConfig } from "axios-retry";

const axiosClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_HOST_PREFIX,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const axiosRetryConfig: IAxiosRetryConfig = {
  retries: 3, // Number of retry attempts
  retryDelay: (retryCount: number): number => {
    // Exponential backoff: 1s, 2s, 4s
    return retryCount * 2000;
  },
  retryCondition: (error: AxiosError): boolean => {
    // Retry on network errors
    return axiosRetry.isNetworkError(error);
  },
};

axiosRetry(axiosClient, axiosRetryConfig);

export default axiosClient;
