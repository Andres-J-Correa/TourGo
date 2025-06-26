import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Row, Col, Button } from "reactstrap";
import dayjs from "dayjs";
import Swal from "sweetalert2";

import Dropzone from "components/commonUI/forms/Dropzone";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import SupportDocumentModal from "components/transactions/SupportDocumentModal";
import TransactionVersionsOffCanvas from "components/transactions/TransactionVersionsOffCanvas";

import {
  TRANSACTION_CATEGORIES_BY_ID,
  TRANSACTION_STATUS_BY_ID,
  TRANSACTION_STATUS_IDS,
} from "components/transactions/constants";
import {
  getSupportDocumentUrl,
  updateDocumentUrl,
  reverse,
  updateDescription,
} from "services/transactionService";
import { compressImage } from "utils/fileHelper";
import { useLanguage } from "contexts/LanguageContext";
import { formatCurrency } from "utils/currencyHelper";

const TransactionDetails = ({
  txn,
  updateHasDocumentUrl,
  onReverseSuccess,
  onEditDescriptionSuccess,
  onEditTransaction,
}) => {
  const [files, setFiles] = useState([]);
  const [showUploader, setShowUploader] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [documentUrl, setDocumentUrl] = useState(null);
  const [offCanvasOpen, setOffcanvasOpen] = useState(false);

  const { t, getTranslatedErrorMessage } = useLanguage();

  const { hotelId } = useParams();

  const category = TRANSACTION_CATEGORIES_BY_ID[txn.categoryId]
    ? t(TRANSACTION_CATEGORIES_BY_ID[txn.categoryId])
    : t("transactions.details.unknown");

  const status = TRANSACTION_STATUS_BY_ID[txn.statusId]
    ? t(TRANSACTION_STATUS_BY_ID[txn.statusId])
    : t("transactions.details.unknown");

  const handleToggleOffcanvas = () => {
    setOffcanvasOpen((prev) => !prev);
  };

  const handleViewDocument = async () => {
    setIsLoading(true);
    try {
      const response = await getSupportDocumentUrl(txn.id, hotelId);

      if (response.isSuccessful) {
        setDocumentUrl(response.item);
        setModalOpen(true);
      } else {
        throw new Error("Error loading document");
      }
    } catch {
      Swal.fire(
        t("common.error"),
        t("transactions.details.loadDocumentError"),
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSubmit = async () => {
    const result = await Swal.fire({
      title: t("transactions.details.uploadTitle"),
      text: t("transactions.details.uploadText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("transactions.details.uploadConfirm"),
      cancelButtonText: t("common.cancel"),
      reverseButtons: true,
    });

    if (!result.isConfirmed || files.length === 0) return;

    const file = files[0];

    try {
      setSubmitting(true);
      Swal.fire({
        title: t("transactions.details.uploadingTitle"),
        text: t("transactions.details.uploadingText"),
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const compressedFile = await compressImage(file, 35 * 1024); // 35 KB

      const uploadResponse = await updateDocumentUrl(
        compressedFile,
        txn.id,
        txn.amount,
        hotelId
      );

      if (uploadResponse.isSuccessful) {
        updateHasDocumentUrl(txn.id, true);
        Swal.fire(
          t("common.success"),
          t("transactions.details.uploadSuccess"),
          "success"
        );
        setShowUploader(false);
      } else {
        throw new Error("Upload failed");
      }
    } catch {
      Swal.fire(
        t("common.error"),
        t("transactions.details.uploadError"),
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReverseTransaction = async (e) => {
    e.preventDefault();
    const result = await Swal.fire({
      title: t("transactions.details.reverseTitle"),
      text: t("transactions.details.reverseText"),
      icon: "warning",
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: t("transactions.details.reverseConfirm"),
      cancelButtonText: t("common.cancel"),
      confirmButtonColor: "red",
      reverseButtons: true,
      didOpen: () => {
        // Hide buttons initially
        Swal.getConfirmButton().style.display = "none";
        Swal.showLoading();
        setTimeout(() => {
          if (Swal.isVisible()) {
            Swal.getConfirmButton().style.display = "inline-block";
            Swal.hideLoading();
          }
        }, 2000);
      },
    });

    if (!result.isConfirmed) return;

    Swal.fire({
      title: t("transactions.details.reversingTitle"),
      text: t("transactions.details.reversingText"),
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const response = await reverse(txn.id, hotelId);
      if (response.isSuccessful) {
        onReverseSuccess(txn.id, response.item);
        Swal.fire({
          title: t("common.success"),
          text: t("transactions.details.reverseSuccess"),
          icon: "success",
          confirmButtonText: t("common.ok"),
        });
      } else {
        throw new Error("Error reverting transaction");
      }
    } catch (error) {
      const errorMessage = getTranslatedErrorMessage(error);

      Swal.close();

      Swal.fire({
        title: t("common.error"),
        text: errorMessage,
        icon: "error",
        confirmButtonText: t("common.ok"),
      });
    }
  };

  const handleEditDescription = async () => {
    const { value: newDescription } = await Swal.fire({
      title: t("transactions.details.editDescriptionTitle"),
      input: "textarea",
      inputLabel: t("transactions.details.editDescriptionLabel"),
      inputValue: txn.description || "",
      inputPlaceholder: t("transactions.details.editDescriptionPlaceholder"),
      showCancelButton: true,
      confirmButtonText: t("transactions.details.save"),
      cancelButtonText: t("common.cancel"),
      inputAttributes: {
        "aria-label": t("transactions.details.editDescriptionLabel"),
      },
      inputValidator: (value) => {
        if (value.length > 500) {
          return t("transactions.validation.descriptionMax");
        }
      },
    });

    if (newDescription !== undefined && newDescription !== txn.description) {
      Swal.fire({
        title: t("transactions.details.savingTitle"),
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      try {
        const response = await updateDescription(
          txn.id,
          newDescription,
          hotelId
        );
        if (response.isSuccessful) {
          Swal.fire(
            t("common.success"),
            t("transactions.details.editDescriptionSuccess"),
            "success"
          ).then(() => {
            onEditDescriptionSuccess(txn.id, newDescription);
          });
        } else {
          throw new Error(t("transactions.details.editDescriptionError"));
        }
      } catch {
        Swal.fire(
          t("common.error"),
          t("transactions.details.editDescriptionError"),
          "error"
        );
      }
    }
  };

  const entityLink = useMemo(() => {
    if (!txn.entityId) return " - ";

    const isBooking = txn.entityId?.startsWith("BKN");
    let path = `/hotels/${hotelId}`;
    if (isBooking) {
      path += `/bookings/${txn.entityId}`;
    } else {
      path = "#";
    }
    return (
      <Link to={path} className="text-decoration-none">
        {txn.entityId}
      </Link>
    );
  }, [txn.entityId, hotelId]);

  return (
    <div className="text-dark">
      <LoadingOverlay isVisible={isLoading} />
      <Row>
        <Col xl={3} md={6} className="mb-2">
          <strong>{t("transactions.details.transactionId")}</strong>
          <br />
          {txn.id}
        </Col>
        <Col xl={3} md={6} className="mb-2">
          <strong>{t("transactions.details.parentId")}</strong> <br />
          {txn.parentId || " - "}
        </Col>
        <Col xl={3} md={6} className="mb-2">
          <strong>{t("transactions.details.reference")}</strong> <br />{" "}
          {txn.referenceNumber || t("transactions.details.noReference")}
        </Col>
        <Col xl={3} md={6} className="mb-2">
          <strong>{t("transactions.details.entity")}</strong> <br />
          {entityLink}
        </Col>
      </Row>

      <Row>
        <Col xl={3} md={6} className="mb-2">
          <strong>{t("transactions.details.amount")}</strong> <br />
          {formatCurrency(txn.amount, txn.currencyCode)}
        </Col>
        <Col xl={3} md={6} className="mb-2">
          <strong>{t("transactions.details.transactionDate")}</strong> <br />
          {dayjs(txn.transactionDate).format("DD/MM/YYYY")}
        </Col>
        <Col xl={3} md={6} className="mb-2">
          <strong>{t("transactions.details.paymentMethod")}</strong> <br />
          {txn.paymentMethod?.name}
        </Col>
        <Col xl={3} md={6} className="mb-2">
          <strong>{t("transactions.details.status")}</strong> <br />
          {status}
        </Col>
      </Row>

      <Row>
        <Col xl={3} md={6} className="mb-2">
          <strong>{t("transactions.details.subcategory")}</strong> <br />
          {txn.subcategory?.name || t("transactions.details.noSubcategory")}
        </Col>
        <Col xl={3} md={6} className="mb-2">
          <strong>{t("transactions.details.category")}</strong> <br />
          {category}
        </Col>
        <Col xl={3} md={6} className="mb-2">
          <strong>{t("transactions.details.approvedBy")}</strong> <br />
          {txn.approvedBy?.firstName} {txn.approvedBy?.lastName || " - "}
        </Col>
        <Col xl={3} md={6} className="mb-2">
          <strong>{t("transactions.details.financePartner")}</strong> <br />
          {txn.financePartner?.name || " - "}
        </Col>
      </Row>
      <Row>
        <Col xl={3} md={6} className="mb-2">
          <strong>{t("transactions.details.createdBy")}</strong> <br />
          {txn.createdBy?.firstName} {txn.createdBy?.lastName}
        </Col>
        <Col xl={3} md={6} className="mb-2">
          <strong>{t("transactions.details.createdAt")}</strong> <br />
          {dayjs(txn.dateCreated).format("DD/MMM/YYYY - h:mm A")}
        </Col>
        <Col xl={3} md={6} className="mb-2">
          <strong>{t("transactions.details.modifiedBy")}</strong> <br />
          {txn.modifiedBy?.firstName} {txn.modifiedBy?.lastName}
        </Col>
        <Col xl={3} md={6} className="mb-2">
          <strong>{t("transactions.details.modifiedAt")}</strong> <br />
          {dayjs(txn.dateModified).format("DD/MMM/YYYY - h:mm A")}
        </Col>
      </Row>

      {txn?.description && (
        <Row>
          <Col>
            <strong>{t("transactions.details.description")}</strong> <br />{" "}
            {txn.description}
          </Col>
        </Row>
      )}
      <Row className="mt-3">
        <Col className="text-center">
          {Boolean(txn.parentId) && Boolean(onEditDescriptionSuccess) && (
            <Button
              size="sm"
              color="secondary"
              onClick={handleEditDescription}
              className="float-start">
              {t("transactions.details.editDescription")}
            </Button>
          )}
          {Boolean(onEditTransaction) &&
            txn.statusId !== TRANSACTION_STATUS_IDS.REVERSED &&
            !Boolean(txn.parentId) && (
              <Button
                size="sm"
                color="outline-danger"
                onClick={() => onEditTransaction(txn)}
                className="float-start">
                {t("transactions.details.editTransaction")}
              </Button>
            )}
          {updateHasDocumentUrl &&
            txn.statusId !== TRANSACTION_STATUS_IDS.REVERSED && (
              <Button
                size="sm"
                color={showUploader ? "warning" : "outline-dark"}
                className="me-2"
                onClick={() => {
                  setFiles([]);
                  setShowUploader((prev) => !prev);
                }}>
                {showUploader
                  ? t("common.cancel")
                  : txn.hasDocumentUrl
                  ? t("transactions.details.changeDocument")
                  : t("transactions.details.attachDocument")}
              </Button>
            )}
          {txn.hasDocumentUrl && (
            <Button
              size="sm"
              color="outline-success"
              onClick={handleViewDocument}
              className="me-2">
              {t("transactions.details.viewDocument")}
            </Button>
          )}
          {!txn.parentId && (
            <Button
              size="sm"
              color="outline-secondary"
              onClick={handleToggleOffcanvas}>
              {t("transactions.details.viewHistory")}
            </Button>
          )}
          {onReverseSuccess &&
            txn.statusId !== TRANSACTION_STATUS_IDS.REVERSED && (
              <Button
                size="sm"
                color="outline-danger"
                className="float-end"
                onClick={handleReverseTransaction}>
                {t("transactions.details.reverse")}
              </Button>
            )}
        </Col>
      </Row>

      {showUploader && (
        <Row className="mt-3">
          <Col>
            <h6 className="text-center mt-3 mb-1">
              {t("transactions.details.attachDocument")}
              <span className="text-muted"> (.png, .jpg, .jpeg, .webp)</span>
              <br />
              <span className="text-muted">
                {t("transactions.details.maxSize")}
              </span>
            </h6>
            <Dropzone
              onDropAccepted={(acceptedFiles) => setFiles(acceptedFiles)}
              multiple={false}
              accept={{
                "image/*": [".png", ".jpeg", ".jpg", "webp"],
              }}
              disabled={submitting}
              setFiles={setFiles}
              files={files}
              maxSize={1000 * 1024} // 1 MB
            />
            {
              <div className="text-center mt-2">
                <Button
                  size="sm"
                  color="success"
                  onClick={handleFileSubmit}
                  disabled={submitting || files.length === 0}>
                  {t("transactions.details.uploadDocument")}
                </Button>
              </div>
            }
          </Col>
        </Row>
      )}
      <SupportDocumentModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        documentUrl={documentUrl}
      />
      <TransactionVersionsOffCanvas
        offCanvasOpen={offCanvasOpen}
        handleToggleOffcanvas={handleToggleOffcanvas}
        transaction={txn}
        hotelId={hotelId}
      />
    </div>
  );
};

export default TransactionDetails;
