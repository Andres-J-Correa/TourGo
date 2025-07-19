//types
import type { RoomBooking } from "types/entities/booking.types";
import type { Room } from "types/entities/room.types";
import type { RoomAvailability } from "types/entities/roomAvailability.types";
import type { Dayjs } from "dayjs";
import type { JSX } from "react";

//libs
import { Fragment, useMemo } from "react";

//components
import PriceCell from "./PriceCell";
import BookingCell from "./BookingCell";

//services & utils
import { useLanguage } from "contexts/LanguageContext";

function RoomTable({
  room,
  datesArray,
  datesWithBookingsByRoom,
  datesWithAvailabilityByRoom,
  hotelId,
}: {
  room: Room;
  datesArray: Dayjs[];
  datesWithBookingsByRoom: Record<string, Record<string, RoomBooking>>;
  datesWithAvailabilityByRoom: Record<string, Record<string, RoomAvailability>>;
  hotelId?: string;
}): JSX.Element {
  const { t } = useLanguage();

  const components = useMemo((): {
    bookings: JSX.Element[];
    prices: JSX.Element[];
  } => {
    const bookings: JSX.Element[] = [];
    const prices: JSX.Element[] = [];

    let colSpan: number = 1;
    for (let i = 0; i < datesArray.length; i++) {
      const date: string | undefined = datesArray[i]?.format("YYYY-MM-DD");

      if (!date) continue;

      const roomBooking: RoomBooking | undefined =
        datesWithBookingsByRoom[date]?.[room.id];

      prices.push(
        <PriceCell
          key={`price-${room.id}-${date}`}
          price={roomBooking?.price}
        />
      );

      if (roomBooking) {
        const nextDate: string | undefined =
          datesArray[i + 1]?.format("YYYY-MM-DD");

        if (!nextDate) {
          bookings.push(
            <BookingCell
              key={`booking-${room.id}-${date}`}
              roomBooking={roomBooking}
              colSpan={colSpan}
              hotelId={hotelId}
            />
          );
        } else {
          const nextRoomBooking: RoomBooking | undefined =
            datesWithBookingsByRoom[nextDate]?.[room.id];

          if (nextRoomBooking?.bookingId === roomBooking.bookingId) {
            colSpan++;
            continue;
          }

          bookings.push(
            <BookingCell
              key={`booking-${room.id}-${date}`}
              roomBooking={roomBooking}
              colSpan={colSpan}
              hotelId={hotelId}
            />
          );
        }
      } else {
        const previousDate: string | undefined =
          datesArray[i - 1]?.format("YYYY-MM-DD");

        const isAvailable: boolean | undefined =
          datesWithAvailabilityByRoom[date]?.[room.id]?.isOpen ?? true;

        if (!previousDate) {
          bookings.push(
            <BookingCell
              key={`booking-${room.id}-${date}`}
              isFirst={true}
              isAvailable={isAvailable}
            />
          );
        } else {
          let isFirst: boolean = false;

          const previousRoomBooking: RoomBooking | undefined =
            datesWithBookingsByRoom[previousDate]?.[room.id];

          const isPreviousAvailable: boolean =
            datesWithAvailabilityByRoom[previousDate]?.[room.id]?.isOpen ??
            true;

          if (isAvailable) {
            isFirst = !!previousRoomBooking || i === 0 || !isPreviousAvailable;
          } else {
            isFirst = !!previousRoomBooking || i === 0 || !!isPreviousAvailable;
          }

          bookings.push(
            <BookingCell
              key={`booking-${room.id}-${date}`}
              isFirst={isFirst}
              isAvailable={isAvailable}
            />
          );
        }
      }

      colSpan = 1;
    }

    return { bookings, prices };
  }, [
    datesArray,
    datesWithBookingsByRoom,
    datesWithAvailabilityByRoom,
    room.id,
    hotelId,
  ]);

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
