import axios from "axios";

const axiosClient = axios.create();

axiosClient.defaults.withCredentials = true;
// Add a request interceptor
axios.interceptors.request.use(function (config) {
  config.withCredentials = true;
  return config;
});

export default axiosClient;
