import { useEffect, useState, useMemo, useCallback } from "react";

import DatePickersV2 from "components/commonUI/forms/DatePickersV2";

import { Row, Col, Label, Input, InputGroup, Button, Form } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBroom, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";

import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_STATUSES,
} from "components/transactions/constants";
import { getPaymentMethodsByHotelId } from "services/paymentMethodService";
import { getFinancePartnersByHotelId } from "services/financePartnerService";
import { getTransactionSubcategories } from "services/transactionsSubcategoryService";

import classNames from "classnames";
import { toast } from "react-toastify";
import { useLanguage } from "contexts/LanguageContext";

function TransactionsTableFilters({
  hotelId,
  paginationData,
  loading,
  handleDateChange,
  handleCategoryChange,
  handleStatusChange,
  handleSubcategoryChange,
  handleFinancePartnerChange,
  handlePaymentMethodChange,
  handleTransactionIdInputChange,
  handleReferenceNumberInputChange,
  handleDescriptionInputChange,
  handleEntityIdInputChange,
  handleHasDocumentUrlChange,
  handleClearAllFilters,
}) {
  const { t } = useLanguage();
  const [selectData, setSelectData] = useState({
    paymentMethods: [],
    transactionSubcategories: [],
    financePartners: [],
  });
  const [isLoadingSelectData, setIsLoadingSelectData] = useState(false);
  const [transactionIdInput, setTransactionIdInput] = useState("");
  const [referenceNumberInput, setReferenceNumberInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [entityIdInput, setEntityIdInput] = useState("");

  const selectOptions = useMemo(() => {
    const transactionCategoriesOptions = TRANSACTION_CATEGORIES.map(
      (category) => (
        <option
          key={`transaction-category-${category.id}`}
          value={category.id}
          className={classNames({
            "selected-option":
              Number(paginationData.categoryId) === category.id,
          })}>
          {t(category.name)}
        </option>
      )
    );

    const transactionStatusesOptions = TRANSACTION_STATUSES.map((status) => (
      <option
        key={`transaction status-${status.id}`}
        value={status.id}
        className={classNames({
          "selected-option": Number(paginationData.statusId) === status.id,
        })}>
        {t(status.name)}
      </option>
    ));

    const paymentMethodsOptions = selectData.paymentMethods.map((method) => (
      <option
        key={`payment-method-${method.id}`}
        value={method.id}
        className={classNames({
          "selected-option":
            Number(paginationData.paymentMethodId) === method.id,
        })}>
        {method.name}
      </option>
    ));

    const transactionSubcategoriesOptions =
      selectData.transactionSubcategories.map((subcategory) => (
        <option
          key={`transaction-subcategory-${subcategory.id}`}
          value={subcategory.id}
          className={classNames({
            "selected-option":
              Number(paginationData.subcategoryId) === subcategory.id,
          })}>
          {subcategory.name}
        </option>
      ));

    const financePartnersOptions = selectData.financePartners.map((partner) => (
      <option
        key={`finance-partner-${partner.id}`}
        value={partner.id}
        className={classNames({
          "selected-option":
            Number(paginationData.financePartnerId) === partner.id,
        })}>
        {partner.name}
      </option>
    ));

    return {
      transactionCategories: transactionCategoriesOptions,
      transactionStatuses: transactionStatusesOptions,
      paymentMethods: paymentMethodsOptions,
      transactionSubcategories: transactionSubcategoriesOptions,
      financePartners: financePartnersOptions,
    };
  }, [selectData, paginationData, t]);

  const reactSelectOptions = useMemo(() => {
    const documentOptions = [
      { value: "true", label: t("transactions.filters.withDocument") },
      { value: "false", label: t("transactions.filters.withoutDocument") },
    ];

    const categories = TRANSACTION_CATEGORIES.map((category) => ({
      value: category.id,
      label: t(category.name),
    }));

    const subcategories = selectData.transactionSubcategories.map(
      (subcategory) => ({
        value: subcategory.id,
        label: subcategory.name,
      })
    );

    const paymentMethods = selectData.paymentMethods.map((method) => ({
      value: method.id,
      label: method.name,
    }));

    const financePartners = selectData.financePartners.map((partner) => ({
      value: partner.id,
      label: partner.name,
    }));

    const statuses = TRANSACTION_STATUSES.map((status) => ({
      value: status.id,
      label: t(status.name),
    }));

    return {
      categories,
      documentOptions,
      paymentMethods,
      subcategories,
      financePartners,
      statuses,
    };
  }, [t, selectData]);

  const onTransactionInputChange = (e) => {
    const { value } = e.target;
    setTransactionIdInput(value);
  };

  const handleTransactionIdFilterSubmit = (e) => {
    e.preventDefault();
    if (!transactionIdInput) return;
    handleTransactionIdInputChange(transactionIdInput.trim());
  };

  const onReferenceNumberInputChange = (e) => {
    const { value } = e.target;
    setReferenceNumberInput(value);
  };

  const handleReferenceNumberFilterSubmit = (e) => {
    e.preventDefault();
    if (!referenceNumberInput) return;
    handleReferenceNumberInputChange(referenceNumberInput.trim());
  };

  const onDescriptionInputChange = (e) => {
    const { value } = e.target;
    setDescriptionInput(value);
  };

  const handleDescriptionFilterSubmit = (e) => {
    e.preventDefault();
    if (!descriptionInput) return;
    handleDescriptionInputChange(descriptionInput.trim());
  };

  const onEntityIdInputChange = (e) => {
    const { value } = e.target;
    setEntityIdInput(value);
  };

  const handleEntityIdFilterSubmit = (e) => {
    e.preventDefault();
    if (!entityIdInput) return;
    handleEntityIdInputChange(entityIdInput.trim());
  };

  const onClearTransactionId = () => {
    setTransactionIdInput("");
    if (!paginationData.txnId) return;
    handleTransactionIdInputChange("");
  };

  const onClearReferenceNumber = () => {
    setReferenceNumberInput("");
    if (!paginationData.referenceNumber) return;
    handleReferenceNumberInputChange("");
  };

  const onClearDescription = () => {
    setDescriptionInput("");
    if (!paginationData.description) return;
    handleDescriptionInputChange("");
  };

  const onClearEntityId = () => {
    setEntityIdInput("");
    if (!paginationData.entityId) return;
    handleEntityIdInputChange("");
  };

  const onClearAllFilters = () => {
    if (
      !paginationData.dates?.start &&
      !paginationData.dates?.end &&
      !paginationData.categoryId &&
      !paginationData.subcategoryId &&
      !paginationData.paymentMethodId &&
      !paginationData.financePartnerId &&
      !paginationData.statusId &&
      !paginationData.hasDocumentUrl &&
      !paginationData.txnId &&
      !paginationData.referenceNumber &&
      !paginationData.description &&
      !paginationData.entityId
    )
      return;

    setTransactionIdInput("");
    setReferenceNumberInput("");
    setDescriptionInput("");
    setEntityIdInput("");
    handleClearAllFilters();
  };

  const getCsvOptions = useCallback((selectedOptions) => {
    const values = selectedOptions.map((option) => option.value).join(",");

    return values;
  }, []);

  useEffect(() => {
    if (hotelId) {
      setIsLoadingSelectData(true);
      Promise.allSettled([
        getPaymentMethodsByHotelId(hotelId),
        getFinancePartnersByHotelId(hotelId),
        getTransactionSubcategories(hotelId),
      ])
        .then(
          ([
            paymentMethodsResult,
            financePartnersResult,
            transactionSubcategoriesResult,
          ]) => {
            const errors = [];

            if (paymentMethodsResult.status === "fulfilled") {
              setSelectData((prev) => ({
                ...prev,
                paymentMethods: paymentMethodsResult.value.items,
              }));
            } else if (paymentMethodsResult.reason?.response?.status !== 404) {
              errors.push("Error al cargar los métodos de pago");
            }

            if (financePartnersResult.status === "fulfilled") {
              setSelectData((prev) => ({
                ...prev,
                financePartners: financePartnersResult.value.items,
              }));
            } else if (financePartnersResult.reason?.response?.status !== 404) {
              errors.push("Error al cargar los socios financieros");
            }

            if (transactionSubcategoriesResult.status === "fulfilled") {
              setSelectData((prev) => ({
                ...prev,
                transactionSubcategories:
                  transactionSubcategoriesResult.value.items,
              }));
            } else if (
              transactionSubcategoriesResult.reason?.response?.status !== 404
            ) {
              errors.push("Error al cargar las subcategorías de transacción");
            }

            if (errors.length > 0) {
              toast.error(errors.join(" | "));
            }
          }
        )
        .finally(() => {
          setIsLoadingSelectData(false);
        });
    }
  }, [hotelId]);

  return (
    <div>
      <Row>
        <Col lg={12} xl={3}>
          <DatePickersV2
            startDate={paginationData.dates?.start}
            endDate={paginationData.dates?.end}
            handleStartChange={handleDateChange("start")}
            handleEndChange={handleDateChange("end")}
            disabled={loading}
            allowSameDay={true}
          />
        </Col>
        <Col md={6} xl={3} className="mb-3">
          <Form onSubmit={handleTransactionIdFilterSubmit}>
            <Label for="transactionId" className="text-dark">
              {t("transactions.filters.transactionId")}
            </Label>
            <InputGroup>
              <Input
                id="transactionId"
                type="text"
                placeholder={t("transactions.filters.transactionIdPlaceholder")}
                value={transactionIdInput}
                onChange={onTransactionInputChange}
                disabled={loading}
              />
              <Button
                title={t("transactions.filters.filter")}
                color="dark"
                type="submit"
                disabled={loading}>
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </Button>
              <Button
                color="outline-secondary"
                type="button"
                title={t("transactions.filters.clear")}
                onClick={onClearTransactionId}
                disabled={loading || !transactionIdInput}>
                <FontAwesomeIcon icon={faBroom} />
              </Button>
            </InputGroup>
          </Form>
        </Col>
        <Col md={6} xl={3} className="mb-3">
          <Form onSubmit={handleReferenceNumberFilterSubmit}>
            <Label for="referenceNumber" className="text-dark">
              {t("transactions.filters.referenceNumber")}
            </Label>
            <InputGroup>
              <Input
                id="referenceNumber"
                type="text"
                placeholder={t(
                  "transactions.filters.referenceNumberPlaceholder"
                )}
                value={referenceNumberInput}
                disabled={loading}
                onChange={onReferenceNumberInputChange}
              />
              <Button
                title={t("transactions.filters.filter")}
                color="dark"
                type="submit"
                disabled={loading}>
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </Button>
              <Button
                color="outline-secondary"
                type="button"
                title={t("transactions.filters.clear")}
                onClick={onClearReferenceNumber}
                disabled={loading || !referenceNumberInput}>
                <FontAwesomeIcon icon={faBroom} />
              </Button>
            </InputGroup>
          </Form>
        </Col>
        <Col md={6} xl={3} className="mb-3">
          <Form onSubmit={handleEntityIdFilterSubmit}>
            <Label for="entityId" className="text-dark">
              {t("transactions.filters.entityId")}
            </Label>
            <InputGroup>
              <Input
                id="entityId"
                type="text"
                placeholder={t("transactions.filters.entityIdPlaceholder")}
                value={entityIdInput}
                onChange={onEntityIdInputChange}
                disabled={loading}
              />
              <Button
                title={t("transactions.filters.filter")}
                color="dark"
                type="submit"
                disabled={loading}>
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </Button>
              <Button
                color="outline-secondary"
                type="button"
                title={t("transactions.filters.clear")}
                onClick={onClearEntityId}
                disabled={loading || !entityIdInput}>
                <FontAwesomeIcon icon={faBroom} />
              </Button>
            </InputGroup>
          </Form>
        </Col>
        <Col md={6} xl={3} className="mb-3">
          <Form onSubmit={handleDescriptionFilterSubmit}>
            <Label for="description" className="text-dark">
              {t("transactions.filters.description")}
            </Label>
            <InputGroup>
              <Input
                id="description"
                type="text"
                placeholder={t("transactions.filters.descriptionPlaceholder")}
                value={descriptionInput}
                onChange={onDescriptionInputChange}
                disabled={loading}
              />
              <Button
                title={t("transactions.filters.filter")}
                color="dark"
                type="submit"
                disabled={loading}>
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </Button>
              <Button
                color="outline-secondary"
                type="button"
                title={t("transactions.filters.clear")}
                onClick={onClearDescription}
                disabled={loading || !descriptionInput}>
                <FontAwesomeIcon icon={faBroom} />
              </Button>
            </InputGroup>
          </Form>
        </Col>

        <Col md={6} xl={3} className="mb-3">
          <Label for="hasDocumentUrl" className="text-dark">
            {t("transactions.filters.document")}
          </Label>
          <Select
            id="hasDocumentUrl"
            options={reactSelectOptions.documentOptions}
            isClearable
            isDisabled={loading}
            placeholder={t("transactions.filters.select")}
            onChange={(selectedOption) =>
              handleHasDocumentUrlChange(selectedOption?.value)
            }
          />
        </Col>
      </Row>
      <Row>
        <Col sm="6" lg="4" xl="3" className="mb-3">
          <Label for="transaction-category" className="text-dark">
            {t("transactions.filters.categories")}
          </Label>
          <Select
            id="transaction-category"
            isMulti
            options={reactSelectOptions.categories}
            onChange={(selectedOptions) =>
              handleCategoryChange(getCsvOptions(selectedOptions))
            }
            isClearable
            isDisabled={loading}
            placeholder={t("transactions.filters.select")}
          />
        </Col>
        <Col sm="6" lg="4" xl="3" className="mb-3">
          <Label for="transaction-subcategory" className="text-dark">
            {t("transactions.filters.subcategories")}
          </Label>
          <Select
            id="transaction-subcategory"
            options={reactSelectOptions.subcategories}
            isClearable
            isMulti
            isDisabled={loading}
            placeholder={t("transactions.filters.select")}
            onChange={(selectedOptions) =>
              handleSubcategoryChange(getCsvOptions(selectedOptions))
            }
          />
        </Col>
        <Col sm="6" lg="4" xl="3" className="mb-3">
          <Label for="payment-method" className="text-dark">
            {t("transactions.filters.paymentMethods")}
          </Label>
          <Select
            id="payment-method"
            options={reactSelectOptions.paymentMethods}
            isClearable
            isDisabled={loading}
            placeholder={t("transactions.filters.select")}
            isMulti
            onChange={(selectedOptions) =>
              handlePaymentMethodChange(getCsvOptions(selectedOptions))
            }
          />
        </Col>
        <Col sm="6" lg="4" xl="3" className="mb-3">
          <Label for="finance-partner" className="text-dark">
            {t("transactions.filters.financePartners")}
          </Label>

          <Select
            id="finance-partner"
            options={reactSelectOptions.financePartners}
            isMulti
            isClearable
            isDisabled={loading}
            placeholder={t("transactions.filters.select")}
            onChange={(selectedOptions) =>
              handleFinancePartnerChange(getCsvOptions(selectedOptions))
            }
          />
        </Col>
        <Col sm="6" lg="4" xl="3" className="mb-3">
          <Label for="statusId" className="text-dark">
            {t("transactions.filters.statuses")}
          </Label>
          <Select
            id="statusId"
            isMulti
            options={reactSelectOptions.statuses}
            isClearable
            isDisabled={loading}
            placeholder={t("transactions.filters.select")}
            onChange={(selectedOptions) =>
              handleStatusChange(getCsvOptions(selectedOptions))
            }
          />
        </Col>
      </Row>
      <Row>
        <Col className="align-content-end">
          <Button
            color="dark"
            type="button"
            className="float-end"
            onClick={onClearAllFilters}
            disabled={loading}>
            {t("transactions.filters.clearAll")}
          </Button>
        </Col>
      </Row>
    </div>
  );
}

export default TransactionsTableFilters;
