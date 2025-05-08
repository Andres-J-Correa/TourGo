import React from "react";
import { Row, Col } from "reactstrap";
import { formatPhoneNumber } from "utils/phoneHelper";

const CustomerInfo = ({ customer }) => (
  <>
    <h5>Cliente</h5>
    <Row>
      <Col md={7}>
        <Row>
          <strong>Nombre:</strong>
          <p className="mb-0">
            {customer.firstName} {customer.lastName}
          </p>
        </Row>
        <Row>
          <strong>Email:</strong>
          <p className="mb-0">{customer.email}</p>
        </Row>
      </Col>
      <Col md={5}>
        <Row>
          {" "}
          <strong>Documento:</strong>
          <p className="mb-0">{customer.documentNumber}</p>
        </Row>
        <Row>
          {" "}
          <strong>Teléfono:</strong>
          <p className="mb-0">{formatPhoneNumber(customer.phone)}</p>
        </Row>
      </Col>
    </Row>
  </>
);

export default CustomerInfo;
