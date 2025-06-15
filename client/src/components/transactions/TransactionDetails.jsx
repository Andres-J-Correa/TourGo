import React, { useState } from "react";
import { useParams } from "react-router-dom";
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

const TransactionDetails = ({
  txn,
  updateHasDocumentUrl,
  onReverseSuccess,
  onEditDescriptionSuccess,
  onEditTransaction,
  parentSize = "lg",
}) => {
  const [files, setFiles] = useState([]);
  const [showUploader, setShowUploader] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [documentUrl, setDocumentUrl] = useState(null);
  const [offCanvasOpen, setOffcanvasOpen] = useState(false);

  const { getTranslatedErrorMessage } = useLanguage();

  const { hotelId } = useParams();

  const category =
    TRANSACTION_CATEGORIES_BY_ID[txn.categoryId] || "Desconocido";

  const status = TRANSACTION_STATUS_BY_ID[txn.statusId] || "Desconocido";

  const handleToggleOffcanvas = () => {
    setOffcanvasOpen((prev) => !prev);
  };

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
        txn.amount,
        hotelId
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

  const handleEditDescription = async () => {
    const { value: newDescription } = await Swal.fire({
      title: "Editar Descripción",
      input: "textarea",
      inputLabel: "Nueva descripción",
      inputValue: txn.description || "",
      inputPlaceholder: "Escribe la nueva descripción aquí...",
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      inputAttributes: {
        "aria-label": "Nueva descripción",
      },
      inputValidator: (value) => {
        if (value.length > 500) {
          return "La descripción no puede exceder los 500 caracteres";
        }
      },
    });

    if (newDescription !== undefined && newDescription !== txn.description) {
      Swal.fire({
        title: "Guardando...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      try {
        const response = await updateDescription(txn.id, newDescription);
        if (response.isSuccessful) {
          Swal.fire("Éxito", "Descripción actualizada", "success").then(() => {
            onEditDescriptionSuccess(txn.id, newDescription);
          });
        } else {
          throw new Error("No se pudo actualizar la descripción");
        }
      } catch {
        Swal.fire("Error", "No se pudo actualizar la descripción", "error");
      }
    }
  };

  return (
    <>
      <LoadingOverlay isVisible={isLoading} />
      <Row>
        <Col xl={parentSize === "lg" ? 3 : 6} md={6} className="mb-2">
          <strong>Transacción #</strong>
          <br />
          {txn.id}
        </Col>
        <Col xl={parentSize === "lg" ? 3 : 6} md={6} className="mb-2">
          <strong>Id Precursor:</strong> <br />
          {txn.parentId || " - "}
        </Col>
        <Col xl={parentSize === "lg" ? 3 : 12} md={12} className="mb-2">
          <strong>Referencia:</strong> <br />{" "}
          {txn.referenceNumber || "Sin referencia"}
        </Col>
      </Row>

      <Row>
        <Col xl={parentSize === "lg" ? 3 : 6} md={6} className="mb-2">
          <strong>Estado:</strong> <br />
          {status}
        </Col>
        <Col xl={parentSize === "lg" ? 3 : 6} md={6} className="mb-2">
          <strong>Subcategoría:</strong> <br />
          {txn.subcategory?.name || "Sin subcategoría"}
        </Col>
        <Col xl={parentSize === "lg" ? 3 : 6} md={6} className="mb-2">
          <strong>Categoría:</strong> <br />
          {category}
        </Col>
        <Col xl={parentSize === "lg" ? 3 : 6} md={6} className="mb-2">
          <strong>Método de Pago:</strong> <br />
          {txn.paymentMethod?.name}
        </Col>
      </Row>

      <Row>
        <Col xl={parentSize === "lg" ? 3 : 6} md={6} className="mb-2">
          <strong>Aprobada por:</strong> <br />
          {txn.approvedBy?.firstName} {txn.approvedBy?.lastName || " - "}
        </Col>
        <Col xl={parentSize === "lg" ? 3 : 6} md={6} className="mb-2">
          <strong>Socio Financiero:</strong> <br />
          {txn.financePartner?.name || " - "}
        </Col>
        <Col xl={parentSize === "lg" ? 3 : 6} md={6} className="mb-2">
          <strong>Creada por:</strong> <br />
          {txn.createdBy?.firstName} {txn.createdBy?.lastName}
        </Col>
        <Col xl={parentSize === "lg" ? 3 : 6} md={6} className="mb-2">
          <strong>Creada el:</strong> <br />
          {dayjs(txn.dateCreated).format("DD/MMM/YYYY - h:mm A")}
        </Col>
      </Row>
      <Row>
        <Col xl={parentSize === "lg" ? 3 : 6} md={6} className="mb-2">
          <strong>Modificada por:</strong> <br />
          {txn.modifiedBy?.firstName} {txn.modifiedBy?.lastName}
        </Col>
        <Col xl={parentSize === "lg" ? 3 : 6} md={6} className="mb-2">
          <strong>Modificada el:</strong> <br />
          {dayjs(txn.dateModified).format("DD/MMM/YYYY - h:mm A")}
        </Col>
      </Row>

      {txn?.description && (
        <Row>
          <Col>
            <strong>Descripción:</strong> <br /> {txn.description}
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
              Editar Descripción
            </Button>
          )}
          {Boolean(onEditTransaction) &&
            txn.statusId !== TRANSACTION_STATUS_IDS.REVERSED &&
            !Boolean(txn.parentId) && (
              <Button
                size="sm"
                color="secondary"
                onClick={() => onEditTransaction(txn)}
                className="float-start">
                Editar Transacción
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
                  ? "Cancelar"
                  : txn.hasDocumentUrl
                  ? "Cambiar Comprobante"
                  : "Adjuntar Comprobante"}
              </Button>
            )}
          {txn.hasDocumentUrl && (
            <Button
              size="sm"
              color="outline-success"
              onClick={handleViewDocument}
              className="me-2">
              Ver comprobante
            </Button>
          )}
          {!txn.parentId && (
            <Button
              size="sm"
              color="outline-secondary"
              onClick={handleToggleOffcanvas}>
              Ver Historial
            </Button>
          )}
          {onReverseSuccess &&
            txn.statusId !== TRANSACTION_STATUS_IDS.REVERSED && (
              <Button
                size="sm"
                color="outline-danger"
                className="float-end"
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
            {
              <div className="text-center mt-2">
                <Button
                  size="sm"
                  color="success"
                  onClick={handleFileSubmit}
                  disabled={submitting || files.length === 0}>
                  Subir comprobante
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
      />
    </>
  );
};

export default TransactionDetails;
