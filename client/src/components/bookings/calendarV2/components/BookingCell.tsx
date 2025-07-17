//types
import type { RoomBooking } from "types/entities/booking.types";
import type { JSX } from "react";

function BookingCell({
  roomBooking,
  colSpan = 1,
}: {
  roomBooking?: Partial<RoomBooking>;
  colSpan?: number;
}): JSX.Element {
  if (!roomBooking) {
    return (
      <td
        className="data-cell text-center align-content-center"
        style={{ minWidth: 140, maxWidth: 140 }}
        colSpan={colSpan}>
        Disponible
      </td>
    );
  }

  return (
    <td
      className="data-cell align-content-center"
      style={{ minWidth: 140, maxWidth: 140 }}
      colSpan={colSpan}>
      <div className="bg-info text-white p-2 rounded text-center booking-data-cell">
        {roomBooking.firstName}
      </div>
    </td>
  );
}

export default BookingCell;
