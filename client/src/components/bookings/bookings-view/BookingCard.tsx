//types
import type { JSX } from "react";
import type { BookingCardProps } from "./BookingCard.types";

//libs
import { Card, Row, Col, CardBody, CardHeader } from "reactstrap";
import dayjs from "dayjs";

//components
import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import BookingAuditableInfo from "@/components/bookings/booking-summary/BookingAuditableInfo";

//utils
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency } from "@/utils/currencyHelper";

function BookingCard({ booking }: BookingCardProps): JSX.Element {
  const { t } = useLanguage();
  return (
    <Card className="p-3 mb-3">
      <CardHeader className="d-flex justify-content-between align-items-center">
        <strong>Reserva #:</strong> <span>{booking.id}</span>
        <div className="ms-3 display-inline">
          <BookingStatusBadge
            statusId={booking.statusId}
            className="float-md-end px-2"
          />
        </div>
        <br />
      </CardHeader>
      <CardBody>
        <Row className="justify-content-between">
          <Col md={4}>
            <strong>Cliente:</strong> {booking.firstName} {booking.lastName}
            <br />
            <strong>ID Externa:</strong> {booking.externalBookingId}
          </Col>
          <Col md={4} className="text-end">
            <strong>{t("booking.card.total")}</strong>{" "}
            {formatCurrency(booking.total, "COP")}
            <br />
            <strong>{t("booking.card.balance")}</strong>{" "}
            {formatCurrency(booking.balanceDue, "COP")}
          </Col>
          <Col md={4} className="text-end">
            <strong>{t("booking.card.arrivalDate")}</strong>{" "}
            {dayjs(booking.arrivalDate).format("DD/MM/YYYY")}
            <br />
            <strong>{t("booking.card.departureDate")}</strong>{" "}
            {dayjs(booking.departureDate).format("DD/MM/YYYY")}
            <br />
          </Col>
        </Row>
        <BookingAuditableInfo booking={booking} />
      </CardBody>
    </Card>
  );
}

export default BookingCard;
