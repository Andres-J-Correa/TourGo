import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getById as getBookingById } from "services/bookingService";
import useBookingData from "components/bookings/booking-add-edit-view/hooks/useBookingData";
import BookingSummary from "components/bookings/booking-summary/BookingSummary";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import Breadcrumb from "components/commonUI/Breadcrumb";
import ErrorBoundary from "components/commonUI/ErrorBoundary";

function BookingView() {
  const { hotelId, bookingId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const { isLoadingBookingData, bookingCharges, bookingRoomBookings } =
    useBookingData(bookingId);

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
        <Link to="edit" className="btn btn-outline-dark">
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
