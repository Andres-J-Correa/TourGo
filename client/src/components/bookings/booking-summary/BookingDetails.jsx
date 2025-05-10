import React from "react";
import { Row, Col } from "reactstrap";
import { bookingStatuses } from "components/bookings/constants";
import dayjs from "dayjs";

const BookingDetails = ({ bookingData }) => (
  <>
    <h5>Detalles</h5>
    <hr className="mb-1 mt-0" />
    <Row>
      <Col md={3}>
        <Row>
          <strong>Llegada (Check-in):</strong>
          <p className="mb-0">
            {dayjs(bookingData?.arrivalDate).format("DD/MM/YYYY")}
          </p>
        </Row>
        <Row>
          <strong>Salida (Check-out):</strong>
          <p className="mb-0">
            {dayjs(bookingData?.departureDate).format("DD/MM/YYYY")}
          </p>
        </Row>
      </Col>
      <Col>
        <Row>
          <Col md={5}>
            <strong>Día y Hora de Llegada:</strong>{" "}
            <p className="mb-0">
              {bookingData?.eta
                ? dayjs(bookingData?.eta).format("DD/MM/YYYY - h:mm a")
                : "-"}
            </p>
          </Col>
          <Col>
            <strong>Identificación externa</strong>
            <p className="mb-0">
              {bookingData?.externalId ? bookingData?.externalId : "-"}
            </p>
          </Col>
        </Row>
        <Row>
          <Col md={3}>
            <strong>Proveedor</strong>
            <p className="mb-0">
              {bookingData?.bookingProvider?.name
                ? bookingData?.bookingProvider.name
                : "-"}
            </p>
          </Col>
          <Col md={2}>
            <strong>Estado:</strong>{" "}
            <p className="mb-0">{bookingStatuses[bookingData?.status?.id]}</p>
          </Col>
          <Col md={2}>
            <strong>Noches:</strong>{" "}
            <p className="mb-0">{bookingData?.nights}</p>
          </Col>
          <Col md={2}>
            <strong>Adultos:</strong>{" "}
            <p className="mb-0">{bookingData?.adultGuests}</p>
          </Col>
          <Col md={2}>
            <strong>Niños:</strong>{" "}
            <p className="mb-0">{bookingData?.childGuests}</p>
          </Col>
        </Row>
      </Col>
    </Row>
  </>
);

export default BookingDetails;
