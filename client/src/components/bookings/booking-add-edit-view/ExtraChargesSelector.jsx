import React from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, CardBody, CardTitle, CardText } from "reactstrap";
import {
  EXTRA_CHARGE_TYPES_BY_ID,
  formatExtraChargeAmount,
} from "components/extra-charges/constants";
import PropTypes from "prop-types";
import "./ExtraChargesSelector.css"; // Assuming you have some CSS for styling

const ExtraChargesSelector = ({
  charges,
  selectedCharges,
  toggleCharge,
  hotelId,
}) => {
  return (
    <Row className="justify-content-evenly">
      {charges?.length > 0 ? (
        charges.map((charge) => {
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
                    {EXTRA_CHARGE_TYPES_BY_ID[charge.type?.id] || "N/A"}
                  </CardText>
                  <CardText>
                    <strong>Monto:</strong>{" "}
                    {formatExtraChargeAmount(charge.amount, charge.type?.id)}
                  </CardText>
                </CardBody>
              </Card>
            </Col>
          );
        })
      ) : (
        <Col xs="12" className="text-center">
          <p>No hay cargos adicionales disponibles.</p>
          {hotelId && (
            <Link
              to={`/hotels/${hotelId}/extra-charges`}
              className="btn btn-dark">
              Ir a crear un nuevo cargo
            </Link>
          )}
        </Col>
      )}
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
