import axiosClient from "./axiosClient";
import axiosClientV2 from "./axiosClientV2";

const pingService = {
  ping: () => axiosClient.get("/ping"),
};

const pingServiceV2 = {
  ping: () => axiosClientV2.get("/ping"),
};

export { pingService, pingServiceV2 };
