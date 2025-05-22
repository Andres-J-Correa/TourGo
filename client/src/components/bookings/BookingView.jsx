import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getById as getBookingById,
  updateStatusToCheckedIn,
  updateStatusToNoShow,
  updateStatusToCompleted,
  updateStatusToCancelled,
} from "services/bookingService";
import { BOOKING_STATUS_DICTIONARY } from "components/bookings/constants";
import useBookingData from "components/bookings/booking-add-edit-view/hooks/useBookingData";
import BookingSummary from "components/bookings/booking-summary/BookingSummary";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import Breadcrumb from "components/commonUI/Breadcrumb";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import Swal from "sweetalert2";
import { Button } from "reactstrap";

function BookingView() {
  const { hotelId, bookingId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const { isLoadingBookingData, bookingCharges, bookingRoomBookings } =
    useBookingData(bookingId);

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
      title: "¿Desea marcar la reserva como arrivada?",
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
          status: BOOKING_STATUS_DICTIONARY.ARRIVED,
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
  }, [hasBalanceDue, bookingId]);

  useEffect(() => {
    if (bookingId) {
      setIsLoading(true);
      getBookingById(bookingId)
        .then(onGetBookingSuccess)
        .catch(onGetBookingError)
        .finally(() => setIsLoading(false));
    }
  }, [bookingId]);

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} active="Reserva" />
      <h3 className="mb-4">Reserva</h3>
      <div className="mb-3">
        {booking?.status?.id === BOOKING_STATUS_DICTIONARY.ACTIVE && (
          <Button
            color="outline-success"
            className="ms-2"
            onClick={handleCheckIn}>
            Check-in
          </Button>
        )}
        <Link to="edit" className="btn btn-outline-dark float-end">
          Editar
        </Link>
      </div>
      <LoadingOverlay isVisible={isLoading || isLoadingBookingData} />
      <ErrorBoundary>
        {booking !== null && (
          <BookingSummary
            bookingData={booking}
            roomBookings={bookingRoomBookings}
            extraCharges={bookingCharges}
            setBooking={setBooking}
            hotelId={hotelId}
          />
        )}
      </ErrorBoundary>
    </>
  );
}

export default BookingView;
