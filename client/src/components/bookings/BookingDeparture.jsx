import React, { useState } from "react";
import { Row, Col, Button } from "reactstrap";
import BookingStatusBadge from "components/bookings/BookingStatusBadge";
import { BOOKING_STATUS_IDS } from "components/bookings/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlaneDeparture,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import classnames from "classnames";
import BookingViewOffCanvas from "components/bookings/BookingViewOffCanvas";

const BookingDeparture = ({
  departure,
  hotelId,
  handleComplete,
  hasBottomBorder,
  renderRooms,
}) => {
  const [offCanvasOpen, setOffCanvasOpen] = useState(false);
  const toggleOffCanvas = () => setOffCanvasOpen((prev) => !prev);

  return (
    <div
      className={classnames("w-100 border-dark-subtle py-3", {
        "border-bottom": hasBottomBorder,
      })}>
      <BookingViewOffCanvas
        offCanvasOpen={offCanvasOpen}
        handleToggleOffcanvas={toggleOffCanvas}
        bookingId={departure.id}
        hotelId={hotelId}
      />
      <Row className="justify-content-between">
        <Col md={5}>
          <strong>Reserva #:</strong> {departure.id}
          <div className="ms-3 display-inline">
            <BookingStatusBadge statusId={departure.statusId} />
          </div>
          <br />
          <strong>Cliente:</strong> {departure.customer?.firstName}{" "}
          {departure.customer?.lastName}
          <br />
          <strong>Teléfono:</strong> {departure.customer?.phone || "N/A"}
          <br />
          <strong>Documento:</strong>{" "}
          {departure.customer?.documentNumber || "N/A"}
        </Col>
        <Col>
          <strong>ID externa:</strong> {departure.externalBookingId}
          <br />
          <strong>Proveedor:</strong> {departure.bookingProviderName || "N/A"}
        </Col>
        <Col md="auto">
          <strong>Fecha de llegada:</strong> {departure.arrivalDate}
          <br />
          <strong>Fecha de salida:</strong> {departure.departureDate}
          <br />
          <strong>Noches:</strong> {departure.nights}
          <br />
        </Col>
      </Row>
      <Row>
        <Col md={5}>
          <strong>Habitaciones que salen:</strong>
          <ul className="mb-0">
            {renderRooms
              ? renderRooms(departure.departingRooms)
              : departure.departingRooms.map((room) => (
                  <li key={room.id}>{room.name}</li>
                ))}
          </ul>
        </Col>
        <Col>
          {departure.notes && (
            <>
              <strong>Notas:</strong>
              <p className="mb-0">{departure.notes}</p>
            </>
          )}
        </Col>
        <Col className="text-end align-content-end">
          <Row>
            <Col xs={12} className="mb-2">
              <Button
                color="outline-dark"
                onClick={toggleOffCanvas}
                title="Ver detalles de la reserva">
                Ver Detalles
                <FontAwesomeIcon icon={faClipboardList} className="ms-2" />
              </Button>
            </Col>
            <Col>
              {(departure?.statusId === BOOKING_STATUS_IDS.ACTIVE ||
                departure?.statusId === BOOKING_STATUS_IDS.ARRIVED) && (
                <Button
                  color="outline-success"
                  className="ms-2"
                  onClick={() => handleComplete(departure)}>
                  Marcar Completada
                  <FontAwesomeIcon icon={faPlaneDeparture} className="ms-2" />
                </Button>
              )}
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default BookingDeparture;
