// components/bookings/ExtraChargesSelector.jsx
import React from "react";
import { Row, Col, Card, CardBody, CardTitle, CardText } from "reactstrap";
import { chargeTypeLabels, formatAmount } from "../constants";
import PropTypes from "prop-types";
import "./ExtraChargesSelector.css"; // Assuming you have some CSS for styling

const ExtraChargesSelector = ({ charges, selectedCharges, toggleCharge }) => {
  return (
    <Row className="justify-content-evenly">
      {charges.map((charge) => {
        const isSelected = selectedCharges.some(
          (c) => c.extraChargeId === charge.id
        );

        return (
          <Col sm="6" md="4" lg="2" key={charge.id} className="mb-3">
            <Card
              onClick={() => toggleCharge(charge)}
              className={`h-100 cursor-pointer extra-charge-card ${
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
};
