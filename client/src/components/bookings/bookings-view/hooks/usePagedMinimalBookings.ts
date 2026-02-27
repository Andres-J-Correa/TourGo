import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { getPagedMinimalBookingsByDateRange } from "services/bookingServiceV2";
import type { BookingMinimal } from "types/entities/booking.types";
import type { ErrorResponse, PagedResponse } from "types/apiResponse.types";
import type { BookingData, PaginationData } from "../BookingsViewV2.types";
import { toast } from "react-toastify";

export const defaultData: BookingData = {
  items: [],
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

export function usePagedMinimalBookings(
  hotelId: string | undefined,
  paginationData: PaginationData,
) {
  const [data, setData] = useState<BookingData>(defaultData);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!hotelId) return;

    const fetchData = async () => {
      setLoading(true);
      const startDate = paginationData.startDate
        ? dayjs(paginationData.startDate).format("YYYY-MM-DD")
        : undefined;
      const endDate = paginationData.endDate
        ? dayjs(paginationData.endDate).format("YYYY-MM-DD")
        : undefined;

      const res: PagedResponse<BookingMinimal> | ErrorResponse =
        await getPagedMinimalBookingsByDateRange({
          ...paginationData,
          hotelId,
          startDate,
          endDate,
        });

      if (res.isSuccessful) {
        setData({
          items: res.item.pagedItems,
          totalCount: res.item.totalCount,
          totalPages: res.item.totalPages,
          hasPreviousPage: res.item.hasPreviousPage,
          hasNextPage: res.item.hasNextPage,
        });
      } else {
        setData({ ...defaultData });
        toast.error(res.error.message);
      }
      setLoading(false);
    };

    fetchData();
  }, [hotelId, paginationData]);

  return { data, loading };
}
