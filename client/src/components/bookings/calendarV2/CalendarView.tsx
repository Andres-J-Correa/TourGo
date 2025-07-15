//types
import type { JSX } from "react";
import type { Room } from "types/entities/room.types";
import type { RoomBooking } from "types/entities/booking.types";

//libs
import { useState } from "react";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";

//components
import DatePickersV2 from "components/commonUI/forms/DatePickersV2";
import Breadcrumbs from "components/commonUI/Breadcrumbs";

//services & utils
import { useLanguage } from "contexts/LanguageContext";

//styles
import "./CalendarView.css";

const rooms: Partial<Room>[] = [
  { id: 1, name: "Deluxe Room Edited v2" },
  { id: 2, name: "Room 2" },
  { id: 3, name: "Cuarto Doble Economico 1" },
  { id: 4, name: "Room 4" },
  { id: 5, name: "Room 5" },
  { id: 6, name: "Room 6" },
  { id: 7, name: "Room 7" },
  { id: 8, name: "Room 8" },
  { id: 9, name: "Room 9" },
  { id: 10, name: "Room 10" },
  { id: 11, name: "Room 11" },
  { id: 12, name: "Room 12" },
  { id: 13, name: "Room 13" },
  { id: 14, name: "Room 14" },
  { id: 15, name: "Room 15" },
  { id: 16, name: "Room 16" },
  { id: 17, name: "Room 17" },
  { id: 18, name: "Room 18" },
  { id: 19, name: "Room 19" },
  { id: 20, name: "Room 20" },
];

const roomBookings: Partial<RoomBooking>[] = [
  {
    date: dayjs("2025-07-01").toDate(),
    room: { id: 1, name: "Deluxe Room Edited v2" },
    bookingId: "BKN-KCQFOTQZ",
    price: 150000.0,
    firstName: "John",
    lastName: "Doe",
  },
  {
    date: dayjs("2025-07-02").toDate(),
    room: { id: 1, name: "Deluxe Room Edited v2" },
    bookingId: "BKN-KCQFOTQZ",
    price: 150000.0,
    firstName: "John",
    lastName: "Doe",
  },
  {
    date: dayjs("2025-07-01").toDate(),
    room: { id: 3, name: "Cuarto Doble Economico 1" },
    bookingId: "BKN-KUL8OXCV",
    price: 80000.0,
    firstName: "Andres",
    lastName: "Correa",
  },
];

function CalendarView(): JSX.Element {
  const [dates, setDates] = useState<Date | null>(null);

  const { hotelId } = useParams<{ hotelId: string }>();
  const { t } = useLanguage();

  const breadcrumbs: { label: string; path?: string }[] = [
    { label: t("booking.breadcrumb.home"), path: "/" },
    { label: t("booking.breadcrumb.hotels"), path: "/hotels" },
    { label: t("booking.breadcrumb.hotel"), path: `/hotels/${hotelId}` },
  ];

  return (
    <div>
      <Breadcrumbs
        breadcrumbs={breadcrumbs}
        active={t("booking.calendar.title")}
      />
      <h1>{t("booking.calendar.title")}</h1>
    </div>
  );
}

export default CalendarView;
