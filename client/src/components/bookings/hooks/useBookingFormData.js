// hooks/useBookingFormData.js
import { useState, useEffect } from "react";
import { getRoomBookingsByDateRange } from "services/bookingService";
import { getByHotelId as getRoomsByHotelId } from "services/roomService";
import { getByHotelId as getChargesByHotelId } from "services/extraChargeService";
import { getChargesByBookingId } from "services/bookingService";
import { toast } from "react-toastify";
import dayjs from "dayjs";

export default function useBookingFormData(hotelId, dates, bookingId) {
  const [rooms, setRooms] = useState([]);
  const [charges, setCharges] = useState([]);
  const [roomBookings, setRoomBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isLoadingHotelData, setIsLoadingHotelData] = useState(false);
  const [bookingCharges, setBookingCharges] = useState([]);
  const [isLoadingBookingCharges, setIsLoadingBookingCharges] = useState(false);

  const onGetBookingChargesSuccess = (res) => {
    if (res.isSuccessful) {
      const mappedCharges = res.items.map((c) => ({
        ...c,
        extraChargeId: c.id,
      }));

      setBookingCharges(mappedCharges);
    }
  };

  const onGetBookingChargesError = (e) => {
    e.response?.status !== 404 &&
      toast.error("Error al cargar cargos extras de la reserva");
  };

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
      getRoomsByHotelId(hotelId),
      getChargesByHotelId(hotelId),
    ])
      .then(([roomsResult, chargesResult]) => {
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
      dayjs(dates.start).format("YYYY-MM-DD"),
      dayjs(dates.end).format("YYYY-MM-DD")
    )
      .then(onGetRoomBookingsSuccess)
      .catch(onGetRoomBookingsError)
      .finally(() => setIsLoadingBookings(false));
  }, [hotelId, dates]);

  useEffect(() => {
    if (bookingId) {
      setIsLoadingBookingCharges(true);
      getChargesByBookingId(bookingId)
        .then(onGetBookingChargesSuccess)
        .catch(onGetBookingChargesError)
        .finally(() => setIsLoadingBookingCharges(false));
    }
  }, [bookingId]);

  return {
    rooms,
    charges,
    roomBookings,
    bookingCharges,
    isLoadingHotelData,
    isLoadingBookings,
    isLoadingBookingCharges,
  };
}
