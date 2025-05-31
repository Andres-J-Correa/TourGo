import React, { useMemo } from "react";
import { Row, Col } from "reactstrap";
import { formatCurrency } from "utils/currencyHelper";
import {
  GENERAL_CHARGE_TYPES,
  EXTRA_CHARGE_TYPE_IDS,
} from "components/extra-charges/constants";

const BookingGeneralCharges = ({ bookingData }) => {
  const generalExtracharges = useMemo(() => {
    const extraCharges =
      bookingData?.extraCharges?.length > 0
        ? bookingData?.extraCharges?.filter((charge) =>
            GENERAL_CHARGE_TYPES.includes(charge?.type?.id)
          )
        : [];

    const personalizedCharges =
      bookingData?.personalizedCharges?.length > 0
        ? bookingData.personalizedCharges
        : [];

    return [...extraCharges, ...personalizedCharges];
  }, [bookingData]);

  const mapExtraCharge = (charge, index) => {
    let amount = 0;
    switch (Number(charge.type.id)) {
      case EXTRA_CHARGE_TYPE_IDS.PER_PERSON:
        amount = charge.amount * (bookingData?.adultGuests || 0);
        break;
      default:
        amount = charge.amount;
        break;
    }

    return (
      <Col key={`charge-${index}`} md={4}>
        <div className="line-item">
          <span className="line-label fw-bold">{charge.name}</span>
          <div className="line-fill" />
          <span className="line-amount">{formatCurrency(amount, "COP")}</span>
        </div>
      </Col>
    );
  };

  if (generalExtracharges?.length === 0) return null;

  return (
    <>
      <h5>Cargos Generales</h5>
      <Row className="mb-2 px-2">
        {generalExtracharges.map((charge, index) =>
          mapExtraCharge(charge, index)
        )}
      </Row>
      <hr />
    </>
  );
};

export default BookingGeneralCharges;
