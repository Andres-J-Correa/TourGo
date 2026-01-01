import React, { useState, useMemo } from "react";

import CustomField from "components/commonUI/forms/CustomField";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import TransactionCategoriesExplanationIcon from "components/transactions/TransactionCategoriesExplanationIcon";
import FilePondDropzone from "components/commonUI/forms/FilePondDropzone";

import { useAppContext } from "contexts/GlobalAppContext";
import { getDateString } from "utils/dateHelper";
import { compressImage } from "utils/fileHelper";
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_CATEGORY_TYPES_IDS,
  useTransactionAddValidationSchema,
  sanitizeNewTransaction,
} from "components/transactions/constants";
import { add, updateDocumentUrl } from "services/transactionService";
import { useLanguage } from "contexts/LanguageContext";
import { ERROR_CODES } from "constants/errorCodes";

import { Formik, Form } from "formik";
import { Button, Col, InputGroup, InputGroupText, Row } from "reactstrap";
import { useNumericFormat } from "react-number-format";

import classNames from "classnames";
import dayjs from "dayjs";
import Swal from "sweetalert2";

function TransactionAddForm({
  hotelId,
  entity,
  submitting,
  showForm,
  setShowForm,
  paymentMethods,
  transactionSubcategories,
  financePartners,
  isLoadingHotelData,
  onTransactionAdded = () => {},
}) {
  const { user } = useAppContext();
  const { t, getTranslatedErrorMessage } = useLanguage();
  const transactionAddValidationSchema = useTransactionAddValidationSchema();

  const [files, setFiles] = useState([]);

  const { format, removeFormatting } = useNumericFormat({
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

    return {
      categories,
      subcategories,
    };
  }, [t, transactionSubcategories]);

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
      message = t("transactions.addForm.mismatchPositiveExpense");
    } else if (amount < 0 && isIncome) {
      message = t("transactions.addForm.mismatchNegativeIncome");
    }
    return Swal.fire({
      icon: "warning",
      title: t("transactions.addForm.mismatchTitle"),
      text: message,
      showCancelButton: true,
      confirmButtonText: t("transactions.addForm.continue"),
      confirmButtonColor: "red",
      cancelButtonText: t("transactions.addForm.reviewCategory"),
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
      title: t("transactions.addForm.noFileTitle"),
      text: t("transactions.addForm.noFileText"),
      showCancelButton: true,
      confirmButtonText: t("transactions.addForm.yesContinue"),
      confirmButtonColor: "red",
      cancelButtonText: t("transactions.addForm.noAttach"),
      reverseButtons: true,
      cancelButtonColor: "green",
    });
  };

  const confirmTransactionSave = () => {
    return Swal.fire({
      title: t("transactions.addForm.saveTitle"),
      html: `<strong>${t("transactions.addForm.saveText")}</strong>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: t("transactions.addForm.saveConfirm"),
      cancelButtonText: t("common.cancel"),
    });
  };

  const showLoading = (title = t("transactions.addForm.savingTitle")) => {
    Swal.fire({
      title,
      text: t("transactions.addForm.savingText"),
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
  };

  const handleFileUpload = async (transaction, file) => {
    try {
      let fileToUpload = file;

      if (file.type.startsWith("image/")) {
        fileToUpload = await compressImage(file, 35 * 1024); // 35 KB
      }

      const response = await updateDocumentUrl(
        fileToUpload,
        transaction.id,
        transaction.amount,
        hotelId
      );
      return Promise.resolve(response);
    } catch (error) {
      return Promise.resolve(error);
    }
  };

  const handleSubmit = async (values, { resetForm, setFieldError }) => {
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
      validationSchema={transactionAddValidationSchema}
      onSubmit={handleSubmit}
      enableReinitialize>
      {({ values, setFieldValue }) => {
        const handleDateChange = (e) => {
          const date = e.target.value;
          setFieldValue("transactionDate", getDateString(date));
        };

        const handleSubcategoryChange = (option) => {
          const selectedSubcategoryId = option ? option.value : "";
          const subcategoryCategoryId = option ? option.categoryId : "";

          const subcategoryTypeId = TRANSACTION_CATEGORIES.find(
            (cat) => cat.id === Number(subcategoryCategoryId)
          )?.typeId;

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

        const handleAmountChange = (e) => {
          const rawValue = e.target.value;
          const numericValue = removeFormatting(rawValue);
          setFieldValue("amount", numericValue);
        };

        return (
          <Form
            className={classNames("mt-4 p-3 border rounded shadow-lg", {
              "d-none": !showForm,
            })}>
            <h5 className="mb-3 text-center">
              {t("transactions.addForm.title")}
            </h5>
            <div className="d-flex justify-content-end mb-3">
              <Button type="submit" color="success" className="me-2">
                {t("transactions.addForm.save")}
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
                  onChange={handleAmountChange}
                  value={format(values.amount)}
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
                  isClearable={true}
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
                  isClearable={true}
                  name="categoryId"
                  useReactSelect={true}
                  options={reactSelectOptions.categories}
                  placeholder={t("transactions.table.category")}
                  onChange={handleCategoryChange}
                  isRequired={true}
                />
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
                      : t("transactions.addForm.optional")}
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

            <h6 className="text-center mt-3 mb-1">
              {t("transactions.addForm.attachDocument")}
              <span className="text-muted"> (.png, .jpg, .jpeg, .webp)</span>
              <br />
              <span className="text-muted">
                {t("transactions.addForm.maxSize")}
              </span>
            </h6>
            <Row className="justify-content-center">
              <Col lg={6}>
                <FilePondDropzone
                  files={files}
                  setFiles={(acceptedFiles) => setFiles(acceptedFiles)}
                  acceptedFileTypes={[
                    "image/png",
                    "image/jpeg",
                    "image/webp",
                    "image/jpg",
                    "application/pdf",
                  ]}
                  disabled={submitting}
                  allowMultiple={false}
                  maxFileSize={1000 * 1024} // 1 MB
                />
              </Col>
            </Row>
          </Form>
        );
      }}
    </Formik>
  );
}

export default TransactionAddForm;
