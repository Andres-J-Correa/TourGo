import type { Room } from "types/entities/room.types";
import type { ExtraCharge } from "types/entities/extraCharge.types";
import type { BookingProviderMinimal } from "types/entities/bookingProviders.types";

//libs
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

//services & utils
import { useLanguage } from "contexts/LanguageContext";
import { getByHotelId as getRoomsByHotelId } from "services/roomServiceV2";
import { getByHotelId as getChargesByHotelId } from "services/extraChargeServiceV2";
import { getBookingProvidersMinimalByHotelId } from "services/bookingProviderServiceV2";

export default function useHotelDetails(hotelId?: string): {
  rooms: Room[];
  charges: ExtraCharge[];
  bookingProviderOptions: BookingProviderMinimal[];
  isLoadingHotelData: boolean;
} {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [charges, setCharges] = useState<ExtraCharge[]>([]);
  const [bookingProviderOptions, setBookingProviderOptions] = useState<
    BookingProviderMinimal[]
  >([]);

  const [isLoadingHotelData, setIsLoadingHotelData] = useState<boolean>(true);

  const { t } = useLanguage();

  useEffect(() => {
    if (!hotelId) {
      setIsLoadingHotelData(false);
      return;
    }

    const isActive = true;

    Promise.allSettled([
      getRoomsByHotelId(hotelId, isActive),
      getChargesByHotelId(hotelId, isActive),
      getBookingProvidersMinimalByHotelId(hotelId),
    ])
      .then(([roomsResult, chargesResult, bookingProvidersResult]) => {
        const errors = [];

        if (roomsResult.status === "fulfilled") {
          if (roomsResult.value.isSuccessful) {
            setRooms(roomsResult.value.items || []);
          } else if (roomsResult.value?.error.response?.status !== 404) {
            errors.push(t("booking.errors.loadRooms"));
          }
        }

        if (chargesResult.status === "fulfilled") {
          if (chargesResult.value.isSuccessful) {
            setCharges(chargesResult.value.items || []);
          } else if (chargesResult.value?.error.response?.status !== 404) {
            errors.push(t("booking.errors.loadCharges"));
          }
        }

        if (bookingProvidersResult.status === "fulfilled") {
          if (bookingProvidersResult.value.isSuccessful) {
            setBookingProviderOptions(bookingProvidersResult.value.items || []);
          } else if (
            bookingProvidersResult.value?.error.response?.status !== 404
          ) {
            errors.push(t("booking.errors.loadProviders"));
          }
        }

        if (errors.length > 0) {
          toast.error(errors.join(" | "));
        }
      })
      .finally(() => {
        setIsLoadingHotelData(false);
      });
  }, [hotelId, t]);

  return { rooms, charges, bookingProviderOptions, isLoadingHotelData };
}
