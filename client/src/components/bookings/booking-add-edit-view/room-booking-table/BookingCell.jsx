import React from "react";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarPlus, faBan } from "@fortawesome/free-solid-svg-icons";

const BookingCell = ({
  date,
  room,
  booking,
  currentSelected,
  selected,
  onCellClick,
  disabled,
}) => {
  const getContent = () => {
    if (booking) {
      return `$${booking.price.toFixed(2)}`;
    } else if (selected?.price) {
      return `$${selected.price.toFixed(2)}`;
    } else if (currentSelected?.roomId) {
      return "seleccionado";
    } else if (disabled) {
      return (
        <span className="text-white">
          <FontAwesomeIcon icon={faBan} />
        </span>
      );
    } else {
      return (
        <span className="booking-table-cell-text text-secondary">
          <FontAwesomeIcon icon={faCalendarPlus} />
        </span>
      );
    }
  };

  return (
    <td
      key={room.id}
      className={classNames("text-center booking-table-cell-container", {
        "bg-secondary text-white cursor-not-allowed": booking || disabled,
        "cursor-pointer": !booking,
        "bg-success-subtle text-success-emphasis": selected,
        "bg-success text-white": currentSelected,
      })}
      onClick={() => onCellClick(date, room, disabled)}>
      {getContent()}
    </td>
  );
};

export default BookingCell;
