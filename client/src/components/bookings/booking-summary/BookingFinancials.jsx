import React from "react";
import { Row, Col } from "reactstrap";
import { formatCurrency } from "utils/currencyHelper";
import classNames from "classnames";
import "./BookingSummary.css";

const BookingFinancials = ({ bookingData, isInvoiceView }) => {
  const {
    transactions = [],
    subtotal = 0,
    charges = [],
    total = 0,
  } = bookingData || {};
  const totalPaid =
    transactions?.length > 0
      ? transactions?.reduce((sum, txn) => sum + txn.amount, 0)
      : 0;
  const balance = total - totalPaid;

  return (
    <>
      <Row className="mb-2">
        <Col md={4}>
          <div className="line-item">
            <span className="line-label fw-bold">Subtotal</span>
            <div className="line-fill" />
            <span className="line-amount">
              {formatCurrency(subtotal, "COP")}
            </span>
          </div>
        </Col>
        <Col md={4}>
          <div className="line-item">
            <span className="line-label fw-bold">Cargos</span>
            <div className="line-fill" />
            <span className="line-amount">
              {formatCurrency(charges, "COP")}
            </span>
          </div>
        </Col>
        <Col md={4}>
          <div className="line-item">
            <span className="line-label fw-bold">Total</span>
            <div className="line-fill" />
            <span className="line-amount">{formatCurrency(total, "COP")}</span>
          </div>
        </Col>
      </Row>
      {!isInvoiceView && (
        <Row className="mb-2">
          <Col md={4}>
            <div className="line-item">
              <span className="line-label fw-bold">Total Pagado</span>
              <div className="line-fill" />
              <span className="line-amount">
                {formatCurrency(totalPaid, "COP")}
              </span>
            </div>
          </Col>
          <Col md={4}>
            <div className="line-item">
              <span className="line-label fw-bold">Saldo</span>
              <div className="line-fill" />
              <span
                className={classNames("line-amount", {
                  "text-danger": balance < 0,
                })}>
                {formatCurrency(balance, "COP")}
              </span>
            </div>
          </Col>
          <Col>
            <div className="line-item">
              <span className="line-label fw-bold">Comisión</span>
              <div className="line-fill" />
              <span
                className={classNames("line-amount", {
                  "text-danger": bookingData?.externalCommission < 0,
                })}>
                {bookingData?.externalCommission > 0
                  ? formatCurrency(bookingData?.externalCommission, "COP")
                  : "-"}
              </span>
            </div>
          </Col>
        </Row>
      )}
    </>
  );
};

export default BookingFinancials;
