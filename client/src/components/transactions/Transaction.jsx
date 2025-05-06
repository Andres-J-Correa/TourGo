import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Row,
  Col,
  Button,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import {
  transactionCategories,
  transactionStatuses,
} from "components/transactions/constants";
import { formatCurrency } from "utils/currencyHelper";
import classNames from "classnames";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import Dropzone from "components/commonUI/forms/Dropzone";
import defaultImage from "assets/images/default-image.svg";
import { compressImage } from "utils/fileHelper";

import {
  getSupportDocumentUrl,
  updateDocumentUrl,
} from "services/transactionService";

import "./Transaction.css";

function Transaction({ txn, updateHasDocumentUrl }) {
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [documentUrl, setDocumentUrl] = useState(null);
  const [files, setFiles] = useState([]);
  const [showUploader, setShowUploader] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const category = transactionCategories.find(
    (cat) => cat.id === txn.category?.id
  )?.name;

  const status = transactionStatuses.find((s) => s.id === txn.status?.id)?.name;

  const toggleExpanded = () => setExpanded((prev) => !prev);

  const cardClass = classNames("px-0", {
    "w-100": expanded,
    "w-75": !expanded,
  });

  const cardHeaderClass = classNames("transaction-card-header", {
    "bg-success-subtle": txn.category?.id === 1,
    "bg-danger-subtle": txn.category?.id === 2,
    "bg-warning-subtle": txn.category?.id === 3,
    "text-dark": expanded,
  });

  const handleViewDocument = async () => {
    setIsLoading(true);
    try {
      const response = await getSupportDocumentUrl(txn.id);
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

  const handleFileSubmit = async () => {
    const result = await Swal.fire({
      title: "¿Subir comprobante?",
      text: "Este comprobante no podrá cambiarse después",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, subir",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (!result.isConfirmed || files.length === 0) return;

    const file = files[0];

    try {
      setSubmitting(true);
      Swal.fire({
        title: "Subiendo comprobante",
        text: "Por favor espera",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const compressedFile = await compressImage(file, 35 * 1024); // 35 KB

      const uploadResponse = await updateDocumentUrl(
        compressedFile,
        txn.category.id,
        txn.id
      );

      if (uploadResponse.isSuccessful) {
        updateHasDocumentUrl(txn.id, true);
        Swal.fire("Éxito", "Comprobante subido correctamente", "success");
        setShowUploader(false);
      } else {
        throw new Error("Upload failed");
      }
    } catch {
      Swal.fire("Error", "No se pudo subir el comprobante", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Row className="mb-3 justify-content-center">
      <LoadingOverlay isVisible={isLoading} />
      <Card className={cardClass}>
        <CardHeader onClick={toggleExpanded} className={cardHeaderClass}>
          <strong>{formatCurrency(txn.amount, txn.currencyCode)}</strong>
          {" - "}
          {dayjs(txn.transactionDate).format("DD/MMM/YYYY")}
          {" - "}
          {txn.paymentMethod?.name}
        </CardHeader>

        {expanded && (
          <CardBody>
            <Row>
              <Col md={4}>
                <strong>Referencia:</strong> {txn.referenceNumber || "-"}
              </Col>
              <Col md={4}>
                <strong>Método de Pago:</strong> {txn.paymentMethod?.name}
              </Col>
              <Col md={4}>
                <strong>Estado:</strong> {status}
              </Col>
            </Row>

            <Row className="mt-2">
              <Col md={4}>
                <strong>Subcategoría:</strong> {txn.subcategory?.name || "-"}
              </Col>
              <Col md={4}>
                <strong>Categoría:</strong> {category}
              </Col>
              <Col md={4}>
                <strong>Socio Financiero:</strong>{" "}
                {txn.financePartner?.name || "-"}
              </Col>
            </Row>

            <Row className="mt-2">
              <Col md={4}>
                <strong>Creada por:</strong> {txn.createdBy?.firstName}{" "}
                {txn.createdBy?.lastName}
              </Col>
              <Col md={4}>
                <strong>Aprobada por:</strong> {txn.approvedBy?.firstName}{" "}
                {txn.approvedBy?.lastName || "-"}
              </Col>
              <Col md={4}>
                <strong>Creada el:</strong>{" "}
                {dayjs(txn.dateCreated).format("DD/MMM/YYYY - h:mm A")}
              </Col>
            </Row>

            <Row className="mt-2">
              <Col>
                <strong>Notas:</strong> {txn.description}
              </Col>
            </Row>

            <Row className="mt-3">
              <Col className="text-center">
                {txn.hasDocumentUrl ? (
                  <Button color="info" onClick={handleViewDocument}>
                    Ver comprobante
                  </Button>
                ) : (
                  <Button
                    color={showUploader ? "warning" : "primary"}
                    onClick={() => {
                      setFiles([]);
                      setShowUploader((prev) => !prev);
                    }}>
                    {showUploader ? "Cancelar" : "Agregar comprobante"}
                  </Button>
                )}
              </Col>
            </Row>

            {showUploader && (
              <Row className="mt-3">
                <Col>
                  <h6 className="text-center mt-3 mb-1">
                    Adjuntar Comprobante
                    <span className="text-muted">
                      {" "}
                      (.png, .jpg, .jpeg, .webp)
                    </span>
                    <br />
                    <span className="text-muted">(Máx. 1 MB)</span>
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
                  <div className="text-center mt-2">
                    <Button
                      color="success"
                      onClick={handleFileSubmit}
                      disabled={submitting || files.length === 0}>
                      Subir comprobante
                    </Button>
                  </div>
                </Col>
              </Row>
            )}
          </CardBody>
        )}
      </Card>

      {/* Modal to view document */}
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} size="lg">
        <ModalHeader
          toggle={() => setModalOpen(false)}
          className="bg-primary-subtle">
          Comprobante
        </ModalHeader>
        <ModalBody className="text-center">
          <div className="shadow-lg p-3 bg-body rounded">
            {documentUrl?.includes(".pdf") ? (
              <iframe
                src={documentUrl}
                title="Comprobante"
                width="100%"
                height="600px"
              />
            ) : (
              <img
                src={documentUrl}
                alt="Comprobante"
                style={{ maxWidth: "100%", maxHeight: "600px" }}
                onError={(e) => {
                  e.target.src = defaultImage;
                  e.target.onerror = null;
                }}
              />
            )}
          </div>
        </ModalBody>
      </Modal>
    </Row>
  );
}

export default Transaction;
