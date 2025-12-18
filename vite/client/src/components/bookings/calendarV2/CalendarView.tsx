//types
import type { JSX } from "react";
import type { Dayjs } from "dayjs";

//libs
import { useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

//components
import DatePickersV2 from "components/commonUI/forms/DatePickersV2";
import Alert from "components/commonUI/Alert";
import RoomTable from "./components/RoomTable";
import DatesTable from "./components/DatesTable";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import ErrorBoundary from "components/commonUI/ErrorBoundary";

//services & utils
import { useLanguage } from "contexts/LanguageContext";
import { useCalendarTableData } from "./hooks/useCalendarTableData";
import { getDateString } from "utils/dateHelper";
import BreadcrumbBuilder from "components/commonUI/BreadcrumbsBuilder";

//styles
import "./CalendarView.css";
import { Button, Col, Row, ButtonGroup } from "reactstrap";

dayjs.extend(isSameOrBefore);

function CalendarView(): JSX.Element {
  const [dates, setDates] = useState<{ start: Date | null; end: Date | null }>({
    start: dayjs().toDate(),
    end: dayjs().add(1, "month").toDate(),
  });

  const [isCleaningMode, setIsCleaningMode] = useState<boolean>(false);

  const { t } = useLanguage();
  const { hotelId } = useParams<{ hotelId: string }>();

  const breadcrumbs = useMemo(() => {
    return hotelId
      ? new BreadcrumbBuilder(t)
          .addHotel(hotelId)
          .addActive(t("booking.calendar.title"))
          .build()
      : null;
  }, [hotelId, t]);

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
    handleUpsertRoomAvailability,
  } = useCalendarTableData(
    isDateRangeValid ? dates.start : null,
    isDateRangeValid ? dates.end : null,
    hotelId
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

  const handleDateChange =
    (field: "start" | "end") =>
    (date: Date | null): void => {
      setDates((prev) => ({
        ...prev,
        [field]: date,
      }));
    };

  const handleBookingCellClick = useCallback(
    async (date: string, roomId: number, isOpen: boolean): Promise<void> => {
      if (!hotelId) return;
      await handleUpsertRoomAvailability(hotelId, {
        requests: [{ roomId, date }],
        isOpen: !isOpen,
      });
    },
    [hotelId, handleUpsertRoomAvailability]
  );

  const handleCleaningModeToggle = (isCleaning: boolean): void => {
    setIsCleaningMode(isCleaning);
  };

  return (
    <div>
      {breadcrumbs}
      <h3>{t("booking.calendar.title")}</h3>
      <ErrorBoundary>
        <LoadingOverlay
          isVisible={loadingRooms || loadingBookings || loadingAvailability}
        />
        <Row className="mb-3">
          <Col lg={4} md={6} sm={12}>
            <DatePickersV2
              startDate={dates.start}
              endDate={dates.end}
              handleEndChange={handleDateChange("end")}
              handleStartChange={handleDateChange("start")}
              allowSameDay={true}
            />
          </Col>
          <Col className="align-content-center">
            <ButtonGroup className="float-end">
              <Button
                color={isCleaningMode ? "outline-dark" : "dark"}
                onClick={() => handleCleaningModeToggle(false)}>
                {t("booking.calendar.bookingMode")}
              </Button>
              <Button
                color={!isCleaningMode ? "outline-dark" : "dark"}
                onClick={() => handleCleaningModeToggle(true)}>
                {t("booking.calendar.cleaningMode")}
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
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
                datesWithBookingsByRoom={roomBookings}
                datesWithAvailabilityByRoom={roomAvailability}
                hotelId={hotelId}
                handleBookingCellClick={handleBookingCellClick}
                isCleaningMode={isCleaningMode}
              />
            ))}
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
}

export default CalendarView;
