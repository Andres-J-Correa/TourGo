import React from "react";
import BookingDeparture from "components/bookings/BookingDeparture";
import { useLanguage } from "contexts/LanguageContext";
import { type BookingDepartureItem } from "../types";
import { type Room } from "types/entities/room.types";

interface DeparturesPaneProps {
  departures: BookingDepartureItem[];
  hotelId: string | undefined;
  handleComplete: (booking: BookingDepartureItem) => void;
}

const DeparturesPane: React.FC<DeparturesPaneProps> = ({
  departures,
  hotelId,
  handleComplete,
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
      {departures.length === 0 ? (
        <div className="text-muted">{t("hotels.landing.noDepartures")}</div>
      ) : (
        departures.map((departure: BookingDepartureItem, i: number) => (
          <BookingDeparture
            key={`departure-${departure.id}-${i}`}
            departure={departure}
            hotelId={hotelId}
            handleComplete={handleComplete}
            hasBottomBorder={i < departures.length - 1}
            renderRooms={renderRooms}
          />
        ))
      )}
    </>
  );
};

export default DeparturesPane;
