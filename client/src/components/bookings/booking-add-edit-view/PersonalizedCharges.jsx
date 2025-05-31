import React from "react";
import { Row, Col, Card, CardBody, CardTitle, CardText } from "reactstrap";

import PersonalizedChargeForm from "components/bookings/booking-add-edit-view/PersonalizedChargeForm";

import {
  EXTRA_CHARGE_TYPE_IDS,
  EXTRA_CHARGE_TYPES_BY_ID,
  formatExtraChargeAmount,
} from "components/extra-charges/constants";

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
      <Row className="justify-content-evenly">
        {personalizedCharges.length > 0 &&
          personalizedCharges.map((charge) => {
            return (
              <Col sm="6" md="4" lg="2" key={charge.id} className="mb-3">
                <Card
                  onClick={() => removeCharge(charge)}
                  className="h-100 cursor-pointer extra-charge-card border-success bg-success-subtle shadow-success"
                  type="button">
                  <CardBody>
                    <CardTitle tag="h5" className="mb-2">
                      {charge.name}
                    </CardTitle>
                    <CardText className="mb-1">
                      <strong>Tipo:</strong>{" "}
                      {EXTRA_CHARGE_TYPES_BY_ID[EXTRA_CHARGE_TYPE_IDS.CUSTOM] ||
                        "N/A"}
                    </CardText>
                    <CardText>
                      <strong>Monto:</strong>{" "}
                      {formatExtraChargeAmount(charge.amount)}
                    </CardText>
                  </CardBody>
                </Card>
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
