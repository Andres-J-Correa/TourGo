import React, { useEffect, useState, useMemo } from "react";

import DatePickers from "components/commonUI/forms/DatePickers";

import { Row, Col, Label, Input, InputGroup, Button, Form } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBroom, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_STATUSES,
} from "components/transactions/constants";
import { getPaymentMethodsByHotelId } from "services/paymentMethodService";
import { getFinancePartnersByHotelId } from "services/financePartnerService";
import { getTransactionSubcategories } from "services/transactionsSubcategoryService";

import classNames from "classnames";
import { toast } from "react-toastify";

function TransactionsTableFilters({
  hotelId,
  paginationData,
  loading,
  handleDateChange,
  handleClearDateFilters,
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
          {category.name}
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
        {status.name}
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
  }, [selectData, paginationData]);

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
          <DatePickers
            startDate={paginationData.dates?.start}
            endDate={paginationData.dates?.end}
            handleStartChange={handleDateChange("start")}
            handleEndChange={handleDateChange("end")}
            isDisabled={loading}
            allowSameDay={true}
            handleClearDates={handleClearDateFilters}
          />
        </Col>
        <Col lg="auto" xl="auto" className="mb-3">
          <Label for="transaction-category" className="text-dark">
            Categoría:
          </Label>
          <select
            id="transaction-category"
            className={classNames("form-select filter-select", {
              "bg-success-subtle": paginationData.categoryId,
            })}
            disabled={loading}
            value={paginationData.categoryId}
            onChange={(e) => {
              const { value } = e.target;
              handleCategoryChange(value);
            }}>
            <option
              className={classNames({
                "bg-dark-subtle": paginationData.categoryId,
              })}
              value="">
              {paginationData.categoryId ? "Quitar Filtro" : "Seleccionar"}
            </option>
            {selectOptions.transactionCategories}
          </select>
        </Col>
        <Col lg="auto" xl="auto" className="mb-3">
          <Label for="transaction-subcategory" className="text-dark">
            Subcategoría:
          </Label>
          <select
            id="transaction-subcategory"
            className={classNames("form-select filter-select", {
              "bg-success-subtle": paginationData.subcategoryId,
            })}
            disabled={loading}
            value={paginationData.subcategoryId}
            onChange={(e) => {
              const { value } = e.target;
              handleSubcategoryChange(value);
            }}>
            <option
              className={classNames({
                "bg-dark-subtle": paginationData.subcategoryId,
              })}
              value="">
              {isLoadingSelectData
                ? "cargando..."
                : paginationData.subcategoryId
                ? "Quitar Filtro"
                : "Seleccionar"}
            </option>
            {selectOptions.transactionSubcategories}
          </select>
        </Col>
        <Col lg="auto" xl="auto" className="mb-3">
          <Label for="payment-method" className="text-dark">
            Método de pago:
          </Label>
          <select
            id="payment-method"
            className={classNames("form-select filter-select", {
              "bg-success-subtle": paginationData.paymentMethodId,
            })}
            disabled={loading}
            value={paginationData.paymentMethodId}
            onChange={(e) => {
              const { value } = e.target;
              handlePaymentMethodChange(value);
            }}>
            <option
              className={classNames({
                "bg-dark-subtle": paginationData.paymentMethodId,
              })}
              value="">
              {isLoadingSelectData
                ? "cargando..."
                : paginationData.paymentMethodId
                ? "Quitar Filtro"
                : "Seleccionar"}
            </option>
            {selectOptions.paymentMethods}
          </select>
        </Col>
        <Col lg="auto" xl="auto" className="mb-3">
          <Label for="finance-partner" className="text-dark">
            Socio Financiero:
          </Label>
          <select
            id="finance-partner"
            className={classNames("form-select filter-select", {
              "bg-success-subtle": paginationData.financePartnerId,
            })}
            disabled={loading}
            value={paginationData.financePartnerId}
            onChange={(e) => {
              const { value } = e.target;
              handleFinancePartnerChange(value);
            }}>
            <option
              className={classNames({
                "bg-dark-subtle": paginationData.financePartnerId,
              })}
              value="">
              {isLoadingSelectData
                ? "cargando..."
                : paginationData.financePartnerId
                ? "Quitar Filtro"
                : "Seleccionar"}
            </option>
            {selectOptions.financePartners}
          </select>
        </Col>
        <Col lg="auto" xl="auto" className="mb-3">
          <Label for="statusId" className="text-dark">
            Estado:
          </Label>
          <select
            id="statusId"
            className={classNames("form-select filter-select", {
              "bg-success-subtle": paginationData.statusId,
            })}
            disabled={loading}
            value={paginationData.statusId}
            onChange={(e) => {
              const { value } = e.target;
              handleStatusChange(value);
            }}>
            <option
              className={classNames({
                "bg-dark-subtle": paginationData.statusId,
              })}
              value="">
              {paginationData.statusId ? "Quitar Filtro" : "Seleccionar"}
            </option>
            {selectOptions.transactionStatuses}
          </select>
        </Col>
        <Col lg="auto" xl="auto" className="mb-3">
          <Label for="hasDocumentUrl" className="text-dark">
            Comprobante
          </Label>
          <select
            id="hasDocumentUrl"
            className={classNames("form-select filter-select", {
              "bg-success-subtle": paginationData.hasDocumentUrl,
            })}
            disabled={loading}
            value={paginationData.hasDocumentUrl}
            onChange={(e) => {
              const { value } = e.target;
              handleHasDocumentUrlChange(value);
            }}>
            <option
              value=""
              className={classNames({
                "bg-dark-subtle": paginationData.hasDocumentUrl,
              })}>
              Todos
            </option>
            <option
              value="true"
              className={classNames({
                "selected-option": paginationData.hasDocumentUrl === "true",
              })}>
              Con Comprobante
            </option>
            <option
              value="false"
              className={classNames({
                "selected-option": paginationData.hasDocumentUrl === "false",
              })}>
              Sin Comprobante
            </option>
          </select>
        </Col>
      </Row>
      <Row>
        <Col lg={6} xl={3} className="mb-3">
          <Form onSubmit={handleTransactionIdFilterSubmit}>
            <Label for="transactionId" className="text-dark">
              Id de transacción:
            </Label>
            <InputGroup>
              <Input
                id="transactionId"
                type="number"
                placeholder="Id de transacción"
                value={transactionIdInput}
                onChange={onTransactionInputChange}
                disabled={loading}
              />
              <Button
                title="Filtrar"
                color="dark"
                type="submit"
                disabled={loading}>
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </Button>
              <Button
                color="outline-secondary"
                type="button"
                title="Limpiar filtro"
                onClick={onClearTransactionId}
                disabled={loading || !transactionIdInput}>
                <FontAwesomeIcon icon={faBroom} />
              </Button>
            </InputGroup>
          </Form>
        </Col>
        <Col lg={6} xl={3} className="mb-3">
          <Form onSubmit={handleReferenceNumberFilterSubmit}>
            <Label for="referenceNumber" className="text-dark">
              Número de referencia:
            </Label>
            <InputGroup>
              <Input
                id="referenceNumber"
                type="text"
                placeholder="Número de referencia"
                value={referenceNumberInput}
                disabled={loading}
                onChange={onReferenceNumberInputChange}
              />
              <Button
                title="Filtrar"
                color="dark"
                type="submit"
                disabled={loading}>
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </Button>
              <Button
                color="outline-secondary"
                type="button"
                title="Limpiar filtro"
                onClick={onClearReferenceNumber}
                disabled={loading || !referenceNumberInput}>
                <FontAwesomeIcon icon={faBroom} />
              </Button>
            </InputGroup>
          </Form>
        </Col>
        <Col lg={6} xl={3} className="mb-3">
          <Form onSubmit={handleEntityIdFilterSubmit}>
            <Label for="entityId" className="text-dark">
              Id de Entidad Asociada:
            </Label>
            <InputGroup>
              <Input
                id="entityId"
                type="number"
                placeholder="Id de entidad"
                value={entityIdInput}
                onChange={onEntityIdInputChange}
                disabled={loading}
              />
              <Button
                title="Filtrar"
                color="dark"
                type="submit"
                disabled={loading}>
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </Button>
              <Button
                color="outline-secondary"
                type="button"
                title="Limpiar filtro"
                onClick={onClearEntityId}
                disabled={loading || !entityIdInput}>
                <FontAwesomeIcon icon={faBroom} />
              </Button>
            </InputGroup>
          </Form>
        </Col>
        <Col lg={6} xl={3} className="mb-3">
          <Form onSubmit={handleDescriptionFilterSubmit}>
            <Label for="description" className="text-dark">
              Descripción:
            </Label>
            <InputGroup>
              <Input
                id="description"
                type="text"
                placeholder="Descripción"
                value={descriptionInput}
                onChange={onDescriptionInputChange}
                disabled={loading}
              />
              <Button
                title="Filtrar"
                color="dark"
                type="submit"
                disabled={loading}>
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </Button>
              <Button
                color="outline-secondary"
                type="button"
                title="Limpiar filtro"
                onClick={onClearDescription}
                disabled={loading || !descriptionInput}>
                <FontAwesomeIcon icon={faBroom} />
              </Button>
            </InputGroup>
          </Form>
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
            Limpiar Filtros
          </Button>
        </Col>
      </Row>
    </div>
  );
}

export default TransactionsTableFilters;
