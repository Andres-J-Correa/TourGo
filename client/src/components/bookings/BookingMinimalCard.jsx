import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Row, Col, Spinner } from "reactstrap";
import { Link } from "react-router-dom";
import { getMinimalById } from "services/bookingService";
import { formatCurrency } from "utils/currencyHelper";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import { useLanguage } from "contexts/LanguageContext"; // added

const BookingMinimalCard = ({ bookingId, hotelId }) => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage(); // added

  useEffect(() => {
    const loadBooking = async () => {
      setLoading(true);
      try {
        const response = await getMinimalById(bookingId, hotelId);
        if (response.isSuccessful) {
          setBooking(response.item);
        }
      } catch {
        setBooking(null);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      loadBooking();
    }
  }, [bookingId, hotelId]);

  return (
    <Card className="shadow-sm">
      {booking && (
        <>
          <CardHeader className="bg-light">
            <h5 className="mb-0">
              {t("booking.minimalCard.reservationNumber")} {booking.id}{" "}
              <Link
                to={`/hotels/${hotelId}/bookings/${booking.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-link text-decoration-none float-end p-0"
                title={t("booking.minimalCard.viewDetails")}>
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
              </Link>
            </h5>
          </CardHeader>{" "}
          <CardBody>
            <Row className="mb-2">
              <Col md="6">
                <strong>{t("booking.minimalCard.name")}</strong>
                <p className="mb-0">
                  {booking.firstName} {booking.lastName}
                </p>
              </Col>
              <Col md="6">
                <strong>{t("booking.minimalCard.externalId")}</strong>
                <p className="mb-0">{booking.externalBookingId || "N/A"}</p>
              </Col>
            </Row>
            <Row className="mb-2">
              <Col md="6">
                <strong>{t("booking.minimalCard.arrival")}</strong>
                <p className="mb-0">
                  {dayjs(booking.arrivalDate).format("ddd DD/MMM/YYYY")}
                </p>
              </Col>
              <Col md="6">
                <strong>{t("booking.minimalCard.departure")}</strong>
                <p className="mb-0">
                  {dayjs(booking.departureDate).format("ddd DD/MMM/YYYY")}
                </p>
              </Col>
            </Row>
            <Row className="mb-2">
              <Col md="6">
                <strong>{t("booking.minimalCard.total")}</strong>
                <p className="mb-0">{formatCurrency(booking.total, "COP")}</p>
              </Col>
              <Col md="6">
                <strong>{t("booking.minimalCard.balanceDue")}</strong>
                <p className="mb-0">
                  {formatCurrency(booking.balanceDue, "COP")}
                </p>
              </Col>
            </Row>
          </CardBody>
        </>
      )}
      {!booking && loading && (
        <Card className="shadow-sm">
          <CardBody className="text-center">
            <Row className="mb-2">
              <Spinner color="dark mx-auto" />
            </Row>
            {t("booking.minimalCard.loading")}
          </CardBody>
        </Card>
      )}
      {!booking && !loading && (
        <Card className="shadow-sm">
          <CardBody className="text-center">
            {t("booking.minimalCard.notFound")}
          </CardBody>
        </Card>
      )}
    </Card>
  );
};

export default BookingMinimalCard;
