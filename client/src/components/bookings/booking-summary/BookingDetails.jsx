import React from "react";
import { Row, Col } from "reactstrap";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const BookingDetails = ({ bookingData }) => (
  <>
    <h5>Detalles</h5>
    <hr className="mb-1 mt-0" />
    <Row>
      <Col xl={4} lg={6} md={12} className="mb-2">
        <strong>Llegada (Check-in):</strong>
        <p>{dayjs(bookingData?.arrivalDate).format("DD/MM/YYYY")}</p>
      </Col>
      <Col xl={4} lg={6} md={12} className="mb-2">
        <strong>Llegada Estimada:</strong>{" "}
        <p>
          {bookingData?.eta
            ? dayjs.utc(bookingData?.eta).format("DD/MM/YYYY - h:mm a")
            : "-"}
        </p>
      </Col>
      <Col xl={4} lg={6} md={12} className="mb-2">
        <strong>Identificación externa</strong>
        <p>{bookingData?.externalId ? bookingData?.externalId : "-"}</p>
      </Col>
    </Row>
    <Row>
      <Col xl={4} lg={6} md={12} className="mb-2">
        <strong>Salida (Check-out):</strong>
        <p>{dayjs(bookingData?.departureDate).format("DD/MM/YYYY")}</p>
      </Col>
      <Col xl={3} lg={6} md={12} className="mb-2">
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
  </>
);

export default BookingDetails;
