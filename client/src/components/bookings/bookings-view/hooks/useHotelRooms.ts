import { useState, useEffect } from "react";
import { getByHotelId as getRoomsByHotelId } from "services/roomServiceV2";
import { toast } from "react-toastify";
import { useLanguage } from "contexts/LanguageContext";
import type { Room } from "types/entities/room.types";

export function useHotelRooms(hotelId: string | undefined) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (!hotelId) return;

    setLoadingRooms(true);
    getRoomsByHotelId(hotelId)
      .then((res) => {
        if (res.isSuccessful) {
          setRooms(res.items);
        } else {
          if (res.error.status !== 404 && res.error.status !== 401) {
            toast.error(res.error.message);
          }
        }
      })
      .finally(() => {
        setLoadingRooms(false);
      });
  }, [hotelId, t]);

  return { rooms, loadingRooms };
}
