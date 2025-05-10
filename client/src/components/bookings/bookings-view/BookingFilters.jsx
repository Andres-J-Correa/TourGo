import React from "react";
import { Row, Col, FormGroup, Label, Input, InputGroup } from "reactstrap";
import DatePickers from "components/commonUI/forms/DatePickers";

function BookingFilters({
  paginationData,
  loading,
  customerNameInputs,
  handleDateChange,
  toggleDateType,
  handleCustomerNameChange,
  onPageSizeChange,
}) {
  return (
    <Row>
      <Col md={3}>
        <Row className="text-dark">
          <DatePickers
            startDate={paginationData.dates?.start}
            endDate={paginationData.dates?.end}
            handleStartChange={handleDateChange("start")}
            handleEndChange={handleDateChange("end")}
            isDisabled={loading}
          />
        </Row>
        <Row className="px-3">
          <FormGroup switch>
            <Input
              type="switch"
              role="button"
              checked={!paginationData.isArrivalDate}
              onClick={toggleDateType}
              onChange={() => {}}
            />
            <Label check className="text-dark">
              {" "}
              Filtrar por Fecha de Salida
            </Label>
          </FormGroup>
        </Row>
      </Col>
      <Col md={4}>
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
        </InputGroup>
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
