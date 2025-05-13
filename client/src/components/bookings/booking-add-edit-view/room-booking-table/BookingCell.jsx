import React from "react";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarPlus } from "@fortawesome/free-solid-svg-icons";

const BookingCell = ({
  date,
  room,
  booking,
  currentSelected,
  selected,
  onCellClick,
  disabled,
  isCalendarView,
}) => {
  const getContent = () => {
    if (booking) {
      return `$${booking.price.toFixed(2)}`;
    } else if (selected?.price) {
      return `$${selected.price.toFixed(2)}`;
    } else if (currentSelected?.roomId) {
      return "seleccionado";
    } else if (disabled) {
      return <span className="text-white fw-medium">Libre</span>;
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
        "bg-secondary text-white": booking || disabled,
        "cursor-not-allowed": (booking || disabled) && !isCalendarView,
        "cursor-pointer": !booking || (booking && isCalendarView),
        "bg-success-subtle text-success-emphasis": selected,
        "bg-success text-white": currentSelected,
      })}
      onClick={() => onCellClick(date, room, disabled)}>
      {getContent()}
    </td>
  );
};

export default BookingCell;
