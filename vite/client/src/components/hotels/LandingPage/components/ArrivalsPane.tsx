import React from "react";
import BookingArrival from "components/bookings/BookingArrival";
import { useLanguage } from "contexts/LanguageContext";
import { type BookingArrivalItem } from "../types";
import { type Room } from "types/entities/room.types";

interface ArrivalsPaneProps {
  arrivals: BookingArrivalItem[];
  hotelId: string | undefined;
  handleCheckIn: (booking: BookingArrivalItem) => void;
}

const ArrivalsPane: React.FC<ArrivalsPaneProps> = ({
  arrivals,
  hotelId,
  handleCheckIn,
}) => {
  const { t } = useLanguage();

  const renderRooms = (rooms: Room[]) =>
    rooms && rooms.length > 0
      ? rooms.map((r) => (
          <li key={r.id} className="mb-1">
            {r.name}
          </li>
        ))
      : t("hotels.landing.noRooms");

  return (
    <>
      {arrivals.length === 0 ? (
        <div className="text-muted">{t("hotels.landing.noArrivals")}</div>
      ) : (
        arrivals.map((arrival: BookingArrivalItem, i: number) => (
          <BookingArrival
            key={`arrival-${arrival.id}-${i}`}
            arrival={arrival}
            hotelId={hotelId}
            handleCheckIn={handleCheckIn}
            hasBottomBorder={i < arrivals.length - 1}
            renderRooms={renderRooms}
          />
        ))
      )}
    </>
  );
};

export default ArrivalsPane;
