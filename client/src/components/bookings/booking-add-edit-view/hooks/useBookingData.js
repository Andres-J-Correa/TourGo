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

  const onGetBookingChargesError = () => {
    toast.error("Error al cargar cargos extras de la reserva");
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

  const onGetRoomBookingsError = () => {
    toast.error("Error al cargar reservas de habitaciones");
  };

  useEffect(() => {
    if (bookingId) {
      setIsLoadingBookingData(true);

      Promise.allSettled([
        getChargesByBookingId(bookingId),
        getRoomBookingsByBookingId(bookingId),
      ])
        .then(([chargesResult, roomBookingsResult]) => {
          if (chargesResult.status === "fulfilled") {
            onGetBookingChargesSuccess(chargesResult.value);
          } else if (chargesResult.reason?.response?.status !== 404) {
            onGetBookingChargesError();
          }

          if (roomBookingsResult.status === "fulfilled") {
            onGetRoomBookingsSuccess(roomBookingsResult.value);
          } else if (roomBookingsResult.reason?.response?.status !== 404) {
            onGetRoomBookingsError();
          }
        })
        .finally(() => {
          setIsLoadingBookingData(false);
        });
    }
  }, [bookingId]);

  return {
    bookingCharges,
    bookingRoomBookings,
    isLoadingBookingData,
  };
}
