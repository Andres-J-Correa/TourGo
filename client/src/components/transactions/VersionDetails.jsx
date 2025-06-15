import React, { useState } from "react";
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

const VersionDetails = ({ txn }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [documentUrl, setDocumentUrl] = useState(null);

  const category =
    TRANSACTION_CATEGORIES_BY_ID[txn.categoryId] || "Desconocido";

  const status = TRANSACTION_STATUS_BY_ID[txn.statusId] || "Desconocido";

  const handleViewDocument = async () => {
    setIsLoading(true);
    try {
      const response = await getVersionSupportDocumentUrl(txn.parentId, txn.id);

      if (response.isSuccessful) {
        setDocumentUrl(response.item);
        setModalOpen(true);
      } else {
        throw new Error("Error loading document");
      }
    } catch {
      Swal.fire("Error", "No se pudo cargar el comprobante", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay isVisible={isLoading} />
      <Row>
        <Col xl={6} md={12} className="mb-2">
          <strong>Modificada por:</strong> <br />
          {txn.modifiedBy?.firstName} {txn.modifiedBy?.lastName}
        </Col>
        <Col xl={6} md={12} className="mb-2">
          <strong>Modificada el:</strong> <br />
          {dayjs(txn.dateModified).format("DD/MMM/YYYY - h:mm A")}
        </Col>
      </Row>
      <Row>
        <Col xl={6} md={12} className="mb-2">
          <strong>Versión #</strong>
          <br />
          {txn.id}
        </Col>
        <Col xl={6} md={12} className="mb-2">
          <strong>Id Precursor:</strong> <br />
          {txn.parentId || " - "}
        </Col>
        <Col xl={12} md={12} className="mb-2">
          <strong>Referencia:</strong> <br />{" "}
          <span
            className={classNames({
              "text-danger": txn.changes?.referenceNumber,
            })}>
            {txn.referenceNumber || "Sin referencia"}
          </span>
        </Col>
      </Row>

      <Row>
        <Col xl={6} md={12} className="mb-2">
          <strong>Estado:</strong> <br />
          {status}
        </Col>
        <Col xl={6} md={12} className="mb-2">
          <strong>Subcategoría:</strong> <br />
          <span
            className={classNames({
              "text-danger": txn.changes?.subcategory,
            })}>
            {txn.subcategory?.name || "Sin subcategoría"}
          </span>
        </Col>
        <Col xl={6} md={12} className="mb-2">
          <strong>Categoría:</strong> <br />
          <span
            className={classNames({
              "text-danger": txn.changes?.categoryId,
            })}>
            {category}
          </span>
        </Col>
        <Col xl={6} md={12} className="mb-2">
          <strong>Método de Pago:</strong> <br />
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
          <strong>Aprobada por:</strong> <br />
          {txn.approvedBy?.firstName} {txn.approvedBy?.lastName || " - "}
        </Col>
        <Col xl={6} md={12} className="mb-2">
          <strong>Socio Financiero:</strong> <br />
          <span
            className={classNames({
              "text-danger": txn.changes?.financePartner,
            })}>
            {txn.financePartner?.name || " - "}
          </span>
        </Col>
        <Col xl={6} md={12} className="mb-2">
          <strong>Creada por:</strong> <br />
          {txn.createdBy?.firstName} {txn.createdBy?.lastName}
        </Col>
        <Col xl={6} md={12} className="mb-2">
          <strong>Creada el:</strong> <br />
          {dayjs(txn.dateCreated).format("DD/MMM/YYYY - h:mm A")}
        </Col>
      </Row>

      {txn?.description && (
        <Row>
          <Col>
            <strong>Descripción:</strong> <br />
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
              Ver comprobante
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
