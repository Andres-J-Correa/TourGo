//types
import type { JSX } from "react";
import type { BookingCardProps } from "./BookingCard.types";

//libs
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, Row, Col, CardBody, CardHeader, Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPen,
  faPenToSquare,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";

//components
import BookingStatusBadge from "components/bookings/BookingStatusBadge";
import BookingAuditableInfo from "components/bookings/booking-summary/BookingAuditableInfo";
import BookingViewOffCanvas from "components/bookings/BookingViewOffCanvas";

//utils
import { useLanguage } from "contexts/LanguageContext";
import { formatCurrency } from "utils/currencyHelper";
import { LOCKED_BOOKING_STATUSES } from "components/bookings/constants";

function BookingCard({ booking, hotelId }: BookingCardProps): JSX.Element {
  const { t } = useLanguage();

  const [isAuditableInfoOpen, setIsAuditableInfoOpen] =
    useState<boolean>(false);
  const [offCanvasOpen, setOffCanvasOpen] = useState<boolean>(false);

  const toggleOffCanvas = (): void => {
    setOffCanvasOpen((prev) => !prev);
  };

  return (
    <>
      <BookingViewOffCanvas
        offCanvasOpen={offCanvasOpen}
        handleToggleOffcanvas={toggleOffCanvas}
        bookingId={booking.id}
        hotelId={hotelId}
      />
      <Card className="pb-1 mb-3 text-dark">
        <CardHeader className="pt-3 px-3 bg-dark text-white">
          <span className="mb-2 fs-5">
            <strong>{t("booking.minimalCard.reservationNumber")}</strong>{" "}
            {booking.id}
            <BookingStatusBadge
              statusId={booking.statusId}
              className="px-2 ms-2 mb-2"
            />
          </span>
          <div className="ms-3 float-end mb-2">
            <Button
              color="outline-light"
              className="me-2"
              title={t("booking.minimalCard.auditable")}
              onClick={() => setIsAuditableInfoOpen((prev) => !prev)}>
              {t("booking.minimalCard.auditButton")}
              <FontAwesomeIcon className="ms-2" icon={faUserPen} />
            </Button>
            {!LOCKED_BOOKING_STATUSES.includes(booking.statusId) && (
              <Link
                to={`/hotels/${hotelId}/bookings/${booking.id}/edit`}
                title={t("booking.minimalCard.edit")}
                className="btn btn-outline-light me-2">
                {t("booking.minimalCard.editButton")}
                <FontAwesomeIcon className="ms-2" icon={faPenToSquare} />
              </Link>
            )}
            <Button
              onClick={toggleOffCanvas}
              color="outline-light"
              title={t("booking.minimalCard.viewDetails")}>
              {t("booking.minimalCard.viewButton")}
              <FontAwesomeIcon className="ms-2" icon={faClipboardList} />
            </Button>
          </div>
        </CardHeader>
        <CardBody className="px-3">
          <Row>
            <Col md={4}>
              <strong>{t("booking.minimalCard.name")}</strong>{" "}
              {booking.firstName} {booking.lastName}
              <br />
              <strong>{t("booking.minimalCard.externalId")}</strong>{" "}
              {booking.externalBookingId}
            </Col>
            <Col md={4} className="text-md-end">
              <strong>{t("booking.minimalCard.total")}</strong>{" "}
              {formatCurrency(booking.total, "COP")}
              <br />
              <strong>{t("booking.minimalCard.balanceDue")}</strong>{" "}
              {formatCurrency(booking.balanceDue, "COP")}
            </Col>
            <Col md={4} className="text-md-end">
              <strong>{t("booking.minimalCard.arrival")}</strong>{" "}
              {dayjs(booking.arrivalDate).format("DD/MM/YYYY")}
              <br />
              <strong>{t("booking.minimalCard.departure")}</strong>{" "}
              {dayjs(booking.departureDate).format("DD/MM/YYYY")}
              <br />
            </Col>
          </Row>
          {isAuditableInfoOpen && (
            <div className="py-2 px-3 mt-3 border-top bg-light rounded">
              <BookingAuditableInfo booking={booking} />
            </div>
          )}
        </CardBody>
      </Card>
    </>
  );
}

export default BookingCard;
