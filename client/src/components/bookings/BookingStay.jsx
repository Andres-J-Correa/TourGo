import React, { useState } from "react";
import { Row, Col, Button } from "reactstrap";
import BookingStatusBadge from "components/bookings/BookingStatusBadge";
import dayjs from "dayjs";
import classnames from "classnames";
import { faClipboardList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BookingViewOffCanvas from "components/bookings/BookingViewOffCanvas";
import { useLanguage } from "contexts/LanguageContext"; // added

const BookingStay = ({ stay, hotelId, hasBottomBorder, renderRooms }) => {
  const [offCanvasOpen, setOffCanvasOpen] = useState(false);
  const { t } = useLanguage(); // added
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
          <strong>{t("booking.stay.reservationNumber")}</strong> {stay.id}
          <div className="ms-3 display-inline">
            <BookingStatusBadge statusId={stay.statusId} />
          </div>
          <br />
          <strong>{t("booking.stay.customer")}</strong>{" "}
          {stay.customer?.firstName} {stay.customer?.lastName}
          <br />
          <strong>{t("booking.stay.phone")}</strong>{" "}
          {stay.customer?.phone || "N/A"}
          <br />
          <strong>{t("booking.stay.document")}</strong>{" "}
          {stay.customer?.documentNumber || "N/A"}
        </Col>
        <Col>
          <strong>{t("booking.stay.externalId")}</strong>{" "}
          {stay.externalBookingId}
          <br />
          <strong>{t("booking.stay.provider")}</strong>{" "}
          {stay.bookingProviderName || "N/A"}
        </Col>
        <Col md="auto">
          <strong>{t("booking.stay.arrivalDate")}</strong>{" "}
          {dayjs(stay.arrivalDate).format("DD/MM/YYYY")}
          <br />
          <strong>{t("booking.stay.departureDate")}</strong>{" "}
          {dayjs(stay.departureDate).format("DD/MM/YYYY")}
          <br />
          <strong>{t("booking.stay.nights")}</strong> {stay.nights}
          <br />
        </Col>
      </Row>
      <Row>
        <Col lg={4} md={6} xs={12}>
          <strong>{t("booking.stay.occupiedRooms")}</strong>
          <ul className="mb-0">
            {renderRooms
              ? renderRooms(stay.rooms)
              : stay.rooms.map((room) => <li key={room.id}>{room.name}</li>)}
          </ul>
        </Col>
        {stay.notes && (
          <Col lg={4} md={6} xs={12}>
            <strong>{t("booking.stay.notes")}</strong>
            <p className="mb-0">{stay.notes}</p>
          </Col>
        )}
        <Col className="text-end align-content-end">
          <Button
            type="button"
            color="outline-dark"
            onClick={toggleOffCanvas}
            title={t("booking.stay.viewDetails")}>
            {t("booking.stay.viewDetails")}
            <FontAwesomeIcon icon={faClipboardList} className="ms-2" />
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default BookingStay;
