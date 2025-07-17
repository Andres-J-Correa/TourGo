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

function RoomTable({
  room,
  datesArray,
  datesWithBookingsByRoom,
}: {
  room: Partial<Room>;
  datesArray: Dayjs[];
  datesWithBookingsByRoom: Record<string, Record<string, Partial<RoomBooking>>>;
}): JSX.Element {
  const bookings: JSX.Element[] = [];
  const prices: JSX.Element[] = [];

  if (!room.id) return <Fragment />;

  let colSpan: number = 1;
  for (let i = 0; i < datesArray.length; i++) {
    const date: string | undefined = datesArray[i]?.format("YYYY-MM-DD");

    const roomBooking: Partial<RoomBooking> | undefined = date
      ? datesWithBookingsByRoom[date]?.[room.id]
      : undefined;

    prices.push(
      <PriceCell key={`price-${room.id}-${date}`} price={roomBooking?.price} />
    );

    if (roomBooking) {
      const nextDate: string | undefined =
        datesArray[i + 1]?.format("YYYY-MM-DD");

      const nextRoomBooking: Partial<RoomBooking> | undefined = nextDate
        ? datesWithBookingsByRoom[nextDate]?.[room.id]
        : undefined;

      if (nextRoomBooking?.bookingId === roomBooking.bookingId) {
        colSpan++;
        continue;
      }

      bookings.push(
        <BookingCell
          key={`booking-${room.id}-${date}`}
          roomBooking={roomBooking}
          colSpan={colSpan}
        />
      );
    } else {
      bookings.push(
        <BookingCell key={`booking-${room.id}-${date}`} colSpan={colSpan} />
      );
    }

    colSpan = 1;
  }

  return (
    <Fragment>
      <h6 style={{ position: "sticky", left: 0 }}>{room.name}</h6>
      <table className="table table-bordered">
        <tbody>
          <tr>
            <td
              className="text-center align-content-center bg-dark text-white fw-bold"
              style={{ minWidth: 80, maxWidth: 80 }}>
              Reserva
            </td>
            {bookings}
          </tr>
          <tr>
            <td
              className="text-center align-content-center bg-dark text-white fw-bold"
              style={{ minWidth: 80, maxWidth: 80 }}>
              Precio
            </td>
            {prices}
          </tr>
        </tbody>
      </table>
    </Fragment>
  );
}

export default RoomTable;
