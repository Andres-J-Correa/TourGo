import React from "react";
import { Row, Col } from "reactstrap";

import PersonalizedChargeForm from "components/bookings/booking-add-edit-view/PersonalizedChargeForm";
import ExtraChargeCard from "components/bookings/booking-add-edit-view/ExtraChargeCard";

import { EXTRA_CHARGE_TYPE_IDS } from "components/extra-charges/constants";

function PersonalizedCharges({ personalizedCharges, setPersonalizedCharges }) {
  const removeCharge = (charge) => {
    setPersonalizedCharges((prevCharges) => {
      const newState = [...prevCharges];
      const index = prevCharges.findIndex((c) => c.id === charge.id);
      if (index > -1) {
        newState.splice(index, 1);
      }
      return newState;
    });
  };

  const handleSubmit = (newCharge, { resetForm }) => {
    setPersonalizedCharges((prevCharges) => {
      const newState = [...prevCharges];
      newState.push(newCharge);
      return newState;
    });
    resetForm();
    if (document.activeElement) {
      document.activeElement.blur();
    }
  };

  return (
    <div>
      <h5 className="mb-3">Cargos Personalizados</h5>
      <Row className="justify-content-center">
        {personalizedCharges.length > 0 &&
          personalizedCharges.map((charge, i) => {
            return (
              <Col
                key={`personalized-charge-${i}`}
                sm="6"
                md="4"
                lg="2"
                className="mb-3">
                <ExtraChargeCard
                  charge={charge}
                  onClick={() => removeCharge(charge)}
                  isSelected={true}
                  typeIdOverride={EXTRA_CHARGE_TYPE_IDS.CUSTOM}
                />
              </Col>
            );
          })}
        <Col xs="12" className="text-center">
          <PersonalizedChargeForm onSubmit={handleSubmit} />
        </Col>
      </Row>
    </div>
  );
}

export default PersonalizedCharges;
