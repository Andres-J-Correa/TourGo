import type { EntityBase, AuditableEntity } from "./entity.types";
import type { Lookup } from "../common.types";
import type { Room } from "./room.types";
import type { ExtraCharge } from "./extraCharge.types";

export interface RoomBooking {
  date: string;
  room: Pick<Room, "id" | "name">;
  bookingId: string;
  price: number;
  firstName?: string | null;
  lastName?: string | null;
}

export interface Booking extends EntityBase {
  externalId?: string | null;
  arrivalDate: Date;
  departureDate: Date;
  eta?: Date | null;
  adultGuests: number;
  childGuests: number;
  status: Partial<Lookup>;
  notes?: string | null;
  bookingProvider?: Partial<Lookup> | null;
  externalCommission: number;
  nights: number;
  roomBookings?: Partial<RoomBooking>[] | null;
  extraCharges?: Partial<ExtraCharge>[] | null;
  personalizedCharges?: Partial<ExtraCharge>[] | null;
}

export interface BookingMinimal extends AuditableEntity {
  id: string;
  externalBookingId?: string | null;
  arrivalDate: Date;
  departureDate: Date;
  total: number;
  balanceDue: number;
  firstName: string;
  lastName: string;
  statusId: number;
}
