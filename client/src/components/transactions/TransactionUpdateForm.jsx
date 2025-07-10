import React from "react";

import CustomField from "components/commonUI/forms/CustomField";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import TransactionCategoriesExplanationIcon from "components/transactions/TransactionCategoriesExplanationIcon";

import { useAppContext } from "contexts/GlobalAppContext";
import { getDateString } from "utils/dateHelper";
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_CATEGORY_TYPES_IDS,
  useTransactionUpdateValidationSchema,
  sanitizeUpdatedTransaction,
} from "components/transactions/constants";
import { update } from "services/transactionService";
import { useLanguage } from "contexts/LanguageContext";
import { ERROR_CODES } from "constants/errorCodes";

import { Formik, Form } from "formik";
import { Button, Col, InputGroup, InputGroupText, Row } from "reactstrap";

import classNames from "classnames";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { isEqual } from "lodash";

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
  const transactionUpdateValidationSchema =
    useTransactionUpdateValidationSchema();

  const initialValues = {
    amount: transaction?.amount || 0,
    transactionDate: transaction?.transactionDate
      ? dayjs(transaction.transactionDate).format("YYYY-MM-DD")
      : dayjs().format("YYYY-MM-DD"),
    paymentMethodId: transaction?.paymentMethod?.id?.toString() || "",
    categoryId: transaction?.categoryId?.toString() || "",
    categoryTypeId:
      TRANSACTION_CATEGORIES.find(
        (cat) => cat.id === Number(transaction?.categoryId)
      )?.typeId?.toString() || "",
    subcategoryId: transaction?.subcategory?.id?.toString() || "",
    referenceNumber: transaction?.referenceNumber || "",
    description: transaction?.description || "",
    currencyCode: transaction?.currencyCode || "COP",
    financePartnerId: transaction?.financePartner?.id?.toString() || "",
  };

  const confirmProceedWithMismatchedCategoryAmount = (
    amount,
    categoryTypeId
  ) => {
    let message = "";
    const isIncome = categoryTypeId === TRANSACTION_CATEGORY_TYPES_IDS.INCOME;
    if (amount >= 0 && !isIncome) {
      message = t("transactions.updateForm.mismatchPositiveExpense");
    } else if (amount < 0 && isIncome) {
      message = t("transactions.updateForm.mismatchNegativeIncome");
    }
    return Swal.fire({
      icon: "warning",
      title: t("transactions.updateForm.mismatchTitle"),
      text: message,
      showCancelButton: true,
      confirmButtonText: t("transactions.updateForm.continue"),
      confirmButtonColor: "red",
      cancelButtonText: t("transactions.updateForm.reviewCategory"),
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
      title: t("transactions.updateForm.saveTitle"),
      html: `<strong>${t("transactions.updateForm.saveText")}</strong>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: t("transactions.updateForm.saveConfirm"),
      cancelButtonText: t("common.cancel"),
    });
  };

  const showLoading = (title = t("transactions.updateForm.savingTitle")) => {
    Swal.fire({
      title,
      text: t("transactions.updateForm.savingText"),
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
  };

  const handleSubmit = async (values, { resetForm, setFieldError }) => {
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

      const updatedTransaction = {
        ...transaction,
        ...sanitizeUpdatedTransaction(
          values,
          user.current,
          paymentMethods,
          transactionSubcategories,
          financePartners
        ),
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
      {({ values, setFieldValue, initialValues }) => {
        const handleDateChange = (e) => {
          const date = e.target.value;
          setFieldValue("transactionDate", getDateString(date));
        };

        const handleSubcategoryChange = (e) => {
          const selectedSubcategoryId = e.target.value;
          const subcategoryCategoryId =
            e.target.options[e.target.selectedIndex].dataset.category;
          const subcategoryTypeId =
            TRANSACTION_CATEGORIES.find(
              (cat) => cat.id === Number(subcategoryCategoryId)
            )?.typeId?.toString() || "";

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
          setFieldValue("subcategoryId", "");
        };

        return (
          <Form
            className={classNames("mt-4 p-3 border rounded shadow-lg", {
              "d-none": !showForm,
            })}>
            <h5 className="mb-3 text-center">
              {t("transactions.updateForm.title")}
            </h5>
            <div className="d-flex justify-content-end mb-3">
              <Button
                type="submit"
                color="success"
                className="me-2"
                disabled={isEqual(initialValues, values)}>
                {t("transactions.updateForm.save")}
              </Button>
              <Button type="button" onClick={handleCancelClick}>
                {t("common.cancel")}
              </Button>
            </div>
            <ErrorAlert />
            <Row>
              <Col md={4}>
                <CustomField
                  name="amount"
                  type="number"
                  className="form-control"
                  placeholder={t("transactions.table.amount")}
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
                  placeholder={t("transactions.table.transactionDate")}
                  onChange={handleDateChange}
                  isRequired={true}
                />
              </Col>
              <Col md={4}>
                <CustomField
                  name="referenceNumber"
                  className="form-control"
                  placeholder={t("transactions.table.referenceNumber")}
                />
              </Col>
            </Row>

            <Row>
              <Col md={3}>
                <CustomField
                  name="paymentMethodId"
                  as="select"
                  className="form-control"
                  placeholder={t("transactions.table.paymentMethod")}
                  isRequired={true}>
                  <option value="">
                    {isLoadingHotelData
                      ? t("transactions.filters.loading")
                      : t("transactions.filters.select")}
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
                  placeholder={t("transactions.table.subcategory")}
                  onChange={handleSubcategoryChange}>
                  <option value="">
                    {isLoadingHotelData
                      ? t("transactions.filters.loading")
                      : t("transactions.updateForm.optional")}
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
                    placeholder={t("transactions.table.category")}
                    onChange={handleCategoryChange}
                    isRequired={true}>
                    <option value="">{t("transactions.filters.select")}</option>
                    {TRANSACTION_CATEGORIES.map((cat) => (
                      <option
                        key={cat.id}
                        value={cat.id}
                        data-type={cat.typeId}>
                        {t(cat.name)}
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
                  placeholder={t("transactions.table.financePartner")}>
                  <option value="">
                    {isLoadingHotelData
                      ? t("transactions.filters.loading")
                      : t("transactions.updateForm.optional")}
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
              placeholder={t("transactions.table.description")}
            />
          </Form>
        );
      }}
    </Formik>
  );
}

export default TransactionUpdateForm;
