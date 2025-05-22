// hooks/useBookingFormData.js
import { useState, useEffect } from "react";
import { getRoomBookingsByDateRange } from "services/bookingService";
import { getBookingProvidersMinimalByHotelId } from "services/bookingProviderService";
import { getByHotelId as getRoomsByHotelId } from "services/roomService";
import { getByHotelId as getChargesByHotelId } from "services/extraChargeService";
import { toast } from "react-toastify";
import dayjs from "dayjs";

export default function useBookingFormData(hotelId, dates) {
  const [rooms, setRooms] = useState([]);
  const [charges, setCharges] = useState([]);
  const [roomBookings, setRoomBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isLoadingHotelData, setIsLoadingHotelData] = useState(false);
  const [bookingProviderOptions, setBookingProviderOptions] = useState([]);

  const onGetRoomBookingsSuccess = (res) =>
    res.items?.length > 0
      ? setRoomBookings(res.items.map((b) => ({ ...b, roomId: b.room.id })))
      : setRoomBookings([]);

  const onGetRoomBookingsError = (err) =>
    err?.response?.status !== 404 && toast.error("Error al cargar reservas");

  useEffect(() => {
    if (!hotelId) return;

    setIsLoadingHotelData(true);

    Promise.allSettled([
      getRoomsByHotelId(hotelId, true),
      getChargesByHotelId(hotelId, true),
      getBookingProvidersMinimalByHotelId(hotelId),
    ])
      .then(([roomsResult, chargesResult, bookingProvidersResult]) => {
        if (roomsResult.status === "fulfilled") {
          setRooms(roomsResult.value.items || []);
        } else if (roomsResult.reason?.response?.status !== 404) {
          toast.error("Error al cargar habitaciones");
        }

        if (chargesResult.status === "fulfilled") {
          setCharges(chargesResult.value.items || []);
        } else if (chargesResult.reason?.response?.status !== 404) {
          toast.error("Error al cargar cargos extras");
        }

        if (bookingProvidersResult.status === "fulfilled") {
          setBookingProviderOptions(bookingProvidersResult.value.items || []);
        } else if (bookingProvidersResult.reason?.response?.status !== 404) {
          toast.error("Error al cargar proveedores de reservas");
        }
      })
      .finally(() => {
        setIsLoadingHotelData(false);
      });
  }, [hotelId]);

  useEffect(() => {
    if (!hotelId || !dates.start || !dates.end) return;

    const isValidDate = (date) => dayjs(date).isValid();
    const isValidDateRange =
      isValidDate(dates.start) &&
      isValidDate(dates.end) &&
      dayjs(dates.start).isBefore(dayjs(dates.end));

    if (!isValidDateRange) return;

    setIsLoadingBookings(true);
    getRoomBookingsByDateRange(
      hotelId,
      dayjs(dates.start).subtract(1, "day").format("YYYY-MM-DD"),
      dayjs(dates.end).format("YYYY-MM-DD")
    )
      .then(onGetRoomBookingsSuccess)
      .catch(onGetRoomBookingsError)
      .finally(() => setIsLoadingBookings(false));
  }, [hotelId, dates]);

  return {
    rooms,
    charges,
    roomBookings,
    bookingProviderOptions,
    isLoadingHotelData,
    isLoadingBookings,
  };
}
