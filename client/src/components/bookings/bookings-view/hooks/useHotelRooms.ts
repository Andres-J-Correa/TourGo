import { useState, useEffect } from "react";
import { getByHotelId as getRoomsByHotelId } from "services/roomService";
import { toast } from "react-toastify";
import { useLanguage } from "contexts/LanguageContext";

export function useHotelRooms(hotelId: string | undefined) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (!hotelId) return;

    setLoadingRooms(true);
    getRoomsByHotelId(hotelId)
      .then((res: any) => {
        if (res.isSuccessful) {
          setRooms(res.items);
        }
      })
      .catch((error: any) => {
        if (error?.response?.status !== 404) {
          toast.error(t("financialReports.roomOccupancyReport.loadRoomsError"));
        }
      })
      .finally(() => {
        setLoadingRooms(false);
      });
  }, [hotelId, t]);

  return { rooms, loadingRooms };
}
