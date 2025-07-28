import type { AxiosRequestConfig } from "axios";
import { API_HOST_PREFIX, handleGlobalError } from "./serviceHelpersV2";
import axiosClientV2 from "services/axiosClientV2";

const apiV2: string = `${API_HOST_PREFIX}/hotel/{hotelId}/invoices`;

/**
 * Downloads a PDF invoice by ID and triggers a file download in the browser.
 * @returns void (triggers browser download)
 */
export const downloadInvoicePdf = async (
  invoiceId: string,
  hotelId: string
): Promise<void> => {
  const url = `${apiV2.replace(/{hotelId}/, hotelId)}/${invoiceId}/pdf`;

  const config: AxiosRequestConfig = {
    url,
    method: "GET",
    responseType: "blob",
  };

  try {
    const response = await axiosClientV2<Blob>({
      ...config,
      // Ensure you get headers
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const downloadUrl = window.URL.createObjectURL(blob);

    // Extract filename from Content-Disposition header
    let filename = "invoice.pdf";
    const disposition = response.headers?.["content-disposition"];
    if (disposition) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        filename = match[1].replace(/['"]/g, "");
      }
    }

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename; // Set the filename
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl); // Clean up
  } catch (error: unknown) {
    handleGlobalError(error);
  }
};
