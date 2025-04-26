// components/bookings/TotalsDisplay.jsx
import React from "react";
import { Row, Col } from "reactstrap";
import PropTypes from "prop-types";

const TotalsDisplay = ({ totals }) => {
  return (
    <>
      <hr />
      <Row className="mb-3">
        <Col md="4">
          <strong className="fs-5 text">Subtotal:</strong>
          <span className="float-end mt-1">
            {totals.subtotal.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
            })}
          </span>
        </Col>
        <Col md="4">
          <strong className="fs-5 text">Cargos:</strong>
          <span className="float-end mt-1">
            {totals.charges.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
            })}
          </span>
        </Col>
        <Col md="4">
          <strong className="fs-5 text">Total:</strong>
          <span className="float-end mt-1">
            {totals.total.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
            })}
          </span>
        </Col>
      </Row>
      <hr />
    </>
  );
};

export default TotalsDisplay;

TotalsDisplay.propTypes = {
  totals: PropTypes.shape({
    subtotal: PropTypes.number.isRequired,
    charges: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
  }).isRequired,
};
