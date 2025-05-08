import React from "react";
import { Row, Col } from "reactstrap";
import { bookingStatuses } from "components/bookings/constants";
import dayjs from "dayjs";

const BookingDetails = ({ bookingData }) => (
  <>
    <h5>Detalles</h5>
    <Row>
      <Col md={4}>
        <Row>
          <strong>Llegada (Check-in):</strong>
          <p className="mb-0">
            {dayjs(bookingData.arrivalDate).format("DD/MM/YYYY")}
          </p>
        </Row>
        <Row>
          <strong>Salida (Check-out):</strong>
          <p className="mb-0">
            {dayjs(bookingData.departureDate).format("DD/MM/YYYY")}
          </p>
        </Row>
      </Col>
      <Col>
        <Row>
          <Col md={4}>
            <strong>Noches:</strong>{" "}
            <p className="mb-0">{bookingData.nights}</p>
          </Col>
          <Col md={4}>
            <strong>Adultos:</strong>{" "}
            <p className="mb-0">{bookingData.adultGuests}</p>
          </Col>
          <Col md={4}>
            <strong>Niños:</strong>{" "}
            <p className="mb-0">{bookingData.childGuests}</p>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <strong>Estado:</strong>{" "}
            <p className="mb-0">{bookingStatuses[bookingData.status?.id]}</p>
          </Col>
        </Row>
      </Col>
    </Row>
  </>
);

export default BookingDetails;
