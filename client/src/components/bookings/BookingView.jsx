import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getBookingById,
  updateStatusToCheckedIn,
  updateStatusToNoShow,
  updateStatusToCompleted,
  updateStatusToCancelled,
} from "services/bookingService";
import {
  BOOKING_STATUS_IDS,
  LOCKED_BOOKING_STATUSES,
} from "components/bookings/constants";
import BookingSummary from "components/bookings/booking-summary/BookingSummary";
import BookingStatusBadge from "components/bookings/BookingStatusBadge";
import BookingTransactions from "components/bookings/booking-summary/BookingTransactions";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import Breadcrumb from "components/commonUI/Breadcrumb";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { Button, Col, Row, Card, CardBody, CardHeader } from "reactstrap";
import {
  faPlaneArrival,
  faRectangleXmark,
  faPlaneDeparture,
  faCalendarXmark,
  faPenToSquare,
  faFileInvoiceDollar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppContext } from "contexts/GlobalAppContext";
import { useLanguage } from "contexts/LanguageContext";
import DownloadInvoicePdfButton from "components/invoices/DownloadInvoicePdfButton";

dayjs.extend(isSameOrAfter);

function BookingView() {
  const { hotelId, bookingId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [booking, setBooking] = useState(null);

  const { user } = useAppContext();
  const { t } = useLanguage(); // added

  const modifiedBy = useMemo(
    () => ({
      id: user.current?.id,
      firstName: user.current?.firstName,
      lastName: user.current?.lastName,
    }),
    [user]
  );

  const hasBalanceDue = useMemo(() => {
    const sum =
      booking?.transactions?.length > 0
        ? booking.transactions.reduce((acc, transaction) => {
            return acc + transaction.amount;
          }, 0)
        : 0;

    const total = booking?.total || 0;

    return sum < total;
  }, [booking]);

  const breadcrumbs = [
    { label: t("booking.breadcrumb.home"), path: "/" },
    { label: t("booking.breadcrumb.hotels"), path: "/hotels" },
    { label: t("booking.breadcrumb.hotel"), path: `/hotels/${hotelId}` },
    {
      label: t("booking.breadcrumb.bookings"),
      path: `/hotels/${hotelId}/bookings`,
    },
  ];

  const onGetBookingSuccess = (res) => {
    if (res.isSuccessful) {
      setBooking(res.item);
    }
  };
  const onGetBookingError = useCallback(
    (e) => {
      if (e.response?.status === 404) {
        setBooking(null);
      } else {
        toast.error(t("booking.view.errors.loadBooking"));
      }
    },
    [t]
  );

  const handleCheckIn = useCallback(async () => {
    let swalText = t("booking.view.checkInConfirmText");
    if (hasBalanceDue) {
      swalText = t("booking.view.checkInBalanceDueText");
    }

    const result = await Swal.fire({
      title: t("booking.view.checkInConfirmTitle"),
      text: swalText,
      icon: hasBalanceDue ? "warning" : "info",
      showCancelButton: true,
      confirmButtonText: t("booking.view.confirmYes"),
      cancelButtonText: t("common.cancel"),
      reverseButtons: hasBalanceDue,
      confirmButtonColor: hasBalanceDue ? "red" : "#0d6efd",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: t("common.loading"),
        text: t("booking.view.pleaseWait"),
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await updateStatusToCheckedIn(bookingId, hotelId);
      if (res.isSuccessful) {
        setBooking((prevBooking) => ({
          ...prevBooking,
          status: { id: BOOKING_STATUS_IDS.ARRIVED },
          modifiedBy: { ...modifiedBy },
          dateModified: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
        }));

        Swal.fire({
          title: t("common.success"),
          text: t("booking.view.checkInSuccess"),
          icon: "success",
          confirmButtonText: t("common.ok"),
        });
      } else {
        throw new Error("Error al marcar como check-in");
      }
    } catch (error) {
      Swal.close();
      await Swal.fire({
        icon: "error",
        title: t("common.error"),
        text: t("booking.view.checkInError"),
      });
    }
  }, [hasBalanceDue, bookingId, modifiedBy, hotelId, t]);

  const handleNoShow = useCallback(async () => {
    const result = await Swal.fire({
      title: t("booking.view.noShowConfirmTitle"),
      text: t("booking.view.noShowConfirmText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("booking.view.confirmYes"),
      cancelButtonText: t("common.cancel"),
      reverseButtons: true,
      confirmButtonColor: "red",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: t("common.loading"),
        text: t("booking.view.pleaseWait"),
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await updateStatusToNoShow(bookingId, hotelId);
      if (res.isSuccessful) {
        setBooking((prevBooking) => ({
          ...prevBooking,
          status: { id: BOOKING_STATUS_IDS.NO_SHOW },
          modifiedBy: { ...modifiedBy },
          dateModified: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
        }));

        Swal.fire({
          title: t("common.success"),
          text: t("booking.view.noShowSuccess"),
          icon: "success",
          confirmButtonText: t("common.ok"),
        });
      } else {
        throw new Error("Error al marcar como no show");
      }
    } catch (error) {
      Swal.close();
      await Swal.fire({
        icon: "error",
        title: t("common.error"),
        text: t("booking.view.noShowError"),
      });
    }
  }, [bookingId, modifiedBy, hotelId, t]);

  const handleComplete = useCallback(async () => {
    const result = await Swal.fire({
      title: t("booking.view.completeConfirmTitle"),
      text: t("booking.view.completeConfirmText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("booking.view.confirmYes"),
      cancelButtonText: t("common.cancel"),
      reverseButtons: true,
      confirmButtonColor: "green",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: t("common.loading"),
        text: t("booking.view.pleaseWait"),
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await updateStatusToCompleted(bookingId, hotelId);
      if (res.isSuccessful) {
        setBooking((prevBooking) => ({
          ...prevBooking,
          status: { id: BOOKING_STATUS_IDS.COMPLETED },
          modifiedBy: { ...modifiedBy },
          dateModified: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
        }));

        Swal.fire({
          title: t("common.success"),
          text: t("booking.view.completeSuccess"),
          icon: "success",
          confirmButtonText: t("common.ok"),
        });
      } else {
        throw new Error("Error al marcar como completada");
      }
    } catch (error) {
      Swal.close();
      await Swal.fire({
        icon: "error",
        title: t("common.error"),
        text: t("booking.view.completeError"),
      });
    }
  }, [bookingId, modifiedBy, hotelId, t]);

  const handleCancel = useCallback(async () => {
    const result = await Swal.fire({
      title: t("booking.view.cancelConfirmTitle"),
      text: t("booking.view.cancelConfirmText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("booking.view.confirmYes"),
      cancelButtonText: t("common.cancel"),
      reverseButtons: true,
      confirmButtonColor: "red",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: t("common.loading"),
        text: t("booking.view.pleaseWait"),
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await updateStatusToCancelled(bookingId, hotelId);
      if (res.isSuccessful) {
        setBooking((prevBooking) => ({
          ...prevBooking,
          status: { id: BOOKING_STATUS_IDS.CANCELLED },
          modifiedBy: { ...modifiedBy },
          dateModified: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
        }));

        Swal.fire({
          title: t("common.success"),
          text: t("booking.view.cancelSuccess"),
          icon: "info",
          confirmButtonText: t("common.ok"),
        });
      } else {
        throw new Error("Error al cancelar la reserva");
      }
    } catch (error) {
      Swal.close();
      await Swal.fire({
        icon: "error",
        title: t("common.error"),
        text: t("booking.view.cancelError"),
      });
    }
  }, [bookingId, modifiedBy, hotelId, t]);

  useEffect(() => {
    if (bookingId) {
      setIsLoading(true);
      getBookingById(bookingId, hotelId)
        .then(onGetBookingSuccess)
        .catch(onGetBookingError)
        .finally(() => setIsLoading(false));
    }
  }, [bookingId, hotelId, onGetBookingError]);

  return (
    <>
      <Breadcrumb
        breadcrumbs={breadcrumbs}
        active={t("booking.breadcrumb.booking")}
      />
      <h3 className="mb-4">{t("booking.view.title")}</h3>
      <ErrorBoundary>
        <Row className="mb-1">
          <Col md={6} className="ps-3 gap-1">
            {booking?.status?.id === BOOKING_STATUS_IDS.ACTIVE && (
              <Button
                color="outline-dark"
                onClick={handleCheckIn}
                className="mb-2 me-2">
                {t("booking.arrival.markCheckIn")}
                <FontAwesomeIcon icon={faPlaneArrival} className="ms-2" />
              </Button>
            )}
            {!LOCKED_BOOKING_STATUSES.includes(booking?.status?.id) &&
              dayjs(dayjs()).isAfter(booking?.arrivalDate) && (
                <Button
                  color="outline-dark"
                  className="me-2 mb-2"
                  onClick={handleComplete}>
                  {t("booking.departure.markCompleted")}
                  <FontAwesomeIcon icon={faPlaneDeparture} className="ms-2" />
                </Button>
              )}
            {booking?.status?.id === BOOKING_STATUS_IDS.ACTIVE &&
              dayjs(dayjs()).isSameOrAfter(booking?.arrivalDate) && (
                <Button
                  color="outline-dark"
                  className="me-2 mb-2"
                  onClick={handleNoShow}>
                  {t("booking.view.markNoShow")}
                  <FontAwesomeIcon icon={faCalendarXmark} className="ms-2" />
                </Button>
              )}
          </Col>
          <Col md={6} className="gap-1 pe-1">
            <div className="d-flex justify-content-md-end ps-1">
              <Link
                to={`/hotels/${hotelId}/invoices/${booking?.invoiceId}`}
                className="me-2 btn btn-outline-dark  mb-2">
                {t("booking.view.goToInvoice")}
                <FontAwesomeIcon icon={faFileInvoiceDollar} className="ms-2" />
              </Link>
              <DownloadInvoicePdfButton
                className="me-2 btn btn-outline-dark  mb-2"
                invoiceId={booking?.invoiceId}
                hotelId={hotelId}
              />
              {!LOCKED_BOOKING_STATUSES.includes(booking?.status?.id) && (
                <Link to="edit" className="me-2  mb-2 btn btn-outline-dark">
                  {t("booking.view.edit")}
                  <FontAwesomeIcon icon={faPenToSquare} className="ms-2" />
                </Link>
              )}
              {!LOCKED_BOOKING_STATUSES.includes(booking?.status?.id) && (
                <Button
                  color="outline-danger"
                  className="me-2  mb-2"
                  onClick={handleCancel}>
                  {t("booking.view.cancelBooking")}
                  <FontAwesomeIcon icon={faRectangleXmark} className="ms-2" />
                </Button>
              )}
            </div>
          </Col>
        </Row>
        <LoadingOverlay isVisible={isLoading} />
        {booking !== null && (
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
              />
              <BookingTransactions
                hotelId={hotelId}
                booking={booking}
                setBooking={setBooking}
              />
            </CardBody>
          </Card>
        )}
      </ErrorBoundary>
    </>
  );
}

export default BookingView;
