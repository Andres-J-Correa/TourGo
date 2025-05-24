import React, { useState } from "react";
import { Row, Col, Label, Input, InputGroup, Button, Form } from "reactstrap";
import {
  faRepeat,
  faBroom,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DatePickers from "components/commonUI/forms/DatePickers";
import classNames from "classnames";
import { BOOKING_STATUSES } from "components/bookings/constants";

function BookingFilters({
  paginationData,
  loading,
  handleDateChange,
  handleFilterByCustomerName,
  handleFilterByExternalBookingId,
  handleClearCustomerNameFilter,
  handleClearExternalBookingIdFilter,
  toggleDateType,
  handleClearDateFilters,
  handleFilterByStatusId,
  onPageSizeChange,
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
    <>
      {" "}
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
                handleClearDates={handleClearDateFilters}
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
                    <FontAwesomeIcon
                      icon={faRepeat}
                      className="ms-2"
                      size="sm"
                    />
                  </button>
                </div>
              )}
            </Col>
          </Row>
        </Col>
        <Col lg={6} xl={4}>
          <Form onSubmit={handleCustomerNameFilterSubmit}>
            <Label for="firstName" className="text-dark">
              Filtrar por nombre de cliente:
            </Label>
            <InputGroup>
              <Input
                id="firstName"
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
                title="Limpiar"
                onClick={onClearCustomerNameFilter}
                disabled={
                  loading ||
                  (!customerNameInputs.firstName &&
                    !customerNameInputs.lastName)
                }>
                <FontAwesomeIcon icon={faBroom} />
              </Button>
            </InputGroup>
          </Form>
        </Col>
        <Col lg={6} xl="auto">
          <Form onSubmit={handleExternalBookingIdFilterSubmit}>
            <Label for="externalBookingId" className="text-dark">
              Filtrar por ID de reserva externa:
            </Label>
            <InputGroup>
              <Input
                id="externalBookingId"
                type="text"
                placeholder="ID de reserva externa"
                value={externalBookingIdInput}
                onChange={handleExternalBookingIdChange}
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
                title="Limpiar"
                onClick={onClearExternalBookingIdFilter}
                disabled={loading || !externalBookingIdInput}>
                <FontAwesomeIcon icon={faBroom} />
              </Button>
            </InputGroup>
          </Form>
        </Col>
      </Row>
      <Row className="px-3 mb-3">
        <Col lg="auto" xl="auto">
          <Label for="statusId" className="text-dark">
            Filtrar por estado:
          </Label>
          <select
            id="statusId"
            className={classNames("form-select", {
              "bg-info-subtle": paginationData.statusId,
            })}
            disabled={loading}
            value={paginationData.statusId}
            onChange={(e) => {
              const { value } = e.target;
              handleFilterByStatusId(value);
            }}>
            <option
              className={classNames("form-select", {
                "bg-warning-subtle": paginationData.statusId,
              })}
              value="">
              {paginationData.statusId ? "Quitar Filtro" : "Seleccionar"}
            </option>
            {BOOKING_STATUSES.map((status) => (
              <option
                key={`${status.id}`}
                className={classNames({
                  "bg-info-subtle": paginationData.statusId === status.id,
                  "bg-white": paginationData.statusId !== status.id,
                })}
                value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        </Col>
        <Col>
          <div className="float-end">
            <Label for="pageSize" className="text-dark">
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
    </>
  );
}

export default BookingFilters;
