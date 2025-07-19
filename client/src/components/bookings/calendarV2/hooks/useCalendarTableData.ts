//types
import type { RoomBooking } from "types/entities/booking.types";
import type { Room } from "types/entities/room.types";
import type { RoomAvailability } from "types/entities/roomAvailability.types";

//libs
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { toast } from "react-toastify";

//services & utils
import { getByHotelId as getRoomsByHotelId } from "services/roomServiceV2";
import { getRoomBookingsByDateRange } from "services/bookingServiceV2";
import { getRoomAvailabilityByDateRange } from "services/roomAvailabilityService";
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
  loadingAvailability: boolean;
  roomAvailability: RoomAvailability[];
} => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomBookings, setRoomBookings] = useState<RoomBooking[]>([]);
  const [roomAvailability, setRoomAvailability] = useState<RoomAvailability[]>(
    []
  );
  const [loadingRooms, setLoadingRooms] = useState<boolean>(false);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(false);
  const [loadingAvailability, setLoadingAvailability] =
    useState<boolean>(false);

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

    const start = dayjs(startDate).format("YYYY-MM-DD");
    const end = dayjs(endDate).format("YYYY-MM-DD");

    const fetchRoomBookings = async () => {
      setLoadingBookings(true);

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

    const fetchRoomAvailability = async () => {
      setLoadingAvailability(true);
      const response = await getRoomAvailabilityByDateRange(
        hotelId,
        start,
        end
      );

      if (response.isSuccessful) {
        setRoomAvailability(response.items);
      } else {
        if (response.error?.response?.status !== 404) {
          toast.error(t("booking.calendar.errors.loadAvailability"));
        }
        setRoomAvailability([]);
      }
      setLoadingAvailability(false);
    };

    fetchRoomBookings();
    fetchRoomAvailability();
  }, [hotelId, startDate, endDate, t]);

  return {
    rooms,
    roomBookings,
    loadingRooms,
    loadingBookings,
    loadingAvailability,
    roomAvailability,
  };
};
