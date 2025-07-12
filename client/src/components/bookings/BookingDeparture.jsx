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
import dayjs from "dayjs";
import { useLanguage } from "contexts/LanguageContext"; // added
import Swal from "sweetalert2";
import { isValidPhoneNumber } from "libphonenumber-js";
import { formatPhoneNumber } from "utils/phoneHelper";

const getWhatsappLink = (phone) => {
  const cleaned = phone.replace(/\D/g, "");
  return `https://api.whatsapp.com/send?phone=${cleaned}`;
};

const BookingDeparture = ({
  departure,
  hotelId,
  handleComplete,
  hasBottomBorder,
  renderRooms,
}) => {
  const [offCanvasOpen, setOffCanvasOpen] = useState(false);
  const { t } = useLanguage(); // added
  const toggleOffCanvas = () => setOffCanvasOpen((prev) => !prev);

  const handlePhoneClick = () => {
    const phone = departure.customer?.phone;
    if (!isValidPhoneNumber(phone)) {
      Swal.fire({
        icon: "error",
        title: t("booking.invalidPhoneSwalTitle"),
        text: t("booking.invalidPhoneSwalText"),
      });
      return;
    }
    const whatsappLink = getWhatsappLink(phone);
    window.open(whatsappLink, "_blank");
  };

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
          <strong>{t("booking.departure.reservationNumber")}</strong>{" "}
          {departure.id}
          <div className="ms-3 display-inline">
            <BookingStatusBadge statusId={departure.statusId} />
          </div>
          <br />
          <strong>{t("booking.departure.customer")}</strong>{" "}
          {departure.customer?.firstName} {departure.customer?.lastName}
          <br />
          <strong>{t("booking.departure.phone")}</strong>{" "}
          {!!departure.customer?.phone ? (
            <span
              className="link-primary cursor-pointer"
              onClick={handlePhoneClick}>
              {formatPhoneNumber(departure.customer.phone)}
            </span>
          ) : (
            "N/A"
          )}
          <br />
          <strong>{t("booking.departure.document")}</strong>{" "}
          {departure.customer?.documentNumber || "N/A"}
        </Col>
        <Col>
          <strong>{t("booking.departure.externalId")}</strong>{" "}
          {departure.externalBookingId}
          <br />
          <strong>{t("booking.departure.provider")}</strong>{" "}
          {departure.bookingProviderName || "N/A"}
        </Col>
        <Col md="auto">
          <strong>{t("booking.departure.arrivalDate")}</strong>{" "}
          {dayjs(departure.arrivalDate).format("DD/MM/YYYY")}
          <br />
          <strong>{t("booking.departure.departureDate")}</strong>{" "}
          {dayjs(departure.departureDate).format("DD/MM/YYYY")}
          <br />
          <strong>{t("booking.departure.nights")}</strong> {departure.nights}
          <br />
        </Col>
      </Row>
      <Row>
        <Col lg={4} md={6} xs={12} className="mb-2">
          <strong>{t("booking.departure.departingRooms")}</strong>
          <ul className="mb-0">
            {renderRooms
              ? renderRooms(departure.departingRooms)
              : departure.departingRooms.map((room) => (
                  <li key={room.id}>{room.name}</li>
                ))}
          </ul>
        </Col>
        {departure.notes && (
          <Col lg={4} md={6} xs={12} className="mb-2">
            <strong>{t("booking.departure.notes")}</strong>
            <p className="mb-0">{departure.notes}</p>
          </Col>
        )}
        <Col className="text-end align-content-end mb-2">
          <Row>
            <Col xs={12} className="mb-2">
              <Button
                color="outline-dark"
                onClick={toggleOffCanvas}
                title={t("booking.departure.viewDetails")}>
                {t("booking.departure.viewDetails")}
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
                  {t("booking.departure.markCompleted")}
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
