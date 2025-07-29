import type { JSX } from "react";

import { useState } from "react";
import { downloadInvoicePdf } from "services/invoiceServiceV2";
import { useLanguage } from "contexts/LanguageContext";

import { Spinner } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

function DownloadInvoicePdfButton({
  invoiceId,
  hotelId,
  className,
}: {
  invoiceId: string;
  hotelId: string;
  className?: string;
}): JSX.Element {
  const [isDownloading, setIsDownloading] = useState(false);

  const { t } = useLanguage();

  const handleDownload = async (
    e: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    e.preventDefault();
    setIsDownloading(true);
    try {
      await downloadInvoicePdf(invoiceId, hotelId);
    } catch {
      toast.error(t("booking.view.errors.downloadInvoice"));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className={className}>
      {isDownloading ? (
        <>
          {t("common.downloading")} <Spinner size="sm" className="ms-2" />
        </>
      ) : (
        <>
          {t("booking.view.invoice")}
          <FontAwesomeIcon icon={faFilePdf} className="ms-2" />
        </>
      )}
    </button>
  );
}

export default DownloadInvoicePdfButton;
