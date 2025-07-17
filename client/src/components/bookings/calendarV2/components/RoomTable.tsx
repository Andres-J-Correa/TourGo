//types
import type { RoomBooking } from "types/entities/booking.types";
import type { Room } from "types/entities/room.types";
import type { Dayjs } from "dayjs";
import type { JSX } from "react";

//libs
import { Fragment } from "react";

//components
import PriceCell from "./PriceCell";
import BookingCell from "./BookingCell";

//services & utils
import { useLanguage } from "contexts/LanguageContext";

function RoomTable({
  room,
  datesArray,
  datesWithBookingsByRoom,
  hotelId,
}: {
  room: Room;
  datesArray: Dayjs[];
  datesWithBookingsByRoom: Record<string, Record<string, RoomBooking>>;
  hotelId?: string;
}): JSX.Element {
  const { t } = useLanguage();

  const bookings: JSX.Element[] = [];
  const prices: JSX.Element[] = [];

  if (!room.id) return <Fragment />;

  let colSpan: number = 1;
  for (let i = 0; i < datesArray.length; i++) {
    const date: string | undefined = datesArray[i]?.format("YYYY-MM-DD");

    const roomBooking: RoomBooking | undefined = date
      ? datesWithBookingsByRoom[date]?.[room.id]
      : undefined;

    prices.push(
      <PriceCell key={`price-${room.id}-${date}`} price={roomBooking?.price} />
    );

    const nextDate: string | undefined =
      datesArray[i + 1]?.format("YYYY-MM-DD");

    const nextRoomBooking: Partial<RoomBooking> | undefined = nextDate
      ? datesWithBookingsByRoom[nextDate]?.[room.id]
      : undefined;

    if (roomBooking) {
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
    } else {
      if (!nextRoomBooking?.bookingId && i + 1 < datesArray.length) {
        colSpan++;
        continue;
      }

      bookings.push(
        <BookingCell key={`booking-${room.id}-${date}`} colSpan={colSpan} />
      );
    }

    colSpan = 1;
  }

  return (
    <Fragment>
      <h6 className="room-header mb-1">{room.name}</h6>
      <table className="table table-bordered table-sm mb-2">
        <tbody>
          <tr>
            <td className="first-column text-center align-content-center bg-light text-dark fw-bold">
              {t("booking.calendar.reservation")}
            </td>
            {bookings}
          </tr>
          <tr>
            <td className="first-column text-center align-content-center bg-light text-dark fw-bold">
              {t("booking.calendar.price")}
            </td>
            {prices}
          </tr>
        </tbody>
      </table>
    </Fragment>
  );
}

export default RoomTable;
