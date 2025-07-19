import type {
  BookingMinimal,
  GetPagedMinimalBookingsByDateRangeParams,
} from "types/entities/booking.types";

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
