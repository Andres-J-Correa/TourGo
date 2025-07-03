import type { User } from "@/types/user.types";

export interface BookingMinimal {
  id: string;
  externalBookingId?: string | null;
  arrivalDate: string;
  departureDate: string;
  total: number;
  balanceDue: number;
  firstName: string;
  lastName: string;
  statusId: number;
  dateCreated: string;
  dateModified: string;
  createdBy?: Pick<User, "firstName" | "lastName"> | null;
  modifiedBy: Pick<User, "firstName" | "lastName"> | null;
}

export interface BookingCardProps {
  booking: BookingMinimal;
}
