// hooks/useBookingFormData.js
import { useState, useEffect } from "react";
import { getRoomBookingsByDateRange } from "services/bookingService";
import { getByHotelId as getRoomsByHotelId } from "services/roomService";
import { getByHotelId as getChargesByHotelId } from "services/extraChargeService";
import { toast } from "react-toastify";
import dayjs from "dayjs";

export default function useBookingFormData(hotelId, dates) {
  const [rooms, setRooms] = useState([]);
  const [charges, setCharges] = useState([]);
  const [roomBookings, setRoomBookings] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isLoadingCharges, setIsLoadingCharges] = useState(false);

  useEffect(() => {
    if (!hotelId) return;

    setIsLoadingRooms(true);
    getRoomsByHotelId(hotelId)
      .then((res) => setRooms(res.items || []))
      .catch(
        (err) =>
          err?.response?.status !== 404 &&
          toast.error("Error al cargar habitaciones")
      )
      .finally(() => setIsLoadingRooms(false));

    setIsLoadingCharges(true);
    getChargesByHotelId(hotelId)
      .then((res) => setCharges(res.items || []))
      .catch(
        (err) =>
          err?.response?.status !== 404 &&
          toast.error("Error al cargar cargos extras")
      )
      .finally(() => setIsLoadingCharges(false));
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
      .then((res) =>
        res.items?.length > 0
          ? setRoomBookings(res.items.map((b) => ({ ...b, roomId: b.room.id })))
          : setRoomBookings([])
      )
      .catch(
        (err) =>
          err?.response?.status !== 404 &&
          toast.error("Error al cargar reservas")
      )
      .finally(() => setIsLoadingBookings(false));
  }, [hotelId, dates]);

  return {
    rooms,
    charges,
    roomBookings,
    isLoadingRooms,
    isLoadingBookings,
    isLoadingCharges,
  };
}
