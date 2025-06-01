import React from "react";
import { Link } from "react-router-dom";
import { Row, Col } from "reactstrap";
import PropTypes from "prop-types";
import ExtraChargeCard from "components/bookings/booking-add-edit-view/ExtraChargeCard";
import "./ExtraChargesSelector.css"; // Assuming you have some CSS for styling

const ExtraChargesSelector = ({
  charges,
  selectedCharges,
  toggleCharge,
  hotelId,
}) => {
  return (
    <Row className="justify-content-center">
      {charges?.length > 0 ? (
        charges.map((charge) => {
          const isSelected = selectedCharges.some(
            (c) => c.extraChargeId === charge.id
          );

          return (
            <Col sm="6" md="4" lg="2" key={charge.id} className="mb-3">
              <ExtraChargeCard
                key={charge.id}
                charge={charge}
                onClick={() => toggleCharge(charge)}
                isSelected={isSelected}
              />
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
