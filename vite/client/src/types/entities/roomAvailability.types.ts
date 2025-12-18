export interface RoomAvailability {
  date: string;
  roomId: number;
  isOpen: boolean;
}

export type RoomAvailabilityRequest = {
  isOpen: boolean;
  requests: Omit<RoomAvailability, "isOpen">[];
};

export type RoomAvailabilityByDateAndRoom = Record<
  string,
  Record<string, RoomAvailability>
>;
