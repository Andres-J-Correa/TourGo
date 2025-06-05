import React, { useState } from "react";
import { Row, Col, Button } from "reactstrap";
import dayjs from "dayjs";
import Swal from "sweetalert2";

import Dropzone from "components/commonUI/forms/Dropzone";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import SupportDocumentModal from "components/transactions/SupportDocumentModal";

import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_STATUSES,
  TRANSACTION_STATUS_IDS,
} from "components/transactions/constants";
import {
  getSupportDocumentUrl,
  updateDocumentUrl,
  reverse,
} from "services/transactionService";
import { compressImage } from "utils/fileHelper";
import { useLanguage } from "contexts/LanguageContext";

const TransactionDetails = ({
  txn,
  updateHasDocumentUrl,
  onReverseSuccess,
}) => {
  const [files, setFiles] = useState([]);
  const [showUploader, setShowUploader] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [documentUrl, setDocumentUrl] = useState(null);

  const { getTranslatedErrorMessage } = useLanguage();

  const category = TRANSACTION_CATEGORIES.find(
    (cat) => cat.id === txn.categoryId
  )?.name;

  const status = TRANSACTION_STATUSES.find((s) => s.id === txn.statusId)?.name;

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
        txn.id,
        txn.amount
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

  const handleReverseTransaction = async (e) => {
    e.preventDefault();
    const result = await Swal.fire({
      title: "¿Revertir transacción?",
      text: "Esta acción generará una transacción de reversión que cancelará esta transacción. ¿Estás seguro?",
      icon: "warning",
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: "Sí, revertir",
      cancelButtonText: "Cancelar",
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
      title: "Revirtiendo transacción",
      text: "Por favor espera",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const response = await reverse(txn.id);
      if (response.isSuccessful) {
        onReverseSuccess(txn.id, response.item);
        Swal.fire({
          title: "Éxito",
          text: "Transacción revertida correctamente",
          icon: "success",
          confirmButtonText: "OK",
        });
      } else {
        throw new Error("Error reverting transaction");
      }
    } catch (error) {
      const errorMessage = getTranslatedErrorMessage(error);

      Swal.close();

      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <>
      <LoadingOverlay isVisible={isLoading} />
      <Row>
        <Col md={3}>
          <strong>Transacción #:</strong> {txn.id}
        </Col>
        <Col md={6}>
          <strong>Referencia:</strong> {txn.referenceNumber || "Sin referencia"}
        </Col>
        <Col md={3}>
          <strong>Método de Pago:</strong> {txn.paymentMethod?.name}
        </Col>
      </Row>

      <Row className="mt-2">
        <Col md={3}>
          <strong>Estado:</strong> {status}
        </Col>
        <Col md={3}>
          <strong>Subcategoría:</strong>{" "}
          {txn.subcategory?.name || "Sin subcategoría"}
        </Col>
        <Col md={3}>
          <strong>Categoría:</strong> {category}
        </Col>
        <Col md={3}>
          <strong>Socio Financiero:</strong> {txn.financePartner?.name || " - "}
        </Col>
      </Row>

      <Row className="mt-2">
        <Col md={3}>
          <strong>Creada por:</strong> {txn.createdBy?.firstName}{" "}
          {txn.createdBy?.lastName}
        </Col>
        <Col md={3}>
          <strong>Aprobada por:</strong> {txn.approvedBy?.firstName}{" "}
          {txn.approvedBy?.lastName || " - "}
        </Col>
        <Col md={3}>
          <strong>Creada el:</strong>{" "}
          {dayjs(txn.dateCreated).format("DD/MMM/YYYY - h:mm A")}
        </Col>
        <Col md={3}>
          <strong>Id Precursor:</strong> {txn.parentId || " - "}
        </Col>
      </Row>

      {txn?.description && (
        <Row className="mt-2">
          <Col>
            <strong>Notas:</strong> {txn.description}
          </Col>
        </Row>
      )}
      <Row className="mt-3">
        <Col className="text-center">
          {txn.hasDocumentUrl ? (
            <Button color="info" onClick={handleViewDocument}>
              Ver comprobante
            </Button>
          ) : (
            txn.statusId !== TRANSACTION_STATUS_IDS.REVERSED && (
              <Button
                color={showUploader ? "warning" : "primary"}
                onClick={() => {
                  setFiles([]);
                  setShowUploader((prev) => !prev);
                }}>
                {showUploader ? "Cancelar" : "Agregar comprobante"}
              </Button>
            )
          )}
          {txn.statusId !== TRANSACTION_STATUS_IDS.REVERSED && (
            <Button
              color="outline-danger"
              className="ms-5"
              onClick={handleReverseTransaction}>
              Revertir
            </Button>
          )}
        </Col>
      </Row>

      {showUploader && (
        <Row className="mt-3">
          <Col>
            <h6 className="text-center mt-3 mb-1">
              Adjuntar Comprobante
              <span className="text-muted"> (.png, .jpg, .jpeg, .webp)</span>
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
      <SupportDocumentModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        documentUrl={documentUrl}
      />
    </>
  );
};

export default TransactionDetails;
