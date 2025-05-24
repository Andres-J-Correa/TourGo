import React from "react";
import { Row, Col } from "reactstrap";
import dayjs from "dayjs";

function BookingAuditableInfo({ booking }) {
  return (
    <Row>
      <h5>Auditable</h5>
      <Col>
        <strong>Creado por:</strong>
        <p>
          {booking?.createdBy?.firstName} {booking?.createdBy?.lastName}
        </p>
      </Col>
      <Col>
        <strong>Fecha de creación:</strong>
        <p>{dayjs(booking?.dateCreated).format("DD/MM/YYYY h:mm a")}</p>
      </Col>
      <Col>
        <strong>Modificado por:</strong>
        <p>
          {booking?.modifiedBy?.firstName} {booking?.modifiedBy?.lastName}
        </p>
      </Col>
      <Col>
        <strong>Fecha de modificación</strong>
        <p>{dayjs(booking?.dateModified).format("DD/MM/YYYY h:mm a")}</p>
      </Col>
    </Row>
  );
}

export default BookingAuditableInfo;
