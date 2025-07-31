//types
import type { RoomBooking } from "types/entities/booking.types";
import type { Room } from "types/entities/room.types";
import type { RoomAvailability } from "types/entities/roomAvailability.types";
import type { Dayjs } from "dayjs";
import type { JSX } from "react";

//libs
import { Fragment, useCallback, useMemo, useState, useEffect } from "react";

//components
import PriceCell from "./PriceCell";
import BookingCell from "./BookingCell";
import CleaningCell from "./CleaningCell";

//services & utils
import { useLanguage } from "contexts/LanguageContext";
import { toggleRoomBookingShouldClean } from "services/bookingServiceV2";
import { toast } from "react-toastify";

function RoomTable({
  room,
  datesArray,
  datesWithBookingsByRoom,
  datesWithAvailabilityByRoom,
  handleBookingCellClick,
  hotelId,
  isCleaningMode,
}: {
  room: Room;
  datesArray: Dayjs[];
  datesWithBookingsByRoom: Record<string, Record<string, RoomBooking>>;
  datesWithAvailabilityByRoom: Record<string, Record<string, RoomAvailability>>;
  handleBookingCellClick: (
    date: string,
    roomId: number,
    isOpen: boolean
  ) => Promise<void>;
  hotelId?: string;
  isCleaningMode: boolean;
}): JSX.Element {
  const { t } = useLanguage();

  const [
    datesDictionaryWithBookingsByRoom,
    setDatesDictionaryWithBookingsByRoom,
  ] = useState<Record<string, Record<string, RoomBooking>>>({});

  const handleToggleShouldClean = useCallback(
    async (roomBooking: RoomBooking) => {
      if (!hotelId) return;

      const response = await toggleRoomBookingShouldClean(roomBooking, hotelId);

      if (response.isSuccessful) {
        const { date, room } = roomBooking;
        setDatesDictionaryWithBookingsByRoom((prev) => ({
          ...prev,
          [date]: {
            ...prev[date],
            [room.id]: {
              ...roomBooking,
              shouldClean: !roomBooking.shouldClean,
            },
          },
        }));
      } else {
        toast.error(t("booking.calendar.errors.toggleShouldClean"));
      }
    },
    [hotelId, t]
  );

  const components = useMemo((): {
    bookings: JSX.Element[];
    prices: JSX.Element[];
    cleaningCells: JSX.Element[];
  } => {
    const bookings: JSX.Element[] = [];
    const prices: JSX.Element[] = [];
    const cleaningCells: JSX.Element[] = [];

    let colSpan = 1;

    const getDate = (i: number): string | undefined =>
      datesArray[i]?.format("YYYY-MM-DD");

    const getRoomBooking = (date?: string): RoomBooking | undefined =>
      date ? datesDictionaryWithBookingsByRoom[date]?.[room.id] : undefined;

    const getAvailability = (date?: string): boolean =>
      date
        ? datesWithAvailabilityByRoom[date]?.[room.id]?.isOpen ?? true
        : true;

    const createPriceCell = (
      date: string,
      price?: number,
      hasCleaning?: boolean
    ) => (
      <PriceCell
        key={`price-${room.id}-${date}`}
        price={price}
        hasCleaning={hasCleaning}
      />
    );

    const createCleaningCell = (
      date: string,
      roomBooking?: RoomBooking,
      showBookingName?: boolean
    ) => (
      <CleaningCell
        key={`cleaning-${room.id}-${date}`}
        roomBooking={roomBooking}
        isCleaningMode={isCleaningMode}
        handleToggleShouldClean={handleToggleShouldClean}
        showBookingName={showBookingName}
      />
    );

    const createBookingCell = (
      date: string,
      options: Partial<{
        roomBooking: RoomBooking;
        colSpan: number;
        isFirst: boolean;
        isAvailable: boolean;
        onClick: () => Promise<void>;
      }>
    ): JSX.Element => (
      <BookingCell
        key={`booking-${room.id}-${date}`}
        {...options}
        hotelId={hotelId}
        isHidden={isCleaningMode}
      />
    );

    for (let i = 0; i < datesArray.length; i++) {
      const date = getDate(i);
      if (!date) continue;

      const roomBooking = getRoomBooking(date);
      prices.push(
        createPriceCell(date, roomBooking?.price, roomBooking?.shouldClean)
      );

      const previousDate = getDate(i - 1);
      const previousRoomBooking = getRoomBooking(previousDate);

      if (roomBooking) {
        const nextRoomBooking = getRoomBooking(getDate(i + 1));

        const isSameAsPrevious =
          previousRoomBooking?.bookingId === roomBooking.bookingId;

        cleaningCells.push(
          createCleaningCell(date, roomBooking, !isSameAsPrevious)
        );

        if (nextRoomBooking?.bookingId === roomBooking.bookingId) {
          colSpan++;
          continue;
        }

        bookings.push(
          createBookingCell(date, {
            roomBooking,
            colSpan,
          })
        );
      } else {
        const isAvailable = getAvailability(date);
        const isPreviousAvailable = getAvailability(previousDate);

        const isFirst =
          !!previousRoomBooking ||
          i === 0 ||
          (isAvailable ? !isPreviousAvailable : isPreviousAvailable);

        const handleClick = async () => {
          return await handleBookingCellClick(date, room.id, isAvailable);
        };
        cleaningCells.push(createCleaningCell(date));
        bookings.push(
          createBookingCell(date, {
            isFirst,
            isAvailable,
            onClick: handleClick,
          })
        );
      }

      colSpan = 1;
    }

    return { bookings, prices, cleaningCells };
  }, [
    datesArray,
    datesDictionaryWithBookingsByRoom,
    datesWithAvailabilityByRoom,
    room.id,
    hotelId,
    handleBookingCellClick,
    isCleaningMode,
    handleToggleShouldClean,
  ]);

  useEffect(() => {
    setDatesDictionaryWithBookingsByRoom(datesWithBookingsByRoom);
  }, [datesWithBookingsByRoom]);

  if (!room.id) return <Fragment />;

  return (
    <Fragment>
      <h6 className="room-header mb-1 text-decoration-underline">
        {room.name}
      </h6>
      <table className="table table-bordered table-sm mb-2">
        <tbody>
          <tr>
            <td className="first-column text-center align-content-center bg-light text-dark fw-bold">
              {t("booking.calendar.reservation")}
            </td>
            {components.bookings}
            {isCleaningMode && components.cleaningCells}
          </tr>
          <tr>
            <td className="first-column text-center align-content-center bg-light text-dark fw-bold">
              {t("booking.calendar.price")}
            </td>
            {components.prices}
          </tr>
        </tbody>
      </table>
    </Fragment>
  );
}

export default RoomTable;
