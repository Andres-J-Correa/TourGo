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

dayjs.extend(isSameOrAfter);

function BookingView() {
  const { hotelId, bookingId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [booking, setBooking] = useState(null);

  const { user } = useAppContext();

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
    { label: "Inicio", path: "/" },
    { label: "Hoteles", path: "/hotels" },
    { label: "Hotel", path: `/hotels/${hotelId}` },
    { label: "Reservas", path: `/hotels/${hotelId}/bookings` },
  ];

  const onGetBookingSuccess = (res) => {
    if (res.isSuccessful) {
      setBooking(res.item);
    }
  };
  const onGetBookingError = (e) => {
    if (e.response?.status === 404) {
      setBooking(null);
    } else {
      toast.error("Error al cargar reserva");
    }
  };

  const handleCheckIn = useCallback(async () => {
    let swalText = "Asegúrese de que el cliente ha llegado";
    if (hasBalanceDue) {
      swalText = "La reserva tiene saldo pendiente. ¿Desea continuar?";
    }

    const result = await Swal.fire({
      title: "¿Desea marcar la reserva como arribada?",
      text: swalText,
      icon: hasBalanceDue ? "warning" : "info",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
      reverseButtons: hasBalanceDue,
      confirmButtonColor: hasBalanceDue ? "red" : "#0d6efd",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: "Cargando...",
        text: "Por favor, espere.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await updateStatusToCheckedIn(bookingId);
      if (res.isSuccessful) {
        setBooking((prevBooking) => ({
          ...prevBooking,
          status: { id: BOOKING_STATUS_IDS.ARRIVED },
          modifiedBy: { ...modifiedBy },
          dateModified: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
        }));

        Swal.fire({
          title: "Éxito",
          text: "Reserva marcada como check-in",
          icon: "success",
          confirmButtonText: "Aceptar",
        });
      } else {
        throw new Error("Error al marcar como check-in");
      }
    } catch (error) {
      Swal.close();
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al marcar como check-in",
      });
    }
  }, [hasBalanceDue, bookingId, modifiedBy]);

  const handleNoShow = useCallback(async () => {
    const result = await Swal.fire({
      title: "¿Desea marcar la reserva como no show?",
      text: "Ya no podrá editar la reserva",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      confirmButtonColor: "red",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: "Cargando...",
        text: "Por favor, espere.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await updateStatusToNoShow(bookingId);
      if (res.isSuccessful) {
        setBooking((prevBooking) => ({
          ...prevBooking,
          status: { id: BOOKING_STATUS_IDS.NO_SHOW },
          modifiedBy: { ...modifiedBy },
          dateModified: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
        }));

        Swal.fire({
          title: "Éxito",
          text: "Reserva marcada como no show",
          icon: "success",
          confirmButtonText: "Aceptar",
        });
      } else {
        throw new Error("Error al marcar como no show");
      }
    } catch (error) {
      Swal.close();
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al marcar como no show",
      });
    }
  }, [bookingId, modifiedBy]);

  const handleComplete = useCallback(async () => {
    const result = await Swal.fire({
      title: "¿Desea marcar la reserva como completada?",
      text: "Ya no podrá editar la reserva",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      confirmButtonColor: "green",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: "Cargando...",
        text: "Por favor, espere.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await updateStatusToCompleted(bookingId);
      if (res.isSuccessful) {
        setBooking((prevBooking) => ({
          ...prevBooking,
          status: { id: BOOKING_STATUS_IDS.COMPLETED },
          modifiedBy: { ...modifiedBy },
          dateModified: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
        }));

        Swal.fire({
          title: "Éxito",
          text: "Reserva marcada como completada",
          icon: "success",
          confirmButtonText: "Aceptar",
        });
      } else {
        throw new Error("Error al marcar como completada");
      }
    } catch (error) {
      Swal.close();
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al marcar como completada",
      });
    }
  }, [bookingId, modifiedBy]);

  const handleCancel = useCallback(async () => {
    const result = await Swal.fire({
      title: "¿Desea cancelar la reserva?",
      text: "Ya no podrá editar la reserva",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      confirmButtonColor: "red",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: "Cargando...",
        text: "Por favor, espere.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await updateStatusToCancelled(bookingId);
      if (res.isSuccessful) {
        setBooking((prevBooking) => ({
          ...prevBooking,
          status: { id: BOOKING_STATUS_IDS.CANCELLED },
          modifiedBy: { ...modifiedBy },
          dateModified: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
        }));

        Swal.fire({
          title: "Éxito",
          text: "Asegúrate de devolver depositos si corresponde",
          icon: "info",
          confirmButtonText: "Aceptar",
        });
      } else {
        throw new Error("Error al cancelar la reserva");
      }
    } catch (error) {
      Swal.close();
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al cancelar la reserva",
      });
    }
  }, [bookingId, modifiedBy]);

  useEffect(() => {
    if (bookingId) {
      setIsLoading(true);
      getBookingById(bookingId, hotelId)
        .then(onGetBookingSuccess)
        .catch(onGetBookingError)
        .finally(() => setIsLoading(false));
    }
  }, [bookingId, hotelId]);

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} active="Reserva" />
      <h3 className="mb-4">Detalles de Reserva</h3>
      <ErrorBoundary>
        <Row className="mb-3">
          <Col className="px-3">
            {booking?.status?.id === BOOKING_STATUS_IDS.ACTIVE && (
              <Button color="outline-dark" onClick={handleCheckIn}>
                Marcar Check-in
                <FontAwesomeIcon icon={faPlaneArrival} className="ms-2" />
              </Button>
            )}
            {!LOCKED_BOOKING_STATUSES.includes(booking?.status?.id) &&
              dayjs(dayjs()).isAfter(booking?.arrivalDate) && (
                <Button
                  color="outline-dark"
                  className="ms-2"
                  onClick={handleComplete}>
                  Marcar Completada
                  <FontAwesomeIcon icon={faPlaneDeparture} className="ms-2" />
                </Button>
              )}
            {booking?.status?.id === BOOKING_STATUS_IDS.ACTIVE &&
              dayjs(dayjs()).isSameOrAfter(booking?.arrivalDate) && (
                <Button
                  color="outline-dark"
                  className="ms-2"
                  onClick={handleNoShow}>
                  Marcar No Show
                  <FontAwesomeIcon icon={faCalendarXmark} className="ms-2" />
                </Button>
              )}
            {!LOCKED_BOOKING_STATUSES.includes(booking?.status?.id) && (
              <Button
                color="outline-danger"
                className="ms-2 float-end"
                onClick={handleCancel}>
                Cancelar Reserva
                <FontAwesomeIcon icon={faRectangleXmark} className="ms-2" />
              </Button>
            )}
            {!LOCKED_BOOKING_STATUSES.includes(booking?.status?.id) && (
              <Link to="edit" className=" ms-2 float-end btn btn-outline-dark">
                Editar
                <FontAwesomeIcon icon={faPenToSquare} className="ms-2" />
              </Link>
            )}
            <Link
              to={`/hotels/${hotelId}/invoices/${booking?.invoiceId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-dark float-end">
              Ir a Factura
              <FontAwesomeIcon icon={faFileInvoiceDollar} className="ms-2" />
            </Link>
          </Col>
        </Row>
        <LoadingOverlay isVisible={isLoading} />
        {booking !== null && (
          <Card className="mb-4 bg-body-tertiary shadow">
            <CardHeader tag="h4" className="text-bg-dark text-center">
              Reserva # {booking?.id}
              <BookingStatusBadge
                className="float-end"
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
