import type { BookingMinimal } from "types/entities/booking.types";
import type { GetPagedMinimalBookingsByDateRangeParams } from "services/bookingServiceV2";

export interface BookingData {
  items: BookingMinimal[];
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export type PaginationData = Omit<
  GetPagedMinimalBookingsByDateRangeParams,
  "hotelId" | "startDate" | "endDate"
> & {
  startDate: string | null;
  endDate: string | null;
};
