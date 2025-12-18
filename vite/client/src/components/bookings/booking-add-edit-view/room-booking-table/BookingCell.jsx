import React from "react";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarPlus } from "@fortawesome/free-solid-svg-icons";
import { formatCurrency } from "utils/currencyHelper";
import Popover from "components/commonUI/popover/Popover";
import BookingMinimalCard from "components/bookings/BookingMinimalCard";
import { useParams } from "react-router-dom";
import { useLanguage } from "contexts/LanguageContext";

const BookingCell = ({
  date,
  room,
  booking,
  currentSelected,
  selected,
  onCellClick,
  disabled,
  isOpen,
}) => {
  const { hotelId } = useParams();
  const { t } = useLanguage();

  const getContent = () => {
    if (booking) {
      return (
        <Popover
          content={
            <BookingMinimalCard
              bookingId={booking.bookingId}
              hotelId={hotelId}
            />
          }>
          <span className={`text-center cursor-pointer`}>
            {`${formatCurrency(booking.price, "COP")}`}
          </span>
        </Popover>
      );
    } else if (selected?.price) {
      return `${formatCurrency(selected.price, "COP")}`;
    } else if (currentSelected?.roomId) {
      return t("booking.table.selected");
    } else if (!isOpen) {
      return <span>{t("booking.calendar.closed")}</span>;
    } else if (disabled) {
      return (
        <span className="text-white fw-medium">{t("booking.table.free")}</span>
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
        "booked-cell": booking,
        "bg-secondary text-white": booking || disabled || !isOpen,
        "cursor-not-allowed": !isOpen || (disabled && !booking),
        "cursor-pointer": !booking && isOpen,
        "bg-success-subtle text-success-emphasis": selected,
        "bg-success text-white": currentSelected,
      })}
      onClick={() => onCellClick(date, room, disabled)}>
      {getContent()}
    </td>
  );
};

export default BookingCell;
