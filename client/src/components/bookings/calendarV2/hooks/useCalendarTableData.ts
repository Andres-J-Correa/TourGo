//types
import type { RoomBooking } from "types/entities/booking.types";
import type { Room } from "types/entities/room.types";
import type {
  RoomAvailability,
  RoomAvailabilityRequest,
  RoomAvailabilityByDateAndRoom,
} from "types/entities/roomAvailability.types";

//libs
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { toast } from "react-toastify";

//services & utils
import { getByHotelId as getRoomsByHotelId } from "services/roomServiceV2";
import { getRoomBookingsByDateRange } from "services/bookingServiceV2";
import {
  getRoomAvailabilityByDateRange,
  upsertRoomAvailability,
} from "services/roomAvailabilityService";
import { useLanguage } from "contexts/LanguageContext";

export type RoomBookingsByDateAndRoom = Record<
  string,
  Record<string, RoomBooking>
>;

export const useCalendarTableData = (
  startDate: Date | null,
  endDate: Date | null,
  hotelId?: string
): {
  rooms: Room[];
  roomBookings: RoomBookingsByDateAndRoom;
  loadingRooms: boolean;
  loadingBookings: boolean;
  loadingAvailability: boolean;
  roomAvailability: RoomAvailabilityByDateAndRoom;
  handleUpsertRoomAvailability: (
    hotel: string,
    availability: RoomAvailabilityRequest
  ) => Promise<void>;
} => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomBookings, setRoomBookings] = useState<RoomBookingsByDateAndRoom>(
    {}
  );
  const [roomAvailability, setRoomAvailability] =
    useState<RoomAvailabilityByDateAndRoom>({});
  const [loadingRooms, setLoadingRooms] = useState<boolean>(false);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(false);
  const [loadingAvailability, setLoadingAvailability] =
    useState<boolean>(false);

  const { t } = useLanguage();

  const mapRoomAvailabilityByDateAndRoom = (
    roomAvailability: RoomAvailability[]
  ): RoomAvailabilityByDateAndRoom => {
    const roomAvailabilityByDate: Record<
      string,
      Record<string, RoomAvailability>
    > = {};

    roomAvailability.forEach((availability) => {
      if (availability.roomId && availability.date) {
        //check if the date exists in the roomAvailabilityByDate
        if (!roomAvailabilityByDate[availability.date]) {
          //if not, create it and initialize with the room id and availability
          roomAvailabilityByDate[availability.date] = {
            [availability.roomId]: availability,
          };
          return;
        }

        //if the date exists, check if the room id exists
        if (!roomAvailabilityByDate[availability.date]![availability.roomId]) {
          //if not, create it and initialize with the availability
          roomAvailabilityByDate[availability.date]![availability.roomId] =
            availability;
        }
      }
    });

    return roomAvailabilityByDate;
  };

  const handleUpsertRoomAvailability = async (
    hotelId: string,
    availability: RoomAvailabilityRequest
  ): Promise<void> => {
    const response = await upsertRoomAvailability(hotelId, availability);
    if (response.isSuccessful) {
      setRoomAvailability((prev) => {
        const copy = { ...prev };
        for (const roomAvailability of availability.requests) {
          copy[roomAvailability.date] = {
            ...copy[roomAvailability.date],
            [roomAvailability.roomId]: {
              ...roomAvailability,
              isOpen: availability.isOpen,
            },
          };
        }
        return copy;
      });
    } else {
      toast.error(t("booking.calendar.errors.upsertAvailability"));
    }
  };

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
        const roomBookingsByDateAndRoom: RoomBookingsByDateAndRoom = {};

        response.items.forEach((booking) => {
          if (booking.room?.id && booking.date) {
            //check if the date exists in the result
            if (!roomBookingsByDateAndRoom[booking.date]) {
              //if not, create it and initialize with the room id and booking
              roomBookingsByDateAndRoom[booking.date] = {
                [booking.room.id]: booking,
              };
              return;
            }

            //if the date exists, check if the room id exists
            if (!roomBookingsByDateAndRoom[booking.date]![booking.room.id]) {
              //if not, create it and initialize with the booking
              roomBookingsByDateAndRoom[booking.date]![booking.room.id] =
                booking;
            }
          }
        });

        setRoomBookings(roomBookingsByDateAndRoom);
      } else {
        if (response.error?.response?.status !== 404) {
          toast.error(t("booking.calendar.errors.loadBookings"));
        }
        setRoomBookings({});
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
        setRoomAvailability(mapRoomAvailabilityByDateAndRoom(response.items));
      } else {
        if (response.error?.response?.status !== 404) {
          toast.error(t("booking.calendar.errors.loadAvailability"));
        }
        setRoomAvailability({});
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
    handleUpsertRoomAvailability,
  };
};
