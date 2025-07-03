import React, { useState, useEffect } from "react";
import {
  Offcanvas,
  OffcanvasHeader,
  OffcanvasBody,
  Col,
  Row,
  Card,
  CardBody,
  CardHeader,
} from "reactstrap";
import { Link } from "react-router-dom";
import SimpleLoader from "components/commonUI/loaders/SimpleLoader";
import BookingSummary from "components/bookings/booking-summary/BookingSummary";
import BookingStatusBadge from "components/bookings/BookingStatusBadge";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import {
  faPenToSquare,
  faFileInvoiceDollar,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getBookingById } from "services/bookingService";
import { LOCKED_BOOKING_STATUSES } from "components/bookings/constants";
import { useLanguage } from "contexts/LanguageContext";
import "./BookingViewOffCanvas.css";

dayjs.extend(isSameOrAfter);

function BookingViewOffCanvas({
  offCanvasOpen,
  handleToggleOffcanvas,
  bookingId,
  hotelId,
}) {
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const { t } = useLanguage(); // added

  const onGetBookingSuccess = (res) => {
    if (res.isSuccessful) {
      setBooking(res.item);
    }
  };
  const onGetBookingError = () => {
    setBooking(null);
  };

  useEffect(() => {
    if (bookingId && offCanvasOpen) {
      setLoading(true);
      getBookingById(bookingId, hotelId)
        .then(onGetBookingSuccess)
        .catch(onGetBookingError)
        .finally(() => setLoading(false));
    }
  }, [bookingId, offCanvasOpen, hotelId]);

  return (
    <Offcanvas
      isOpen={offCanvasOpen}
      toggle={handleToggleOffcanvas}
      direction="end"
      className="booking-offcanvas"
      zIndex={5001}>
      <OffcanvasHeader toggle={handleToggleOffcanvas}>
        {t("booking.viewOffCanvas.title")}
      </OffcanvasHeader>
      <OffcanvasBody>
        <SimpleLoader isVisible={loading} />
        {booking !== null && !loading && (
          <>
            <Row>
              <Col className="px-3">
                {!LOCKED_BOOKING_STATUSES.includes(booking?.status?.id) && (
                  <Link
                    to={`/hotels/${hotelId}/bookings/${booking?.id}/edit`}
                    className=" ms-2 mb-2 float-end btn btn-outline-dark">
                    {t("booking.view.edit")}
                    <FontAwesomeIcon icon={faPenToSquare} className="ms-2" />
                  </Link>
                )}
                <Link
                  to={`/hotels/${hotelId}/invoices/${booking?.invoiceId}`}
                  className="btn btn-outline-dark float-end ms-2  mb-2">
                  {t("booking.view.goToInvoice")}
                  <FontAwesomeIcon
                    icon={faFileInvoiceDollar}
                    className="ms-2"
                  />
                </Link>
                <Link
                  to={`/hotels/${hotelId}/bookings/${booking?.id}`}
                  className="btn btn-outline-dark float-end  mb-2">
                  {t("booking.viewOffCanvas.goToSummary")}
                  <FontAwesomeIcon icon={faClipboardList} className="ms-2" />
                </Link>
              </Col>
            </Row>
            <Card className="mb-4 bg-body-tertiary shadow">
              <CardHeader tag="h4" className="text-bg-dark text-center">
                {t("booking.view.reservationNumber")} {booking?.id}
                <BookingStatusBadge
                  className="float-md-end mx-2"
                  statusId={booking?.status?.id}
                />
              </CardHeader>
              <CardBody className="text-dark">
                <BookingSummary
                  bookingData={booking}
                  roomBookings={booking?.roomBookings}
                  extraCharges={booking?.extraCharges}
                  setBooking={setBooking}
                  hotelId={hotelId}
                  parentSize="sm"
                />
              </CardBody>
            </Card>
          </>
        )}
      </OffcanvasBody>
    </Offcanvas>
  );
}

export default BookingViewOffCanvas;
