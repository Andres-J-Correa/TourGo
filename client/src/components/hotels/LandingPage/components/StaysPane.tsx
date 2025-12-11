import React from "react";
import BookingStay from "components/bookings/BookingStay";
import { useLanguage } from "contexts/LanguageContext";
import { type BookingStayItem } from "../types";
import { type Room } from "types/entities/room.types";

interface StaysPaneProps {
  stays: BookingStayItem[];
  hotelId: string | undefined;
}

const StaysPane: React.FC<StaysPaneProps> = ({ stays, hotelId }) => {
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
      {stays.length === 0 ? (
        <div className="text-muted">{t("hotels.landing.noStays")}</div>
      ) : (
        stays.map((stay: BookingStayItem, i: number) => (
          <BookingStay
            key={`stay-${stay.id}-${i}`}
            stay={stay}
            hotelId={hotelId}
            hasBottomBorder={i < stays.length - 1}
            renderRooms={renderRooms}
          />
        ))
      )}
    </>
  );
};

export default StaysPane;
