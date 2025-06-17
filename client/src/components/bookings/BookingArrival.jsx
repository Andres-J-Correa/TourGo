import React, { useState } from "react";
import { Row, Col, Button } from "reactstrap";
import classnames from "classnames";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlaneArrival,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";

import BookingStatusBadge from "components/bookings/BookingStatusBadge";
import BookingViewOffCanvas from "components/bookings/BookingViewOffCanvas";

import { BOOKING_STATUS_IDS } from "components/bookings/constants";
import { formatCurrency } from "utils/currencyHelper";

const BookingArrival = ({
  arrival,
  handleCheckIn,
  hotelId,
  hasBottomBorder,
  renderRooms,
}) => {
  const [offCanvasOpen, setOffCanvasOpen] = useState(false);

  const toggleOffCanvas = () => setOffCanvasOpen((prev) => !prev);

  const { arrivingRooms, otherRooms } = arrival;
  const arrivingRoomIds = new Set(arrivingRooms.map((ar) => ar.id));
  const filteredRooms =
    otherRooms?.length > 0
      ? otherRooms.filter((r) => !arrivingRoomIds.has(r.id))
      : [];

  return (
    <div
      className={classnames("w-100 border-dark-subtle text-dark-subtle py-3", {
        "border-bottom": hasBottomBorder,
      })}>
      <BookingViewOffCanvas
        offCanvasOpen={offCanvasOpen}
        handleToggleOffcanvas={toggleOffCanvas}
        bookingId={arrival.id}
        hotelId={hotelId}
      />
      <Row className="justify-content-between">
        <Col md={5}>
          <strong>Reserva #:</strong> {arrival.id}
          <div className="ms-3 display-inline">
            <BookingStatusBadge statusId={arrival.statusId} />
          </div>
          <br />
          <strong>Cliente:</strong> {arrival.customer?.firstName}{" "}
          {arrival.customer?.lastName}
          <br />
          <strong>Teléfono:</strong> {arrival.customer?.phone || "N/A"}
          <br />
          <strong>Documento:</strong>{" "}
          {arrival.customer?.documentNumber || "N/A"}
        </Col>
        <Col>
          <strong>ID externa:</strong> {arrival.externalBookingId}
          <br />
          <strong>Proveedor:</strong> {arrival.bookingProviderName || "N/A"}
          <br />
          <strong>Total:</strong> {formatCurrency(arrival.total, "COP")}
          <br />
          <strong>Saldo:</strong> {formatCurrency(arrival.balanceDue, "COP")}
        </Col>
        <Col md="auto">
          <strong>Fecha de llegada:</strong>{" "}
          {dayjs(arrival.arrivalDate).format("DD/MM/YYYY")}
          <br />
          <strong>Fecha de salida:</strong>{" "}
          {dayjs(arrival.departureDate).format("DD/MM/YYYY")}
          <br />
          <strong>Noches:</strong> {arrival.nights}
        </Col>
      </Row>
      {dayjs(arrival.eta).isValid() && (
        <Row>
          <Col>
            <strong>Fecha y hora de llegada:</strong>{" "}
            {dayjs(arrival.eta).format("DD/MM/YYYY h:mm")}
          </Col>
        </Row>
      )}
      {arrival.notes && (
        <Row>
          <strong>Notas:</strong>
          <p className="mb-0">{arrival.notes}</p>
        </Row>
      )}
      <Row>
        <Col md={5}>
          <strong>Habitaciones que llegan:</strong>{" "}
          <ul className="mb-0">{renderRooms(arrivingRooms)}</ul>
        </Col>
        <Col md={5}>
          <strong>Habitaciones que llegan otro día:</strong>{" "}
          <ul className="mb-0">
            {filteredRooms.length > 0 ? renderRooms(filteredRooms) : "Ninguna"}
          </ul>
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
            <Col xs={12}>
              {arrival?.statusId === BOOKING_STATUS_IDS.ACTIVE && (
                <Button
                  color="outline-success"
                  onClick={() => handleCheckIn(arrival)}>
                  Marcar Check-in
                  <FontAwesomeIcon icon={faPlaneArrival} className="ms-2" />
                </Button>
              )}
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default BookingArrival;
