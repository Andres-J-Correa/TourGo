import React, { useState } from "react";

import CustomField from "components/commonUI/forms/CustomField";
import Dropzone from "components/commonUI/forms/Dropzone";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import TransactionCategoriesExplanationIcon from "components/transactions/TransactionCategoriesExplanationIcon";

import { useAppContext } from "contexts/GlobalAppContext";
import { getDate } from "utils/dateHelper";
import { compressImage } from "utils/fileHelper";
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_CATEGORY_TYPES_IDS,
  transactionAddValidationSchema,
  sanitizeNewTransaction,
} from "components/transactions/constants";
import { add, updateDocumentUrl } from "services/transactionService";
import useHotelFormData from "components/transactions/hooks/useHotelFormData";

import { Formik, Form } from "formik";
import { Button, Col, InputGroup, InputGroupText, Row } from "reactstrap";

import classNames from "classnames";
import dayjs from "dayjs";
import Swal from "sweetalert2";

function TransactionAddForm({
  hotelId,
  entity,
  submitting,
  showForm,
  setShowForm,
  onTransactionAdded = () => {},
}) {
  const { user } = useAppContext();

  const [files, setFiles] = useState([]);

  const {
    paymentMethods,
    transactionSubcategories,
    financePartners,
    isLoadingHotelData,
  } = useHotelFormData(hotelId);

  const handleCancelClick = () => {
    setShowForm(false);
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 100);
  };

  const initialValues = {
    amount: "",
    transactionDate: dayjs().format("YYYY-MM-DD"),
    paymentMethodId: "",
    categoryId: "",
    categoryTypeId: "",
    subcategoryId: "",
    referenceNumber: "",
    statusId: 2,
    description: entity?.customer
      ? `Cliente asociado: ${entity.customer.firstName} ${entity.customer.lastName}`
      : "",
    currencyCode: "COP",
    financePartnerId: "",
    invoiceId: entity?.invoiceId || undefined,
    entityId: entity?.id || undefined,
  };

  const confirmProceedWithMismatchedCategoryAmount = (
    amount,
    categoryTypeId
  ) => {
    let message = "";
    const isIncome = categoryTypeId === TRANSACTION_CATEGORY_TYPES_IDS.INCOME;
    if (amount >= 0 && !isIncome) {
      message = "El monto es positivo, pero la categoría es de tipo Gasto.";
    } else if (amount < 0 && isIncome) {
      message = "El monto es negativo, pero la categoría es de tipo Ingreso.";
    }
    return Swal.fire({
      icon: "warning",
      title: "¡Posible error de categoría!",
      text: message,
      showCancelButton: true,
      confirmButtonText: "Continuar",
      confirmButtonColor: "red",
      cancelButtonText: "Revisar categoría",
      reverseButtons: true,
      cancelButtonColor: "green",
      didOpen: () => {
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
      html: "Esta transacción no podrá modificarse después.<br/><strong>Revisa los datos antes de continuar.</strong>",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
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

  const handleFileUpload = async (transaction, file) => {
    try {
      const compressedFile = await compressImage(file, 35 * 1024); // 35 KB

      const response = await updateDocumentUrl(
        compressedFile,
        transaction.id,
        transaction.amount,
        hotelId
      );
      return Promise.resolve(response);
    } catch (error) {
      return Promise.resolve(error);
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    let newTransaction = null;

    try {
      if (
        (values.amount >= 0 &&
          Number(values.categoryTypeId) !==
            TRANSACTION_CATEGORY_TYPES_IDS.INCOME) ||
        (values.amount < 0 &&
          Number(values.categoryTypeId) !==
            TRANSACTION_CATEGORY_TYPES_IDS.EXPENSE)
      ) {
        const { isConfirmed } =
          await confirmProceedWithMismatchedCategoryAmount(
            values.amount,
            Number(values.categoryTypeId)
          );
        if (!isConfirmed) return;
      }

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
        entityId: entity?.id,
        invoiceId: entity?.invoiceId,
      };

      await Swal.fire({
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

      onTransactionAdded(newTransaction);
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

  return (
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
          const subcategoryTypeId = TRANSACTION_CATEGORIES.find(
            (cat) => cat.id === Number(subcategoryCategoryId)
          )?.typeId;

          setFieldValue("subcategoryId", selectedSubcategoryId);
          if (subcategoryCategoryId) {
            setFieldValue("categoryId", subcategoryCategoryId);
            setFieldValue("categoryTypeId", subcategoryTypeId);
          }
        };

        const handleCategoryChange = (e) => {
          const selectedCategoryId = e.target.value;
          const categoryTypeId =
            e.target.options[e.target.selectedIndex].dataset.type;
          setFieldValue("categoryId", selectedCategoryId);
          setFieldValue("categoryTypeId", categoryTypeId);
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
              <Button type="button" onClick={handleCancelClick}>
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
                  <option value="">
                    {isLoadingHotelData ? "Cargando..." : "Seleccionar"}
                  </option>
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
                  <option value="">
                    {isLoadingHotelData ? "Cargando..." : "Opcional"}
                  </option>
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
                <InputGroup>
                  <CustomField
                    name="categoryId"
                    as="select"
                    className="form-control"
                    disabled={values.subcategoryId}
                    placeholder="Categoría"
                    onChange={handleCategoryChange}
                    isRequired={true}>
                    <option value="">Seleccionar</option>
                    {TRANSACTION_CATEGORIES.map((cat) => (
                      <option
                        key={cat.id}
                        value={cat.id}
                        data-type={cat.typeId}>
                        {cat.name}
                      </option>
                    ))}
                  </CustomField>
                  <InputGroupText className="mb-3">
                    <TransactionCategoriesExplanationIcon />
                  </InputGroupText>
                </InputGroup>
              </Col>
              <Col md={3}>
                <CustomField
                  name="financePartnerId"
                  as="select"
                  className="form-control"
                  placeholder="Socio Financiero">
                  <option value="">
                    {isLoadingHotelData ? "Cargando..." : "Opcional"}
                  </option>
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
  );
}

export default TransactionAddForm;
