//types
import type { RoomBooking } from "types/entities/booking.types";
import type { Room } from "types/entities/room.types";

//libs
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { toast } from "react-toastify";

//services & utils
import { getByHotelId as getRoomsByHotelId } from "services/roomServiceV2";
import { getRoomBookingsByDateRange } from "services/bookingServiceV2";
import { useLanguage } from "contexts/LanguageContext";

export const useCalendarTableData = (
  startDate: Date | null,
  endDate: Date | null,
  hotelId?: string
): {
  rooms: Room[];
  roomBookings: RoomBooking[];
  loadingRooms: boolean;
  loadingBookings: boolean;
} => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomBookings, setRoomBookings] = useState<RoomBooking[]>([]);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(false);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(false);

  const { t } = useLanguage();

  useEffect(() => {
    if (!hotelId) return;

    const fetchRooms = async () => {
      setLoadingRooms(true);
      const response = await getRoomsByHotelId(hotelId);

      if (response.isSuccessful) {
        setRooms(response.items);
      } else {
        if (response.error?.response?.status !== 404) {
          toast.error(t("booking.calendar.errors.loadRooms"));
        }
        setRooms([]);
      }
      setLoadingRooms(false);
    };

    fetchRooms();
  }, [hotelId, t]);

  useEffect(() => {
    if (!hotelId || !startDate || !endDate) return;

    const fetchRoomBookings = async () => {
      setLoadingBookings(true);
      const start = dayjs(startDate).format("YYYY-MM-DD");
      const end = dayjs(endDate).format("YYYY-MM-DD");

      const response = await getRoomBookingsByDateRange(hotelId, start, end);

      if (response.isSuccessful) {
        setRoomBookings(response.items);
      } else {
        if (response.error?.response?.status !== 404) {
          toast.error(t("booking.calendar.errors.loadBookings"));
        }
        setRoomBookings([]);
      }
      setLoadingBookings(false);
    };

    fetchRoomBookings();
  }, [hotelId, startDate, endDate, t]);

  return { rooms, roomBookings, loadingRooms, loadingBookings };
};
