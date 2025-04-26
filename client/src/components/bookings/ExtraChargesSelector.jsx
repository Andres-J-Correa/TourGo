// components/bookings/ExtraChargesSelector.jsx
import React from "react";
import { Row, Col, Card, CardBody, CardTitle, CardText } from "reactstrap";
import { chargeTypeLabels, formatAmount } from "./constants";
import PropTypes from "prop-types";

const ExtraChargesSelector = ({
  charges,
  selectedCharges,
  toggleCharge,
  submitting,
}) => {
  return (
    <>
      {submitting ? (
        <div className="alert alert-warning text-center" role="alert">
          <strong>Selección de cargos desactivada</strong>
          <p className="mb-0">
            No se puede seleccionar cargos en este momento.
          </p>
        </div>
      ) : (
        <Row>
          {charges.map((charge) => {
            const isSelected = selectedCharges.some(
              (c) => c.extraChargeId === charge.id
            );

            return (
              <Col sm="6" md="4" lg="2" key={charge.id} className="mb-3">
                <Card
                  onClick={() => toggleCharge(charge)}
                  className={`h-100 cursor-pointer ${
                    isSelected
                      ? "border-success bg-success-subtle shadow-success"
                      : ""
                  }`}
                  type="button">
                  <CardBody>
                    <CardTitle tag="h5" className="mb-2">
                      {charge.name}
                    </CardTitle>
                    <CardText className="mb-1">
                      <strong>Tipo:</strong>{" "}
                      {chargeTypeLabels[charge.type?.id] || "N/A"}
                    </CardText>
                    <CardText>
                      <strong>Monto:</strong>{" "}
                      {formatAmount(charge.amount, charge.type?.id)}
                    </CardText>
                  </CardBody>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </>
  );
};

export default ExtraChargesSelector;

ExtraChargesSelector.propTypes = {
  charges: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.shape({
        id: PropTypes.number.isRequired,
      }),
      amount: PropTypes.number.isRequired,
    })
  ).isRequired,
  selectedCharges: PropTypes.arrayOf(
    PropTypes.shape({
      extraChargeId: PropTypes.number.isRequired,
    })
  ).isRequired,
  toggleCharge: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
};
