// components/bookings/TotalsDisplay.jsx
import React from "react";
import { Row, Col } from "reactstrap";
import { formatCurrency } from "utils/currencyHelper";
import PropTypes from "prop-types";
import { useLanguage } from "contexts/LanguageContext"; // added

const TotalsDisplay = ({ totals }) => {
  const { t } = useLanguage(); // added
  return (
    <>
      <hr />
      <Row className="mb-3">
        <Col md="4">
          <strong className="fs-5 text">
            {t("booking.totalsDisplay.subtotal")}
          </strong>
          <span className="float-end mt-1">
            {formatCurrency(totals.subtotal, "COP")}
          </span>
        </Col>
        <Col md="4">
          <strong className="fs-5 text">
            {t("booking.totalsDisplay.charges")}
          </strong>
          <span className="float-end mt-1">
            {formatCurrency(totals.charges, "COP")}
          </span>
        </Col>
        <Col md="4">
          <strong className="fs-5 text">
            {t("booking.totalsDisplay.total")}
          </strong>
          <span className="float-end mt-1">
            {formatCurrency(totals.total, "COP")}
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
