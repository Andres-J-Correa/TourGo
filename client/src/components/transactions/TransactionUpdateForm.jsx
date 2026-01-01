import React, { useMemo } from "react";

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
import isEqual from "lodash.isequal";
import { useNumericFormat } from "react-number-format";

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

  const { format } = useNumericFormat({
    thousandSeparator: ".",
    decimalSeparator: ",",
  });

  const reactSelectOptions = useMemo(() => {
    const incomeCategories = [];
    const expenseCategories = [];
    const subcategories = [];

    TRANSACTION_CATEGORIES.forEach((category) => {
      const option = {
        value: category.id,
        label: t(category.name),
        typeId: category.typeId,
      };

      const subcategory = {
        options: [],
        label: t(category.name),
        categoryId: category.id,
        description: category.description,
      };

      subcategories.push(subcategory);

      if (category.typeId === TRANSACTION_CATEGORY_TYPES_IDS.INCOME) {
        incomeCategories.push(option);
      }

      if (category.typeId === TRANSACTION_CATEGORY_TYPES_IDS.EXPENSE) {
        expenseCategories.push(option);
      }
    });

    const categories = [
      {
        label: t("transactions.filters.incomeCategories"),
        options: incomeCategories,
        id: TRANSACTION_CATEGORY_TYPES_IDS.INCOME,
      },
      {
        label: t("transactions.filters.expenseCategories"),
        options: expenseCategories,
        id: TRANSACTION_CATEGORY_TYPES_IDS.EXPENSE,
      },
    ];

    transactionSubcategories.forEach((subcategory) => {
      subcategories
        .find((group) => group.categoryId === subcategory.categoryId)
        ?.options.push({
          value: subcategory.id,
          label: subcategory.name,
          categoryId: subcategory.categoryId,
        });
    });

    const paymentMethodOptions = paymentMethods.map((pm) => ({
      value: pm.id,
      label: pm.name,
    }));

    const financePartnersOptions = financePartners.map((fp) => ({
      value: fp.id,
      label: fp.name,
    }));

    return {
      categories,
      subcategories,
      paymentMethodOptions,
      financePartnersOptions,
    };
  }, [t, transactionSubcategories, paymentMethods, financePartners]);

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

        const handleSubcategoryChange = (option) => {
          const selectedSubcategoryId = option ? option.value : "";
          const subcategoryCategoryId = option ? option.categoryId : "";

          const subcategoryTypeId =
            TRANSACTION_CATEGORIES.find(
              (cat) => cat.id === Number(subcategoryCategoryId)
            )?.typeId || "";

          setFieldValue("subcategoryId", selectedSubcategoryId);
          if (subcategoryCategoryId) {
            setFieldValue("categoryId", subcategoryCategoryId);
            setFieldValue("categoryTypeId", subcategoryTypeId);
          }
        };

        const handleCategoryChange = (option) => {
          const selectedCategoryId = option ? option.value : "";
          const categoryTypeId = option ? option.typeId : "";
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
                  type="text"
                  className="form-control"
                  placeholder={t("transactions.table.amount")}
                  isRequired={true}
                  disabled={true}
                  value={format(String(values.amount))}
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
                  useReactSelect={true}
                  options={reactSelectOptions.paymentMethodOptions}
                  placeholder={
                    isLoadingHotelData
                      ? t("transactions.filters.loading")
                      : t("transactions.table.paymentMethod")
                  }
                  isRequired={true}
                  isClearable={true}
                />
              </Col>
              <Col md={3}>
                <CustomField
                  name="subcategoryId"
                  useReactSelect={true}
                  options={reactSelectOptions.subcategories}
                  placeholder={
                    isLoadingHotelData
                      ? t("transactions.filters.loading")
                      : t("transactions.table.subcategory")
                  }
                  onChange={handleSubcategoryChange}
                />
              </Col>
              <Col md={3}>
                <CustomField
                  name="categoryId"
                  useReactSelect={true}
                  options={reactSelectOptions.categories}
                  label={
                    <>
                      {t("transactions.table.category")}{" "}
                      <TransactionCategoriesExplanationIcon />
                    </>
                  }
                  placeholder={t("transactions.table.category")}
                  onChange={handleCategoryChange}
                  isRequired={true}
                />
              </Col>
              <Col md={3}>
                <CustomField
                  name="financePartnerId"
                  useReactSelect={true}
                  options={reactSelectOptions.financePartnersOptions}
                  placeholder={
                    isLoadingHotelData
                      ? t("transactions.filters.loading")
                      : t("transactions.table.financePartner")
                  }
                  isClearable={true}
                />
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
