import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Row, Col, Button } from "reactstrap";
import dayjs from "dayjs";
import Swal from "sweetalert2";

import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import SupportDocumentModal from "components/transactions/SupportDocumentModal";

import {
  TRANSACTION_STATUS_BY_ID,
  TRANSACTION_CATEGORIES_BY_ID,
} from "components/transactions/constants";
import { getVersionSupportDocumentUrl } from "services/transactionService";
import classNames from "classnames";
import { useLanguage } from "contexts/LanguageContext";

const VersionDetails = ({ txn }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [documentUrl, setDocumentUrl] = useState(null);

  const { hotelId } = useParams();
  const { t } = useLanguage();

  const category = TRANSACTION_CATEGORIES_BY_ID[txn.categoryId]
    ? t(TRANSACTION_CATEGORIES_BY_ID[txn.categoryId])
    : t("transactions.versionDetails.unknown");

  const status = TRANSACTION_STATUS_BY_ID[txn.statusId]
    ? t(TRANSACTION_STATUS_BY_ID[txn.statusId])
    : t("transactions.versionDetails.unknown");

  const handleViewDocument = async () => {
    setIsLoading(true);
    try {
      const response = await getVersionSupportDocumentUrl(
        txn.parentId,
        txn.id,
        hotelId
      );

      if (response.isSuccessful) {
        setDocumentUrl(response.item);
        setModalOpen(true);
      } else {
        throw new Error("Error loading document");
      }
    } catch {
      Swal.fire(
        t("common.error"),
        t("transactions.versionDetails.loadDocumentError"),
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay isVisible={isLoading} />
      <Row>
        <Col xl={6} md={12} className="mb-2">
          <strong>{t("transactions.versionDetails.modifiedBy")}</strong> <br />
          {txn.modifiedBy?.firstName} {txn.modifiedBy?.lastName}
        </Col>
        <Col xl={6} md={12} className="mb-2">
          <strong>{t("transactions.versionDetails.modifiedAt")}</strong> <br />
          {dayjs(txn.dateModified).format("DD/MMM/YYYY - h:mm A")}
        </Col>
      </Row>
      <Row>
        <Col xl={6} md={12} className="mb-2">
          <strong>{t("transactions.versionDetails.versionId")}</strong>
          <br />
          {txn.id}
        </Col>
        <Col xl={6} md={12} className="mb-2">
          <strong>{t("transactions.versionDetails.parentId")}</strong> <br />
          {txn.parentId || " - "}
        </Col>
        <Col xl={12} md={12} className="mb-2">
          <strong>{t("transactions.versionDetails.reference")}</strong> <br />{" "}
          <span
            className={classNames({
              "text-danger": txn.changes?.referenceNumber,
            })}>
            {txn.referenceNumber ||
              t("transactions.versionDetails.noReference")}
          </span>
        </Col>
      </Row>

      <Row>
        <Col xl={6} md={12} className="mb-2">
          <strong>{t("transactions.versionDetails.status")}</strong> <br />
          {status}
        </Col>
        <Col xl={6} md={12} className="mb-2">
          <strong>{t("transactions.versionDetails.subcategory")}</strong> <br />
          <span
            className={classNames({
              "text-danger": txn.changes?.subcategory,
            })}>
            {txn.subcategory?.name ||
              t("transactions.versionDetails.noSubcategory")}
          </span>
        </Col>
        <Col xl={6} md={12} className="mb-2">
          <strong>{t("transactions.versionDetails.category")}</strong> <br />
          <span
            className={classNames({
              "text-danger": txn.changes?.categoryId,
            })}>
            {category}
          </span>
        </Col>
        <Col xl={6} md={12} className="mb-2">
          <strong>{t("transactions.versionDetails.paymentMethod")}</strong>{" "}
          <br />
          <span
            className={classNames({
              "text-danger": txn.changes?.paymentMethod,
            })}>
            {txn.paymentMethod?.name}
          </span>
        </Col>
      </Row>

      <Row>
        <Col xl={6} md={12} className="mb-2">
          <strong>{t("transactions.versionDetails.approvedBy")}</strong> <br />
          {txn.approvedBy?.firstName} {txn.approvedBy?.lastName || " - "}
        </Col>
        <Col xl={6} md={12} className="mb-2">
          <strong>{t("transactions.versionDetails.financePartner")}</strong>{" "}
          <br />
          <span
            className={classNames({
              "text-danger": txn.changes?.financePartner,
            })}>
            {txn.financePartner?.name || " - "}
          </span>
        </Col>
        <Col xl={6} md={12} className="mb-2">
          <strong>{t("transactions.versionDetails.createdBy")}</strong> <br />
          {txn.createdBy?.firstName} {txn.createdBy?.lastName}
        </Col>
        <Col xl={6} md={12} className="mb-2">
          <strong>{t("transactions.versionDetails.createdAt")}</strong> <br />
          {dayjs(txn.dateCreated).format("DD/MMM/YYYY - h:mm A")}
        </Col>
      </Row>

      {txn?.description && (
        <Row>
          <Col>
            <strong>{t("transactions.versionDetails.description")}</strong>{" "}
            <br />
            <span
              className={classNames({
                "text-danger": txn.changes?.description,
              })}>
              {txn.description}
            </span>
          </Col>
        </Row>
      )}
      <Row className="mt-3">
        <Col className="text-center">
          {txn.hasDocumentUrl && (
            <Button
              size="sm"
              color={
                txn.documentUrlChanged ? "outline-danger" : "outline-success"
              }
              onClick={handleViewDocument}
              className="me-2">
              {t("transactions.versionDetails.viewDocument")}
            </Button>
          )}
        </Col>
      </Row>

      <SupportDocumentModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        documentUrl={documentUrl}
      />
    </>
  );
};

export default VersionDetails;
