import { onGlobalError, onGlobalSuccess } from "../services/serviceHelpers";
import axiosClient from "services/axiosClient";

const api = `/hotel/{hotelId}/invoices`;

export const getWithEntitiesById = async (id, hotelId) => {
  const config = {
    method: "GET",
    url: `${api.replace(/{hotelId}/, hotelId)}/${id}/entities`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};
