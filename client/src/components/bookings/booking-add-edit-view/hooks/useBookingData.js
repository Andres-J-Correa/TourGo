import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getChargesByBookingId,
  getRoomBookingsByBookingId,
} from "services/bookingService";

export default function useBookingData(bookingId) {
  const [bookingCharges, setBookingCharges] = useState([]);
  const [bookingRoomBookings, setBookingRoomBookings] = useState([]);
  const [isLoadingBookingData, setIsLoadingBookingData] = useState(false);

  const onGetBookingChargesSuccess = (res) => {
    if (res.items?.length > 0) {
      const mappedCharges = res.items.map((c) => ({
        ...c,
        extraChargeId: c.id,
      }));

      setBookingCharges(mappedCharges);
    }
  };

  const onGetRoomBookingsSuccess = (res) => {
    if (res.items?.length > 0) {
      const mappedRoomBookings = res.items.map((b) => ({
        ...b,
        roomId: b.room.id,
      }));
      setBookingRoomBookings(mappedRoomBookings);
    }
  };

  useEffect(() => {
    if (bookingId) {
      setIsLoadingBookingData(true);

      Promise.allSettled([
        getChargesByBookingId(bookingId),
        getRoomBookingsByBookingId(bookingId),
      ])
        .then(([chargesResult, roomBookingsResult]) => {
          let errorMessage = "";

          if (chargesResult.status === "fulfilled") {
            onGetBookingChargesSuccess(chargesResult.value);
          } else if (chargesResult.reason?.response?.status !== 404) {
            errorMessage += "Error al cargar los cargos de la reserva";
          }

          if (roomBookingsResult.status === "fulfilled") {
            onGetRoomBookingsSuccess(roomBookingsResult.value);
          } else if (roomBookingsResult.reason?.response?.status !== 404) {
            errorMessage += "y las habitaciones de la reserva";
          }

          if (errorMessage) {
            toast.error(errorMessage);
          }
        })
        .finally(() => {
          setIsLoadingBookingData(false);
        });
    } else {
      setBookingCharges([]);
      setBookingRoomBookings([]);
    }
  }, [bookingId]);

  return {
    bookingCharges,
    bookingRoomBookings,
    isLoadingBookingData,
  };
}
