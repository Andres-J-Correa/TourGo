import React from "react";

import CustomField from "components/commonUI/forms/CustomField";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import TransactionCategoriesExplanationIcon from "components/transactions/TransactionCategoriesExplanationIcon";

import { useAppContext } from "contexts/GlobalAppContext";
import { getDate } from "utils/dateHelper";
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_CATEGORY_TYPES_IDS,
  transactionUpdateValidationSchema,
} from "components/transactions/constants";
import { update } from "services/transactionService";
import { useLanguage } from "contexts/LanguageContext";
import { ERROR_CODES } from "constants/errorCodes";

import { Formik, Form } from "formik";
import { Button, Col, InputGroup, InputGroupText, Row } from "reactstrap";

import classNames from "classnames";
import dayjs from "dayjs";
import Swal from "sweetalert2";

function TransactionUpdateForm({
  transaction,
  hotelId,
  showForm,
  handleCancelClick,
  onTransactionUpdated = () => {},
  paymentMethods,
  transactionSubcategories,
  financePartners,
  isLoadingHotelData,
}) {
  const { user } = useAppContext();
  const { t, getTranslatedErrorMessage } = useLanguage();

  const initialValues = {
    amount: transaction?.amount || 0,
    transactionDate: transaction?.transactionDate
      ? dayjs(transaction.transactionDate).format("YYYY-MM-DD")
      : dayjs().format("YYYY-MM-DD"),
    paymentMethodId: transaction?.paymentMethod?.id || "",
    categoryId: transaction?.categoryId || "",
    categoryTypeId:
      TRANSACTION_CATEGORIES.find(
        (cat) => cat.id === Number(transaction?.categoryId)
      )?.typeId || "",
    subcategoryId: transaction?.subcategory?.id || "",
    referenceNumber: transaction?.referenceNumber || "",
    description: transaction?.description || "",
    currencyCode: transaction?.currencyCode || "COP",
    financePartnerId: transaction?.financePartner?.id || "",
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

  const confirmTransactionSave = () => {
    return Swal.fire({
      title: "¿Actualizar Transacción?",
      html: "<strong>Revisa los datos antes de continuar.</strong>",
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

  const handleSubmit = async (values, { resetForm, setFieldError }) => {
    let updatedTransaction = null;
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

      const { isConfirmed: confirmSave } = await confirmTransactionSave();
      if (!confirmSave) return;

      showLoading("Guardando...");
      const response = await update(values, transaction.id, hotelId);
      if (!response.isSuccessful)
        throw new Error("Error al actualizar transacción");

      updatedTransaction = {
        ...transaction,
        ...values,
        modifiedBy: {
          id: user.current.id,
          firstName: user.current.firstName,
          lastName: user.current.lastName,
        },
        dateModified: dayjs().toDate(),
      };

      await Swal.fire({
        icon: "success",
        title: "Transacción actualizada",
        timer: 1500,
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      onTransactionUpdated(updatedTransaction);
      resetForm();
    } catch (error) {
      if (
        Number(error?.response?.data?.code) ===
        ERROR_CODES.TRANSACTION_REFERENCE_NUMBER_CONFLICT
      ) {
        setFieldError(
          "referenceNumber",
          t(
            `errors.custom.${ERROR_CODES.TRANSACTION_REFERENCE_NUMBER_CONFLICT}`
          )
        );
      }
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
    <Formik
      initialValues={initialValues}
      validationSchema={transactionUpdateValidationSchema}
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
            <h5 className="mb-3 text-center">Actualizar Transacción</h5>
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
                  disabled={true}
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
          </Form>
        );
      }}
    </Formik>
  );
}

export default TransactionUpdateForm;
