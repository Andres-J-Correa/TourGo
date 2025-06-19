// hooks/useBookingFormData.js
import { useState, useEffect, useCallback } from "react";
import { getRoomBookingsByDateRange } from "services/bookingService";
import { getBookingProvidersMinimalByHotelId } from "services/bookingProviderService";
import { getByHotelId as getRoomsByHotelId } from "services/roomService";
import { getByHotelId as getChargesByHotelId } from "services/extraChargeService";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useLanguage } from "contexts/LanguageContext";

export default function useBookingFormData(hotelId, dates) {
  const [rooms, setRooms] = useState([]);
  const [charges, setCharges] = useState([]);
  const [roomBookings, setRoomBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isLoadingHotelData, setIsLoadingHotelData] = useState(false);
  const [bookingProviderOptions, setBookingProviderOptions] = useState([]);
  const [isHotelDataInitialFetch, setIsHotelDataInitialFetch] = useState(true);
  const { t } = useLanguage();

  const onGetRoomBookingsSuccess = (res) =>
    res.items?.length > 0
      ? setRoomBookings(res.items.map((b) => ({ ...b, roomId: b.room.id })))
      : setRoomBookings([]);

  const onGetRoomBookingsError = useCallback(
    (err) => {
      if (err?.response?.status !== 404) {
        toast.error(t("booking.errors.loadBookings"));
      }
    },
    [t]
  );

  useEffect(() => {
    if (!hotelId) return;

    setIsLoadingHotelData(true);

    Promise.allSettled([
      getRoomsByHotelId(hotelId, true),
      getChargesByHotelId(hotelId, true),
      getBookingProvidersMinimalByHotelId(hotelId),
    ])
      .then(([roomsResult, chargesResult, bookingProvidersResult]) => {
        const errors = [];

        if (roomsResult.status === "fulfilled") {
          setRooms(roomsResult.value.items || []);
        } else if (roomsResult.reason?.response?.status !== 404) {
          errors.push(t("booking.errors.loadRooms"));
        }

        if (chargesResult.status === "fulfilled") {
          setCharges(chargesResult.value.items || []);
        } else if (chargesResult.reason?.response?.status !== 404) {
          errors.push(t("booking.errors.loadCharges"));
        }

        if (bookingProvidersResult.status === "fulfilled") {
          setBookingProviderOptions(bookingProvidersResult.value.items || []);
        } else if (bookingProvidersResult.reason?.response?.status !== 404) {
          errors.push(t("booking.errors.loadProviders"));
        }

        if (errors.length > 0) {
          toast.error(errors.join(" | "));
        }
      })
      .finally(() => {
        setIsLoadingHotelData(false);
        setIsHotelDataInitialFetch(false);
      });
  }, [hotelId, t]);

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
  }, [hotelId, dates, onGetRoomBookingsError]);

  return {
    rooms,
    charges,
    roomBookings,
    bookingProviderOptions,
    isLoadingHotelData,
    isLoadingBookings,
    isHotelDataInitialFetch,
  };
}
