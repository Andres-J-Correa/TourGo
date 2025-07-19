//types
import type { JSX } from "react";
import type { Room } from "types/entities/room.types";
import type { RoomBooking } from "types/entities/booking.types";
import type { RoomAvailability } from "types/entities/roomAvailability.types";
import type { Dayjs } from "dayjs";

//libs
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

//components
import DatePickersV2 from "components/commonUI/forms/DatePickersV2";
import Breadcrumbs from "components/commonUI/Breadcrumbs";
import Alert from "components/commonUI/Alert";
import RoomTable from "./components/RoomTable";
import DatesTable from "./components/DatesTable";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import ErrorBoundary from "components/commonUI/ErrorBoundary";

//services & utils
import { useLanguage } from "contexts/LanguageContext";
import { useCalendarTableData } from "./hooks/useCalendarTableData";
import { getDateString } from "utils/dateHelper";

//styles
import "./CalendarView.css";

dayjs.extend(isSameOrBefore);

function CalendarView(): JSX.Element {
  const [dates, setDates] = useState<{ start: Date | null; end: Date | null }>({
    start: dayjs().toDate(),
    end: dayjs().add(1, "month").toDate(),
  });

  const { hotelId } = useParams<{ hotelId: string }>();
  const { t } = useLanguage();

  const isDateRangeValid: boolean = useMemo(() => {
    return (
      dayjs(dates.start).isValid() &&
      dayjs(dates.end).isValid() &&
      dayjs(getDateString(dates.start)).isSameOrBefore(
        dayjs(getDateString(dates.end))
      )
    );
  }, [dates.start, dates.end]);

  const {
    rooms,
    roomBookings,
    loadingRooms,
    loadingBookings,
    loadingAvailability,
    roomAvailability,
  }: {
    rooms: Room[];
    roomBookings: RoomBooking[];
    loadingRooms: boolean;
    loadingBookings: boolean;
    loadingAvailability: boolean;
    roomAvailability: RoomAvailability[];
  } = useCalendarTableData(
    isDateRangeValid ? dates.start : null,
    isDateRangeValid ? dates.end : null,
    hotelId
  );

  const breadcrumbs: { label: string; path?: string }[] = useMemo(
    () => [
      { label: t("booking.breadcrumb.home"), path: "/" },
      { label: t("booking.breadcrumb.hotels"), path: "/hotels" },
      { label: t("booking.breadcrumb.hotel"), path: `/hotels/${hotelId}` },
    ],
    [hotelId, t]
  );

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

  const roomBookingsByDateAndRoom: Record<
    string,
    Record<string, RoomBooking>
  > = useMemo(() => {
    const result: Record<string, Record<string, RoomBooking>> = {};

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
  }, [roomBookings]);

  const roomAvailabilityByDateAndRoom: Record<
    string,
    Record<string, RoomAvailability>
  > = useMemo(() => {
    const roomAvailabilityByDate: Record<
      string,
      Record<string, RoomAvailability>
    > = {};

    roomAvailability.forEach((availability) => {
      if (availability.roomId && availability.date) {
        //check if the date exists in the roomAvailabilityByDate
        if (!roomAvailabilityByDate[availability.date]) {
          //if not, create it and initialize with the room id and availability
          roomAvailabilityByDate[availability.date] = {
            [availability.roomId]: availability,
          };
          return;
        }

        //if the date exists, check if the room id exists
        if (!roomAvailabilityByDate[availability.date]![availability.roomId]) {
          //if not, create it and initialize with the availability
          roomAvailabilityByDate[availability.date]![availability.roomId] =
            availability;
        }
      }
    });

    return roomAvailabilityByDate;
  }, [roomAvailability]);

  const handleDateChange =
    (field: "start" | "end") =>
    (date: Date | null): void => {
      setDates((prev) => ({
        ...prev,
        [field]: date,
      }));
    };

  return (
    <div>
      <Breadcrumbs
        breadcrumbs={breadcrumbs}
        active={t("booking.calendar.title")}
      />
      <h3>{t("booking.calendar.title")}</h3>
      <ErrorBoundary>
        <LoadingOverlay
          isVisible={loadingRooms || loadingBookings || loadingAvailability}
        />
        <DatePickersV2
          startDate={dates.start}
          endDate={dates.end}
          handleEndChange={handleDateChange("end")}
          handleStartChange={handleDateChange("start")}
          allowSameDay={true}
        />
        {!isDateRangeValid ? (
          <Alert type="danger">{t("booking.calendar.invalidDateRange")}</Alert>
        ) : (
          <div className="table-responsive table-calendar fs-7">
            <DatesTable datesArray={datesArray} />

            {rooms.map((room, index) => (
              <RoomTable
                key={`room-${index}`}
                room={room}
                datesArray={datesArray}
                datesWithBookingsByRoom={roomBookingsByDateAndRoom}
                datesWithAvailabilityByRoom={roomAvailabilityByDateAndRoom}
                hotelId={hotelId}
              />
            ))}
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
}

export default CalendarView;
