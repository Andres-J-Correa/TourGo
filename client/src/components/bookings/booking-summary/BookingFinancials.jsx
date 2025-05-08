import React from "react";
import { Row, Col } from "reactstrap";
import { formatCurrency } from "utils/currencyHelper";

const BookingFinancials = ({ bookingData }) => {
  const { transactions, subtotal, charges, total } = bookingData;
  const totalPaid = transactions?.reduce((sum, txn) => sum + txn.amount, 0);
  const balance = total - totalPaid;

  return (
    <>
      <Row>
        <Col md={4}>
          <strong>Subtotal:</strong> {formatCurrency(subtotal, "COP")}
        </Col>
        <Col md={4}>
          <strong>Cargos:</strong> {formatCurrency(charges, "COP")}
        </Col>
        <Col md={4}>
          <strong>Total:</strong> {formatCurrency(total, "COP")}
        </Col>
      </Row>
      <Row>
        <Col md={4}>
          <strong>Total Pagado:</strong> {formatCurrency(totalPaid, "COP")}
        </Col>
        <Col md={4}>
          <strong>Saldo:</strong> {formatCurrency(balance, "COP")}
        </Col>
      </Row>
    </>
  );
};

export default BookingFinancials;
