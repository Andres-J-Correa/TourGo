import {
  onGlobalError,
  onGlobalSuccess,
  API_HOST_PREFIX,
  replaceEmptyStringsWithNull,
} from "../services/serviceHelpers";
import axiosClient from "services/axiosClient";

const api = `${API_HOST_PREFIX}/transactions`;

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

export const reverse = (txnId) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
    url: `${api}/${txnId}/reverse`,
  };
  return axiosClient(config)
    .then((response) => {
      onGlobalSuccess(response);
      return response.data;
    })
    .catch((error) => onGlobalError(error));
};

export const getByEntityId = async (entityId, hotelId) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${api}/hotel/${hotelId}/entity/${entityId}`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};

export const getSupportDocumentUrl = async (transactionId) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${api}/${transactionId}/document-url`,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};

export const updateDocumentUrl = async (file, categoryId, transactionId) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("categoryId", categoryId);
  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    method: "PUT",
    url: `${api}/${transactionId}/document-url`,
    data: formData,
  };
  try {
    const response = await axiosClient(config);
    onGlobalSuccess(response);
    return response.data;
  } catch (error) {
    return onGlobalError(error);
  }
};

export const getPagedTransactions = async (
  hotelId,
  pageIndex,
  pageSize,
  sortColumn,
  sortDirection,
  startDate,
  endDate,
  categoryId,
  statusId,
  subcategoryId,
  financePartnerId,
  paymentMethodId,
  txnId,
  referenceNumber,
  description,
  entityId,
  hasDocumentUrl,
  parentId
) => {
  const queryParams = new URLSearchParams({
    pageIndex,
    pageSize,
  });

  if (sortColumn) queryParams.append("sortColumn", sortColumn);
  if (sortDirection) queryParams.append("sortDirection", sortDirection);
  if (startDate) queryParams.append("startDate", startDate);
  if (endDate) queryParams.append("endDate", endDate);
  if (txnId) queryParams.append("txnId", txnId);
  if (parentId) queryParams.append("parentId", parentId);
  if (entityId) queryParams.append("entityId", entityId);
  if (categoryId) queryParams.append("categoryId", categoryId);
  if (statusId) queryParams.append("statusId", statusId);
  if (referenceNumber) queryParams.append("referenceNumber", referenceNumber);
  if (description) queryParams.append("description", description);
  if (hasDocumentUrl) queryParams.append("hasDocumentUrl", hasDocumentUrl);
  if (paymentMethodId) queryParams.append("paymentMethodId", paymentMethodId);
  if (subcategoryId) queryParams.append("subcategoryId", subcategoryId);
  if (financePartnerId)
    queryParams.append("financePartnerId", financePartnerId);

  const url = `${api}/hotel/${hotelId}/paginated?${queryParams.toString()}`;

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

export const getFixedPagination = async (
  hotelId,
  pageIndex,
  pageSize,
  sortColumn,
  sortDirection
) => {
  const queryParams = new URLSearchParams({
    pageIndex,
    pageSize,
  });

  if (sortColumn) queryParams.append("sortColumn", sortColumn);
  if (sortDirection) queryParams.append("sortDirection", sortDirection);

  const url = `${api}/hotel/${hotelId}/pagination?${queryParams.toString()}`;

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
