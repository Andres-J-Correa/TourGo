import { useEffect, useState, useMemo, useCallback } from "react";

import DatePickersV2 from "components/commonUI/forms/DatePickersV2";

import { Row, Col, Label, Input, InputGroup, Button, Form } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBroom, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import Select, { components } from "react-select";

import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_STATUSES,
  TRANSACTION_CATEGORY_TYPES_IDS,
} from "components/transactions/constants";
import { getPaymentMethodsByHotelId } from "services/paymentMethodService";
import { getFinancePartnersByHotelId } from "services/financePartnerService";
import { getTransactionSubcategories } from "services/transactionsSubcategoryService";

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

  const [transactionIdInput, setTransactionIdInput] = useState("");
  const [referenceNumberInput, setReferenceNumberInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [entityIdInput, setEntityIdInput] = useState("");
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

  const getCsvOptions = useCallback((selectedOptions) => {
    const values = selectedOptions.map((option) => option.value).join(",");

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
            (selected) => selected.value === option.value
          )
      );
      const newSelected = [...(selectedCategories || []), ...toSelect];
      setSelectedCategories(newSelected);
      handleCategoryChange(getCsvOptions(newSelected));
    },
    [
      reactSelectOptions,
      selectedCategories,
      getCsvOptions,
      handleCategoryChange,
    ]
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

  const onTransactionInputChange = (e) => {
    const { value } = e.target;
    setTransactionIdInput(value);
  };

  const handleTransactionIdFilterSubmit = (e) => {
    e.preventDefault();
    if (!transactionIdInput && !paginationData.txnId) return;
    handleTransactionIdInputChange(transactionIdInput.trim());
  };

  const onReferenceNumberInputChange = (e) => {
    const { value } = e.target;
    setReferenceNumberInput(value);
  };

  const handleReferenceNumberFilterSubmit = (e) => {
    e.preventDefault();
    if (!referenceNumberInput && !paginationData.referenceNumber) return;
    handleReferenceNumberInputChange(referenceNumberInput.trim());
  };

  const onDescriptionInputChange = (e) => {
    const { value } = e.target;
    setDescriptionInput(value);
  };

  const handleDescriptionFilterSubmit = (e) => {
    e.preventDefault();
    if (!descriptionInput && !paginationData.description) return;
    handleDescriptionInputChange(descriptionInput.trim());
  };

  const onEntityIdInputChange = (e) => {
    const { value } = e.target;
    setEntityIdInput(value);
  };

  const handleEntityIdFilterSubmit = (e) => {
    e.preventDefault();
    if (!entityIdInput && !paginationData.entityId) return;
    handleEntityIdInputChange(entityIdInput.trim());
  };

  const onCategoryChange = (selectedOptions) => {
    handleCategoryChange(getCsvOptions(selectedOptions));
    setSelectedCategories(selectedOptions);
  };

  const onSubcategoryChange = (selectedOptions) => {
    handleSubcategoryChange(getCsvOptions(selectedOptions));
    setSelectedSubcategories(selectedOptions);
  };

  const onPaymentMethodChange = (selectedOptions) => {
    handlePaymentMethodChange(getCsvOptions(selectedOptions));
    setSelectedPaymentMethods(selectedOptions);
  };

  const onFinancePartnerChange = (selectedOptions) => {
    handleFinancePartnerChange(getCsvOptions(selectedOptions));
    setSelectedFinancePartners(selectedOptions);
  };

  const onStatusChange = (selectedOptions) => {
    handleStatusChange(getCsvOptions(selectedOptions));
    setSelectedStatuses(selectedOptions);
  };

  const onHasDocumentChange = (selectedOption) => {
    handleHasDocumentUrlChange(selectedOption?.value);
    setSelectedHasDocument(selectedOption);
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
    setSelectedCategories(null);
    setSelectedSubcategories(null);
    setSelectedPaymentMethods(null);
    setSelectedFinancePartners(null);
    setSelectedStatuses(null);
    setSelectedHasDocument(null);
  };

  useEffect(() => {
    if (hotelId) {
      Promise.allSettled([
        getPaymentMethodsByHotelId(hotelId),
        getFinancePartnersByHotelId(hotelId),
        getTransactionSubcategories(hotelId),
      ]).then(
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
      );
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
