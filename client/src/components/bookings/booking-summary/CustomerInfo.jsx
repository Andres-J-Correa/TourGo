import React from "react";
import { Row, Col } from "reactstrap";
import { formatPhoneNumber } from "utils/phoneHelper";

const CustomerInfo = ({ customer }) => (
  <>
    <h5>Cliente</h5>
    <hr className="mb-1 mt-0" />
    <Row>
      <Col md={7}>
        <Row>
          <strong>Nombre:</strong>
          <p>
            {customer?.firstName} {customer?.lastName}
          </p>
        </Row>
        <Row>
          <strong>Email:</strong>
          <p>{customer?.email}</p>
        </Row>
      </Col>
      <Col md={5}>
        <Row>
          {" "}
          <strong>Documento:</strong>
          <p>{customer?.documentNumber}</p>
        </Row>
        <Row>
          {" "}
          <strong>Teléfono:</strong>
          <p>{formatPhoneNumber(customer?.phone)}</p>
        </Row>
      </Col>
    </Row>
  </>
);

export default CustomerInfo;
