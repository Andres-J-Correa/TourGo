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
import { useLanguage } from "contexts/LanguageContext";

const BookingArrival = ({
  arrival,
  handleCheckIn,
  hotelId,
  hasBottomBorder,
  renderRooms,
}) => {
  const [offCanvasOpen, setOffCanvasOpen] = useState(false);
  const { t } = useLanguage();

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
          <strong>{t("booking.arrival.reservationNumber")}</strong> {arrival.id}
          <div className="ms-3 display-inline">
            <BookingStatusBadge statusId={arrival.statusId} />
          </div>
          <br />
          <strong>{t("booking.arrival.customer")}</strong>{" "}
          {arrival.customer?.firstName} {arrival.customer?.lastName}
          <br />
          <strong>{t("booking.arrival.phone")}</strong>{" "}
          {arrival.customer?.phone || "N/A"}
          <br />
          <strong>{t("booking.arrival.document")}</strong>{" "}
          {arrival.customer?.documentNumber || "N/A"}
        </Col>
        <Col>
          <strong>{t("booking.arrival.externalId")}</strong>{" "}
          {arrival.externalBookingId}
          <br />
          <strong>{t("booking.arrival.provider")}</strong>{" "}
          {arrival.bookingProviderName || "N/A"}
          <br />
          <strong>{t("booking.arrival.total")}</strong>{" "}
          {formatCurrency(arrival.total, "COP")}
          <br />
          <strong>{t("booking.arrival.balance")}</strong>{" "}
          {formatCurrency(arrival.balanceDue, "COP")}
        </Col>
        <Col md="auto">
          <strong>{t("booking.arrival.arrivalDate")}</strong>{" "}
          {dayjs(arrival.arrivalDate).format("DD/MM/YYYY")}
          <br />
          <strong>{t("booking.arrival.departureDate")}</strong>{" "}
          {dayjs(arrival.departureDate).format("DD/MM/YYYY")}
          <br />
          <strong>{t("booking.arrival.nights")}</strong> {arrival.nights}
        </Col>
      </Row>
      {dayjs(arrival.eta).isValid() && (
        <Row>
          <Col>
            <strong>{t("booking.arrival.eta")}</strong>{" "}
            {dayjs(arrival.eta).format("DD/MM/YYYY h:mm")}
          </Col>
        </Row>
      )}
      <Row>
        <Col lg={4} md={6} xs={12}>
          <strong>{t("booking.arrival.arrivingRooms")}</strong>{" "}
          <ul className="mb-0">{renderRooms(arrivingRooms)}</ul>
        </Col>
        {filteredRooms.length > 0 && (
          <Col lg={4} md={6} xs={12}>
            <strong>{t("booking.arrival.otherRooms")}</strong>{" "}
            <ul className="mb-0">{renderRooms(filteredRooms)}</ul>
          </Col>
        )}
        {arrival.notes && (
          <Col lg={4} md={6} xs={12}>
            <strong>{t("booking.arrival.notes")}</strong>
            <p className="mb-0">{arrival.notes}</p>
          </Col>
        )}
        <Col className="text-end align-content-end">
          <Row>
            <Col xs={12} className="mb-2">
              <Button
                color="outline-dark"
                onClick={toggleOffCanvas}
                title={t("booking.arrival.viewDetails")}>
                {t("booking.arrival.viewDetails")}
                <FontAwesomeIcon icon={faClipboardList} className="ms-2" />
              </Button>
            </Col>
            <Col xs={12}>
              {arrival?.statusId === BOOKING_STATUS_IDS.ACTIVE && (
                <Button
                  color="outline-success"
                  onClick={() => handleCheckIn(arrival)}>
                  {t("booking.arrival.markCheckIn")}
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
