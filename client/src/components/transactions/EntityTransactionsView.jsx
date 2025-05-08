import React, { useCallback, useEffect, useState } from "react";
import { add, updateDocumentUrl } from "services/transactionService";
import { Formik, Form } from "formik";
import { Button, Col, Row } from "reactstrap";
import useHotelFormData from "components/transactions/hooks/useHotelFormData";
import CustomField from "components/commonUI/forms/CustomField";
import dayjs from "dayjs";
import classNames from "classnames";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import Transaction from "components/transactions/Transaction";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import {
  transactionCategories,
  transactionAddValidationSchema,
  sanitizeNewTransaction,
} from "components/transactions/constants";
import { getDate } from "utils/dateHelper";
import { formatCurrency } from "utils/currencyHelper";
import { useAppContext } from "contexts/GlobalAppContext";
import Dropzone from "components/commonUI/forms/Dropzone";
import Swal from "sweetalert2";
import { compressImage } from "utils/fileHelper";

const EntityTransactionsView = ({ hotelId, submitting, entity, setEntity }) => {
  const [mappedTransactions, setMappedTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [files, setFiles] = useState([]);

  const {
    paymentMethods,
    transactionSubcategories,
    financePartners,
    isLoadingHotelData,
  } = useHotelFormData(hotelId);

  const paid = entity?.transactions?.reduce((acc, txn) => acc + txn.amount, 0);

  const balance = entity?.total - (isNaN(paid) ? 0 : paid);

  const { user } = useAppContext();

  const initialValues = {
    amount: "",
    transactionDate: dayjs().format("YYYY-MM-DD"),
    paymentMethodId: "",
    categoryId: "",
    subcategoryId: "",
    referenceNumber: "",
    statusId: 2,
    description: "",
    currencyCode: "COP",
    financePartnerId: "",
    invoiceId: entity?.invoiceId || "",
    entityId: entity?.id || "",
  };

  const handleFileUpload = async (transaction, file) => {
    try {
      const compressedFile = await compressImage(file, 35 * 1024); // 35 KB

      const response = await updateDocumentUrl(
        compressedFile,
        transaction.category.id,
        transaction.id
      );
      return Promise.resolve(response);
    } catch (error) {
      return Promise.resolve(error);
    }
  };

  const confirmProceedWithoutFile = () => {
    return Swal.fire({
      icon: "warning",
      title: "No se ha adjuntado un comprobante",
      text: "¿Deseas continuar sin adjuntar un comprobante?",
      showCancelButton: true,
      confirmButtonText: "Sí, continuar",
      confirmButtonColor: "red",
      cancelButtonText: "No, adjuntar comprobante",
      reverseButtons: true,
      cancelButtonColor: "green",
    });
  };

  const confirmTransactionSave = () => {
    return Swal.fire({
      title: "¿Guardar Transacción?",
      html: "Esta transacción no podrá modificarse después.<br/><strong>¿Estás seguro de que deseas continuar?</strong>",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });
  };

  const showLoading = (title = "Guardando...") => {
    Swal.fire({
      title,
      text: "Por favor espera",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
  };

  const handleSubmit = async (values, { resetForm }) => {
    let newTransaction = null;

    try {
      if (files.length === 0) {
        const { isConfirmed } = await confirmProceedWithoutFile();
        if (!isConfirmed) return;
      }

      const { isConfirmed: confirmSave } = await confirmTransactionSave();
      if (!confirmSave) return;

      showLoading("Guardando...");

      const response = await add(values, hotelId);
      if (!response.isSuccessful)
        throw new Error("Error al agregar transacción");

      newTransaction = {
        ...sanitizeNewTransaction(
          values,
          user.current,
          paymentMethods,
          transactionSubcategories,
          financePartners
        ),
        id: response.item,
        dateCreated: dayjs().toISOString(),
        hotelId,
        entityId: entity.id,
        invoiceId: entity.invoiceId,
      };

      Swal.fire({
        icon: "success",
        title: "Transacción agregada",
        timer: 1500,
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      if (files.length > 0) {
        showLoading("Subiendo comprobante...");

        const uploadResponse = await handleFileUpload(newTransaction, files[0]);

        if (uploadResponse?.isSuccessful) {
          newTransaction.hasDocumentUrl = true;
          Swal.fire({
            icon: "success",
            title: "Comprobante subido",
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo subir el comprobante, ve a la transacción para subirlo manualmente",
            timer: 3000,
            showConfirmButton: false,
          });
        }
      }

      setEntity((prev) => {
        const transactions = prev.transactions || [];
        return {
          ...prev,
          transactions: [newTransaction, ...transactions],
        };
      });
      resetForm();
      setShowForm(false);
      setFiles([]);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo agregar la transacción, por favor intenta de nuevo",
      });
    }
  };

  const handleAddTransactionClick = () => {
    setShowForm(true);
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  const updateHasDocumentUrl = useCallback(
    (id, hasDocumentUrl) => {
      setEntity((prev) => {
        const newState = { ...prev };
        const newTransactions = newState.transactions.map((txn) => {
          if (txn.id === id) {
            return { ...txn, hasDocumentUrl };
          }
          return txn;
        });
        newState.transactions = newTransactions;
        return newState;
      });
    },
    [setEntity]
  );

  const mapTransaction = useCallback(
    (txn) => (
      <Transaction
        key={`transaction-${txn.id}`}
        txn={txn}
        updateHasDocumentUrl={updateHasDocumentUrl}
      />
    ),
    [updateHasDocumentUrl]
  );

  useEffect(() => {
    if (entity?.transactions?.length > 0) {
      setMappedTransactions(entity.transactions.map(mapTransaction));
    } else {
      setMappedTransactions([]);
    }
  }, [entity?.transactions, mapTransaction]);

  return (
    <>
      <LoadingOverlay isVisible={isLoadingHotelData || submitting} />
      <div>
        <Row>
          <Col md={4}>
            <strong className="fs-5 text">Total:</strong>
            <span className="float-end mt-1">
              {formatCurrency(entity.total, "COP")}
            </span>
          </Col>
          <Col md={4}>
            <strong className="fs-5 text">Pagado:</strong>
            <span className="float-end mt-1">
              {formatCurrency(paid, "COP")}
            </span>
          </Col>
          <Col md={4}>
            <strong className="fs-5 text">Saldo:</strong>
            <span
              className={classNames("float-end mt-1", {
                "text-danger": balance < 0,
              })}>
              {formatCurrency(balance, "COP")}
            </span>
          </Col>
        </Row>
        <hr />
        {!showForm && (
          <div className="text-center mb-3">
            <Button color="primary" onClick={handleAddTransactionClick}>
              Agregar Transacción
            </Button>
          </div>
        )}
        {mappedTransactions}
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={transactionAddValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize>
        {({ values, setFieldValue }) => {
          const handleDateChange = (e) => {
            const date = e.target.value;
            setFieldValue("transactionDate", getDate(date));
          };

          const handleSubcategoryChange = (e) => {
            const selectedSubcategoryId = e.target.value;
            const subcategoryCategoryId =
              e.target.options[e.target.selectedIndex].dataset.category;
            setFieldValue("subcategoryId", selectedSubcategoryId);
            if (subcategoryCategoryId) {
              setFieldValue("categoryId", subcategoryCategoryId);
            }
          };

          return (
            <Form
              className={classNames("mt-4 p-3 border rounded shadow-lg", {
                "d-none": !showForm,
              })}>
              <h5 className="mb-3 text-center">Agregar Transacción</h5>
              <div className="d-flex justify-content-end mb-3">
                <Button type="submit" color="success" className="me-2">
                  Guardar
                </Button>
                <Button type="button" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
              <ErrorAlert />
              <Row>
                <Col md={4}>
                  <CustomField
                    name="amount"
                    type="number"
                    className="form-control"
                    placeholder="Monto"
                    step="0.01"
                    isRequired={true}
                  />
                </Col>
                <Col md={4}>
                  <CustomField
                    name="transactionDate"
                    type="date"
                    className="form-control"
                    placeholder="Fecha de la Transacción"
                    onChange={handleDateChange}
                    isRequired={true}
                  />
                </Col>
                <Col md={4}>
                  <CustomField
                    name="referenceNumber"
                    className="form-control"
                    placeholder="Número de Referencia"
                    isRequired={true}
                  />
                </Col>
              </Row>

              <Row>
                <Col md={3}>
                  <CustomField
                    name="paymentMethodId"
                    as="select"
                    className="form-control"
                    placeholder="Método de Pago"
                    isRequired={true}>
                    <option value="">Seleccionar</option>
                    {paymentMethods.map((pm) => (
                      <option key={pm.id} value={pm.id}>
                        {pm.name}
                      </option>
                    ))}
                  </CustomField>
                </Col>
                <Col md={3}>
                  <CustomField
                    name="subcategoryId"
                    as="select"
                    className="form-control"
                    placeholder="Subcategoría"
                    onChange={handleSubcategoryChange}>
                    <option value="">Opcional</option>
                    {transactionSubcategories.map((sub) => (
                      <option
                        key={sub.id}
                        value={sub.id}
                        data-category={sub.categoryId}>
                        {sub.name}
                      </option>
                    ))}
                  </CustomField>
                </Col>
                <Col md={3}>
                  <CustomField
                    name="categoryId"
                    as="select"
                    className="form-control"
                    disabled={values.subcategoryId}
                    placeholder="Categoría"
                    isRequired={true}>
                    <option value="">Seleccionar</option>
                    {transactionCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </CustomField>
                </Col>
                <Col md={3}>
                  <CustomField
                    name="financePartnerId"
                    as="select"
                    className="form-control"
                    placeholder="Socio Financiero">
                    <option value="">Opcional</option>
                    {financePartners.map((fp) => (
                      <option key={fp.id} value={fp.id}>
                        {fp.name}
                      </option>
                    ))}
                  </CustomField>
                </Col>
              </Row>

              <CustomField
                as="textarea"
                rows="3"
                name="description"
                className="form-control"
                placeholder="Descripción"
              />

              <h6 className="text-center mt-3 mb-1">
                Adjuntar Comprobante
                <span className="text-muted"> (.png, .jpg, .jpeg, .webp)</span>
                <br />
                <span className="text-muted">(Máx. 1 MB)</span>
              </h6>
              <Dropzone
                onDropAccepted={(files) => {
                  setFiles(files);
                }}
                multiple={false}
                accept={{
                  "image/*": [".png", ".jpeg", ".jpg", "webp"],
                }}
                disabled={submitting}
                setFiles={setFiles}
                files={files}
                maxSize={1000 * 1024} // 1 MB
              />
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

export default EntityTransactionsView;
