export interface RoomAvailability {
  date: string;
  roomId: number;
  isOpen: boolean;
}

export type RoomAvailabilityRequest = {
  isOpen: boolean;
  requests: Omit<RoomAvailability, "isOpen">[];
};
