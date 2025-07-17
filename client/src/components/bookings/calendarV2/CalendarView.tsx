//types
import type { JSX } from "react";
import type { Room } from "types/entities/room.types";
import type { RoomBooking } from "types/entities/booking.types";
import type { Dayjs } from "dayjs";

//libs
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";

//components
import DatePickersV2 from "components/commonUI/forms/DatePickersV2";
import Breadcrumbs from "components/commonUI/Breadcrumbs";
import Alert from "components/commonUI/Alert";
import RoomTable from "./components/RoomTable";
import DatesTable from "./components/DatesTable";

//services & utils
import { useLanguage } from "contexts/LanguageContext";
import { getByHotelId as getRoomsByHotelId } from "services/roomServiceV2";
import { getRoomBookingsByDateRange } from "services/bookingServiceV2";

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
    date: "2025-07-01",
    room: { id: 1, name: "Deluxe Room Edited v2" },
    bookingId: "BKN-KCQFOTQZ",
    price: 150000.0,
    firstName: "John",
    lastName: "Doe",
  },
  {
    date: "2025-07-02",
    room: { id: 1, name: "Deluxe Room Edited v2" },
    bookingId: "BKN-KCQFOTQZ",
    price: 150000.0,
    firstName: "John",
    lastName: "Doe",
  },
  {
    date: "2025-07-03",
    room: { id: 1, name: "Deluxe Room Edited v2" },
    bookingId: "BKN-KCQFOTQZ",
    price: 150000.0,
    firstName: "John",
    lastName: "Doe",
  },
  {
    date: "2025-07-05",
    room: { id: 3, name: "Cuarto Doble Economico 1" },
    bookingId: "BKN-KUL8OXCV",
    price: 80000.0,
    firstName: "ANDRES CARNE DE RES",
    lastName: "Correa",
  },
  {
    date: "2025-07-06",
    room: { id: 3, name: "Cuarto Doble Economico 1" },
    bookingId: "BKN-KUL8OXCV",
    price: 80000.0,
    firstName: "ANDRES CARNE DE RES",
    lastName: "Correa",
  },
];

function CalendarView(): JSX.Element {
  const [dates, setDates] = useState<{ start: Date | null; end: Date | null }>({
    start: dayjs().startOf("month").toDate(),
    end: dayjs().endOf("month").toDate(),
  });

  const datesArray: Dayjs[] = useMemo(() => {
    const start = dayjs(dates.start);
    const end = dayjs(dates.end);
    const days: Dayjs[] = [];

    for (
      let date = start;
      date.isBefore(end) || date.isSame(end, "day");
      date = date.add(1, "day")
    ) {
      days.push(date);
    }

    return days;
  }, [dates.start, dates.end]);

  const datesWithBookingsByRoom: Record<
    string,
    Record<string, Partial<RoomBooking>>
  > = useMemo(() => {
    const result: Record<string, Record<string, Partial<RoomBooking>>> = {};

    roomBookings.forEach((booking) => {
      if (booking.room?.id && booking.date) {
        //check if the date exists in the result
        if (!result[booking.date]) {
          //if not, create it and initialize with the room id and booking
          result[booking.date] = {
            [booking.room.id]: booking,
          };
          return;
        }

        //if the date exists, check if the room id exists
        if (!result[booking.date]![booking.room.id]) {
          //if not, create it and initialize with the booking
          result[booking.date]![booking.room.id] = booking;
        }
      }
    });

    return result;
  }, []);

  const handleDateChange = (field: "start" | "end") => (date: Date | null) => {
    setDates((prev) => ({
      ...prev,
      [field]: date,
    }));
  };

  const isDateRangeValid: boolean = useMemo(() => {
    return (
      dayjs(dates.start).isValid() &&
      dayjs(dates.end).isValid() &&
      dayjs(dates.start).isBefore(dayjs(dates.end))
    );
  }, [dates.start, dates.end]);

  const { hotelId } = useParams<{ hotelId: string }>();
  const { t } = useLanguage();

  const breadcrumbs: { label: string; path?: string }[] = useMemo(
    () => [
      { label: t("booking.breadcrumb.home"), path: "/" },
      { label: t("booking.breadcrumb.hotels"), path: "/hotels" },
      { label: t("booking.breadcrumb.hotel"), path: `/hotels/${hotelId}` },
    ],
    [hotelId, t]
  );

  return (
    <div>
      <Breadcrumbs
        breadcrumbs={breadcrumbs}
        active={t("booking.calendar.title")}
      />
      <h3>{t("booking.calendar.title")}</h3>
      <DatePickersV2
        startDate={dates.start}
        endDate={dates.end}
        handleEndChange={handleDateChange("end")}
        handleStartChange={handleDateChange("start")}
        allowSameDay={true}
      />
      {!isDateRangeValid && (
        <Alert type="danger">{t("booking.calendar.invalidDateRange")}</Alert>
      )}
      <div className="table-responsive table-calendar fs-7">
        <DatesTable datesArray={datesArray} />

        {rooms.map((room, index) => (
          <RoomTable
            key={`room-${index}`}
            room={room}
            datesArray={datesArray}
            datesWithBookingsByRoom={datesWithBookingsByRoom}
          />
        ))}
      </div>
    </div>
  );
}

export default CalendarView;
