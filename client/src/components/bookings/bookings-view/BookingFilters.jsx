import React, { useState } from "react";
import { Row, Col, Label, Input, InputGroup, Button, Form } from "reactstrap";
import { faRepeat } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DatePickers from "components/commonUI/forms/DatePickers";
import classNames from "classnames";

function BookingFilters({
  paginationData,
  loading,
  handleDateChange,
  handleFilterByCustomerName,
  handleFilterByExternalBookingId,
  handleClearCustomerNameFilter,
  handleClearExternalBookingIdFilter,
  toggleDateType,
  onPageSizeChange,
  handleClearDateFilters,
}) {
  const [customerNameInputs, setCustomerNameInputs] = useState({
    firstName: "",
    lastName: "",
  });
  const [externalBookingIdInput, setExternalBookingIdInput] = useState("");

  const handleCustomerNameChange = (e) => {
    const { name, value } = e.target;
    setCustomerNameInputs((prev) => ({
      ...prev,
      [name]: value.trim(),
    }));
  };

  const handleExternalBookingIdChange = (e) => {
    const { value } = e.target;
    setExternalBookingIdInput(value.trim());
  };

  const onClearCustomerNameFilter = () => {
    setCustomerNameInputs({ firstName: "", lastName: "" });
    if (
      !paginationData.customerNameFilters.firstName &&
      !paginationData.customerNameFilters.lastName
    )
      return;
    handleClearCustomerNameFilter();
  };

  const onClearExternalBookingIdFilter = () => {
    setExternalBookingIdInput("");
    if (!paginationData.externalBookingId) return;
    handleClearExternalBookingIdFilter();
  };

  const handleCustomerNameFilterSubmit = (e) => {
    e.preventDefault();
    const { firstName, lastName } = customerNameInputs;
    if (!firstName && !lastName) return;
    handleFilterByCustomerName(customerNameInputs);
  };

  const handleExternalBookingIdFilterSubmit = (e) => {
    e.preventDefault();
    if (!externalBookingIdInput) return;
    handleFilterByExternalBookingId(externalBookingIdInput);
  };

  return (
    <Row className="mb-3 px-3">
      <Col lg={12} xl={3}>
        <Row className="text-dark">
          <Col className="px-0" lg={8} xl={12}>
            <DatePickers
              startDate={paginationData.dates?.start}
              endDate={paginationData.dates?.end}
              handleStartChange={handleDateChange("start")}
              handleEndChange={handleDateChange("end")}
              isDisabled={loading}
              allowSameDay={true}
            />
          </Col>
          <Col className="px-0 align-content-center" lg={4} xl={12}>
            {paginationData.dates?.start && paginationData.dates?.end && (
              <div>
                <button
                  className={classNames("btn", {
                    "btn-dark": paginationData.isArrivalDate,
                    "btn-info": !paginationData.isArrivalDate,
                  })}
                  type="button"
                  onClick={toggleDateType}
                  disabled={loading}>
                  Filtrando por{" "}
                  {paginationData.isArrivalDate ? "Llegada" : "Salida"}
                  <FontAwesomeIcon icon={faRepeat} className="ms-2" size="sm" />
                </button>
                <Button
                  color="outline-secondary"
                  className="float-end ms-2"
                  type="button"
                  onClick={handleClearDateFilters}
                  disabled={loading}>
                  Limpiar
                </Button>
              </div>
            )}
          </Col>
        </Row>
      </Col>
      <Col lg={5} xl={4}>
        <Form onSubmit={handleCustomerNameFilterSubmit}>
          <Label className="text-dark">Filtrar por nombre de cliente:</Label>
          <InputGroup>
            <Input
              type="text"
              aria-label="First name"
              placeholder="Nombre"
              name="firstName"
              onChange={handleCustomerNameChange}
              value={customerNameInputs?.firstName}
            />
            <Input
              type="text"
              aria-label="Last name"
              placeholder="Apellido"
              name="lastName"
              onChange={handleCustomerNameChange}
              value={customerNameInputs?.lastName}
            />
            <Button color="dark" type="submit" disabled={loading}>
              Filtrar
            </Button>
            <Button
              color="outline-secondary"
              type="button"
              onClick={onClearCustomerNameFilter}
              disabled={
                loading ||
                (!customerNameInputs.firstName && !customerNameInputs.lastName)
              }>
              Limpiar
            </Button>
          </InputGroup>
        </Form>
      </Col>
      <Col lg={5} xl="auto">
        <Form onSubmit={handleExternalBookingIdFilterSubmit}>
          <Label className="text-dark">
            Filtrar por ID de reserva externa:
          </Label>
          <InputGroup>
            <Input
              type="text"
              placeholder="ID de reserva externa"
              value={externalBookingIdInput}
              onChange={handleExternalBookingIdChange}
            />
            <Button color="dark" type="submit" disabled={loading}>
              Filtrar
            </Button>
            <Button
              color="outline-secondary"
              type="button"
              onClick={onClearExternalBookingIdFilter}
              disabled={loading || !externalBookingIdInput}>
              Limpiar
            </Button>
          </InputGroup>
        </Form>
      </Col>
      <Col>
        <div className="float-end">
          <Label htmlFor="pageSize" className="text-dark">
            Filas por página:
          </Label>
          <select
            id="pageSize"
            className="form-select"
            value={paginationData.pageSize}
            onChange={onPageSizeChange}>
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </Col>
    </Row>
  );
}

export default BookingFilters;
