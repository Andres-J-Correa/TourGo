import type { BookingMinimal } from "types/entities/booking.types";

export interface BookingCardProps {
  booking: BookingMinimal;
  hotelId: string;
}
