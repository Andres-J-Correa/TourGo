import { type BookingMinimal } from "types/entities/booking.types";
import { type Room } from "types/entities/room.types";

export interface BookingCustomer {
  firstName: string;
  lastName: string;
  phone?: string;
  documentNumber?: string;
  email?: string;
}

export interface BookingDepartureItem extends BookingMinimal {
  bookingProviderName?: string;
  nights: number;
  departingRooms: Room[];
  otherRooms: Room[];
  notes?: string;
  customer?: BookingCustomer;
}

export interface BookingArrivalItem extends BookingMinimal {
  bookingProviderName?: string;
  nights: number;
  eta?: string;
  arrivingRooms: Room[];
  otherRooms: Room[];
  notes?: string;
  customer?: BookingCustomer;
}

export interface BookingStayItem extends BookingMinimal {
  bookingProviderName?: string;
  nights: number;
  stayRooms: Room[];
  notes?: string;
  customer?: BookingCustomer;
}

export interface RoomMovementItem {
  bookingId: string;
  firstName: string;
  lastName: string;
  room: { id: number; name: string };
  isRoomChange?: boolean;
}

export interface HotelDashboardData {
  arrivals: BookingArrivalItem[];
  departures: BookingDepartureItem[];
  stays: BookingStayItem[];
  arrivingRooms: RoomMovementItem[];
  departingRooms: RoomMovementItem[];
  forCleaningRooms: RoomMovementItem[];
  availableRooms: Room[];
}
