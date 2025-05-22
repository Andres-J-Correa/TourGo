import React from "react";
import { Row, Col } from "reactstrap";
import dayjs from "dayjs";

const BookingDetails = ({ bookingData }) => (
  <>
    <h5>Detalles</h5>
    <hr className="mb-1 mt-0" />
    <Row>
      <Col md={3}>
        <Row>
          <strong>Llegada (Check-in):</strong>
          <p>{dayjs(bookingData?.arrivalDate).format("DD/MM/YYYY")}</p>
        </Row>
        <Row>
          <strong>Salida (Check-out):</strong>
          <p>{dayjs(bookingData?.departureDate).format("DD/MM/YYYY")}</p>
        </Row>
      </Col>
      <Col>
        <Row>
          <Col md={5}>
            <strong>Día y Hora de Llegada:</strong>{" "}
            <p>
              {bookingData?.eta
                ? dayjs(bookingData?.eta).format("DD/MM/YYYY - h:mm a")
                : "-"}
            </p>
          </Col>
          <Col>
            <strong>Identificación externa</strong>
            <p>{bookingData?.externalId ? bookingData?.externalId : "-"}</p>
          </Col>
        </Row>
        <Row>
          <Col md={5}>
            <strong>Proveedor</strong>
            <p>
              {bookingData?.bookingProvider?.name
                ? bookingData?.bookingProvider.name
                : "-"}
            </p>
          </Col>
          <Col md="auto">
            <strong>Noches:</strong> <p>{bookingData?.nights}</p>
          </Col>
          <Col md="auto">
            <strong>Adultos:</strong> <p>{bookingData?.adultGuests}</p>
          </Col>
          <Col md="auto">
            <strong>Niños:</strong> <p>{bookingData?.childGuests}</p>
          </Col>
        </Row>
      </Col>
    </Row>
  </>
);

export default BookingDetails;
