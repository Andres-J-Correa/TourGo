import React from "react";
import dayjs from "dayjs";
import classNames from "classnames";
import BookingCell from "./BookingCell";

const BookingRow = ({
  date,
  rooms,
  getBooking,
  currentSelection = [],
  selectedRoomBookings = [],
  onCellClick,
  disabled,
}) => (
  <tr key={date}>
    <td
      className={classNames("date-row-label", {
        "bg-secondary text-white": disabled,
        "text-bg-light": !disabled,
      })}>
      {dayjs(date).format("ddd DD - MMM - YYYY")}
    </td>
    {rooms.map((room) => {
      const booking = getBooking(date, room.id);
      const currentSelected = currentSelection.find(
        (c) => c.date === date && c.roomId === room.id
      );
      const selected = selectedRoomBookings.find(
        (c) =>
          c.date === date && (c.roomId === room.id || c.room?.id === room.id)
      );

      return (
        <BookingCell
          key={room.id}
          date={date}
          room={room}
          booking={booking}
          currentSelected={currentSelected}
          selected={selected}
          onCellClick={onCellClick}
          disabled={disabled}
        />
      );
    })}
  </tr>
);

export default BookingRow;
