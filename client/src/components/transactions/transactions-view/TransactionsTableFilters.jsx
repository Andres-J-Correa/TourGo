import { useState, useMemo, useCallback } from "react";

import DatePickersV2 from "components/commonUI/forms/DatePickersV2";

import { Row, Col, Label, Input, InputGroup, Button, Form } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBroom, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import Select, { components } from "react-select";
import classNames from "classnames";

import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_STATUSES,
  TRANSACTION_CATEGORY_TYPES_IDS,
} from "components/transactions/constants";
// data-fetching moved into custom hook
import useTransactionFiltersData from "./hooks/useTransactionFiltersData";

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
  handleSearch,
  hasPaginationDataChanged,
}) {
  const { t } = useLanguage();

  const selectData = useTransactionFiltersData(hotelId);

  const [selectedCategories, setSelectedCategories] = useState(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState(null);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState(null);
  const [selectedFinancePartners, setSelectedFinancePartners] = useState(null);
  const [selectedStatuses, setSelectedStatuses] = useState(null);
  const [selectedHasDocument, setSelectedHasDocument] = useState(null);

  const reactSelectOptions = useMemo(() => {
    const documentOptions = [
      { value: "true", label: t("transactions.filters.withDocument") },
      { value: "false", label: t("transactions.filters.withoutDocument") },
    ];

    const incomeCategories = [];
    const expenseCategories = [];
    const subcategories = [];

    TRANSACTION_CATEGORIES.forEach((category) => {
      const option = {
        value: category.id,
        label: t(category.name),
      };

      const subcategory = {
        options: [],
        label: t(category.name),
        id: category.id,
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

    selectData.transactionSubcategories.forEach((subcategory) => {
      subcategories
        .find((option) => option.id === subcategory.categoryId)
        ?.options.push({ value: subcategory.id, label: subcategory.name });
    });

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
      incomeCategories,
      expenseCategories,
    };
  }, [t, selectData]);

  const getNumberArray = useCallback((selectedOptions) => {
    const values = selectedOptions.map((option) => option.value);

    return values;
  }, []);

  const onGroupHeadingClick = useCallback(
    (e) => {
      const headingId = e.currentTarget.id;

      const toCompare =
        +headingId === +TRANSACTION_CATEGORY_TYPES_IDS.INCOME
          ? reactSelectOptions.incomeCategories
          : reactSelectOptions.expenseCategories;

      const toSelect = toCompare.filter(
        (option) =>
          !selectedCategories?.some(
            (selected) => selected.value === option.value,
          ),
      );
      const newSelected = [...(selectedCategories || []), ...toSelect];
      setSelectedCategories(newSelected);
      handleCategoryChange(getNumberArray(newSelected));
    },
    [
      reactSelectOptions,
      selectedCategories,
      getNumberArray,
      handleCategoryChange,
    ],
  );

  const GroupHeading = (props) => (
    <components.GroupHeading {...props}>
      <div
        id={props?.data?.id}
        className="cursor-pointer transactions-filter-group-header"
        onClick={onGroupHeadingClick}>
        <span>{props.children}</span>
      </div>
    </components.GroupHeading>
  );

  const handleTransactionIdChange = (e) => {
    handleTransactionIdInputChange(e.target.value);
  };

  const handleReferenceNumberChange = (e) => {
    handleReferenceNumberInputChange(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    handleDescriptionInputChange(e.target.value);
  };

  const handleEntityIdChange = (e) => {
    handleEntityIdInputChange(e.target.value);
  };

  const onCategoryChange = (selectedOptions) => {
    handleCategoryChange(getNumberArray(selectedOptions));
    setSelectedCategories(selectedOptions);
  };

  const onSubcategoryChange = (selectedOptions) => {
    handleSubcategoryChange(getNumberArray(selectedOptions));
    setSelectedSubcategories(selectedOptions);
  };

  const onPaymentMethodChange = (selectedOptions) => {
    handlePaymentMethodChange(getNumberArray(selectedOptions));
    setSelectedPaymentMethods(selectedOptions);
  };

  const onFinancePartnerChange = (selectedOptions) => {
    handleFinancePartnerChange(getNumberArray(selectedOptions));
    setSelectedFinancePartners(selectedOptions);
  };

  const onStatusChange = (selectedOptions) => {
    handleStatusChange(getNumberArray(selectedOptions));
    setSelectedStatuses(selectedOptions);
  };

  const onHasDocumentChange = (selectedOption) => {
    handleHasDocumentUrlChange(selectedOption?.value);
    setSelectedHasDocument(selectedOption);
  };

  const onClearTransactionId = () => {
    if (!paginationData.txnId) return;
    handleTransactionIdInputChange("");
  };

  const onClearReferenceNumber = () => {
    if (!paginationData.referenceNumber) return;
    handleReferenceNumberInputChange("");
  };

  const onClearDescription = () => {
    if (!paginationData.description) return;
    handleDescriptionInputChange("");
  };

  const onClearEntityId = () => {
    if (!paginationData.entityId) return;
    handleEntityIdInputChange("");
  };

  const onClearAllFilters = () => {
    handleClearAllFilters();
    setSelectedCategories(null);
    setSelectedSubcategories(null);
    setSelectedPaymentMethods(null);
    setSelectedFinancePartners(null);
    setSelectedStatuses(null);
    setSelectedHasDocument(null);
  };

  return (
    <Form onSubmit={handleSearch}>
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
          <Label for="transactionId" className="text-dark">
            {t("transactions.filters.transactionId")}
          </Label>
          <InputGroup>
            <Input
              id="transactionId"
              type="text"
              placeholder={t("transactions.filters.transactionIdPlaceholder")}
              value={paginationData.txnId}
              onChange={handleTransactionIdChange}
              disabled={loading}
            />
            <Button
              color="outline-secondary"
              type="button"
              title={t("transactions.filters.clear")}
              onClick={onClearTransactionId}
              disabled={loading || !paginationData.txnId}>
              <FontAwesomeIcon icon={faBroom} />
            </Button>
          </InputGroup>
        </Col>
        <Col md={6} xl={3} className="mb-3">
          <Label for="referenceNumber" className="text-dark">
            {t("transactions.filters.referenceNumber")}
          </Label>
          <InputGroup>
            <Input
              id="referenceNumber"
              type="text"
              placeholder={t("transactions.filters.referenceNumberPlaceholder")}
              value={paginationData.referenceNumber}
              disabled={loading}
              onChange={handleReferenceNumberChange}
            />
            <Button
              color="outline-secondary"
              type="button"
              title={t("transactions.filters.clear")}
              onClick={onClearReferenceNumber}
              disabled={loading || !paginationData.referenceNumber}>
              <FontAwesomeIcon icon={faBroom} />
            </Button>
          </InputGroup>
        </Col>
        <Col md={6} xl={3} className="mb-3">
          <Label for="entityId" className="text-dark">
            {t("transactions.filters.entityId")}
          </Label>
          <InputGroup>
            <Input
              id="entityId"
              type="text"
              placeholder={t("transactions.filters.entityIdPlaceholder")}
              value={paginationData.entityId}
              onChange={handleEntityIdChange}
              disabled={loading}
            />
            <Button
              color="outline-secondary"
              type="button"
              title={t("transactions.filters.clear")}
              onClick={onClearEntityId}
              disabled={loading || !paginationData.entityId}>
              <FontAwesomeIcon icon={faBroom} />
            </Button>
          </InputGroup>
        </Col>
        <Col md={6} xl={3} className="mb-3">
          <Label for="description" className="text-dark">
            {t("transactions.filters.description")}
          </Label>
          <InputGroup>
            <Input
              id="description"
              type="text"
              placeholder={t("transactions.filters.descriptionPlaceholder")}
              value={paginationData.description}
              onChange={handleDescriptionChange}
              disabled={loading}
            />
            <Button
              color="outline-secondary"
              type="button"
              title={t("transactions.filters.clear")}
              onClick={onClearDescription}
              disabled={loading || !paginationData.description}>
              <FontAwesomeIcon icon={faBroom} />
            </Button>
          </InputGroup>
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
            onChange={onHasDocumentChange}
            value={selectedHasDocument}
          />
        </Col>
      </Row>
      <Row>
        <Col sm="6" lg="4" xl="3" className="mb-3">
          <Label for="transaction-category" className="text-dark">
            {t("transactions.filters.categories")}
          </Label>
          <Select
            closeMenuOnSelect={false}
            id="transaction-category"
            isMulti
            options={reactSelectOptions.categories}
            onChange={onCategoryChange}
            isClearable
            isDisabled={loading}
            placeholder={t("transactions.filters.select")}
            value={selectedCategories}
            components={{ GroupHeading }}
          />
        </Col>
        <Col sm="6" lg="4" xl="3" className="mb-3">
          <Label for="transaction-subcategory" className="text-dark">
            {t("transactions.filters.subcategories")}
          </Label>
          <Select
            closeMenuOnSelect={false}
            id="transaction-subcategory"
            options={reactSelectOptions.subcategories}
            isClearable
            isMulti
            isDisabled={loading}
            placeholder={t("transactions.filters.select")}
            onChange={onSubcategoryChange}
            value={selectedSubcategories}
          />
        </Col>
        <Col sm="6" lg="4" xl="3" className="mb-3">
          <Label for="payment-method" className="text-dark">
            {t("transactions.filters.paymentMethods")}
          </Label>
          <Select
            closeMenuOnSelect={false}
            id="payment-method"
            options={reactSelectOptions.paymentMethods}
            isClearable
            isDisabled={loading}
            placeholder={t("transactions.filters.select")}
            isMulti
            onChange={onPaymentMethodChange}
            value={selectedPaymentMethods}
          />
        </Col>
        <Col sm="6" lg="4" xl="3" className="mb-3">
          <Label for="finance-partner" className="text-dark">
            {t("transactions.filters.financePartners")}
          </Label>

          <Select
            closeMenuOnSelect={false}
            id="finance-partner"
            options={reactSelectOptions.financePartners}
            isMulti
            isClearable
            isDisabled={loading}
            placeholder={t("transactions.filters.select")}
            onChange={onFinancePartnerChange}
            value={selectedFinancePartners}
          />
        </Col>
        <Col sm="6" lg="4" xl="3" className="mb-3">
          <Label for="statusId" className="text-dark">
            {t("transactions.filters.statuses")}
          </Label>
          <Select
            closeMenuOnSelect={false}
            id="statusId"
            isMulti
            options={reactSelectOptions.statuses}
            isClearable
            isDisabled={loading}
            placeholder={t("transactions.filters.select")}
            onChange={onStatusChange}
            value={selectedStatuses}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <Button
            color="dark"
            type="button"
            onClick={handleSearch}
            disabled={loading || !hasPaginationDataChanged}
            className={classNames({
              "filter-btn-glow": hasPaginationDataChanged,
            })}>
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className={classNames("me-2", {
                "fa-bounce": hasPaginationDataChanged,
              })}
            />
            {t("transactions.filters.filter")}
          </Button>
        </Col>
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
    </Form>
  );
}

export default TransactionsTableFilters;
