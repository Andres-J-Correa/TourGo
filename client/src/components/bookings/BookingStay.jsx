import React, { useState } from "react";
import { Row, Col, Button } from "reactstrap";
import BookingStatusBadge from "components/bookings/BookingStatusBadge";
import dayjs from "dayjs";
import classnames from "classnames";
import { faClipboardList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BookingViewOffCanvas from "components/bookings/BookingViewOffCanvas";

const StayItem = ({ stay, hotelId, hasBottomBorder, renderRooms }) => {
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
        bookingId={stay.id}
        hotelId={hotelId}
      />
      <Row className="justify-content-between">
        <Col md={5}>
          <strong>Reserva #:</strong> {stay.id}
          <div className="ms-3 display-inline">
            <BookingStatusBadge statusId={stay.statusId} />
          </div>
          <br />
          <strong>Cliente:</strong> {stay.customer?.firstName}{" "}
          {stay.customer?.lastName}
          <br />
          <strong>Teléfono:</strong> {stay.customer?.phone || "N/A"}
          <br />
          <strong>Documento:</strong> {stay.customer?.documentNumber || "N/A"}
        </Col>
        <Col>
          <strong>ID externa:</strong> {stay.externalBookingId}
          <br />
          <strong>Proveedor:</strong> {stay.bookingProviderName || "N/A"}
        </Col>
        <Col md="auto">
          <strong>Fecha de llegada:</strong>{" "}
          {dayjs(stay.arrivalDate).format("DD/MM/YYYY")}
          <br />
          <strong>Fecha de salida:</strong>{" "}
          {dayjs(stay.departureDate).format("DD/MM/YYYY")}
          <br />
          <strong>Noches:</strong> {stay.nights}
          <br />
        </Col>
      </Row>
      <Row>
        <Col md={5}>
          <strong>Habitaciones ocupadas:</strong>
          <ul className="mb-0">
            {renderRooms
              ? renderRooms(stay.rooms)
              : stay.rooms.map((room) => <li key={room.id}>{room.name}</li>)}
          </ul>
        </Col>
        <Col>
          {stay.notes && (
            <>
              <strong>Notas:</strong>
              <p className="mb-0">{stay.notes}</p>
            </>
          )}
        </Col>
        <Col className="text-end align-content-end">
          <Button
            type="button"
            color="outline-dark"
            onClick={toggleOffCanvas}
            title="Ver detalles de la reserva">
            Ver Detalles
            <FontAwesomeIcon icon={faClipboardList} className="ms-2" />
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default StayItem;
