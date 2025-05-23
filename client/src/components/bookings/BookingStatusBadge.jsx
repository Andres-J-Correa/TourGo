import React from "react";
import {
  bookingStatuses,
  BOOKING_STATUS_DICTIONARY,
} from "components/bookings/constants";
import classNames from "classnames";

function BookingStatusBadge({ statusId, className, ...props }) {
  return (
    <span
      {...props}
      className={classNames("badge", className, {
        "bg-success": statusId === BOOKING_STATUS_DICTIONARY.ACTIVE,
        "bg-danger": statusId === BOOKING_STATUS_DICTIONARY.CANCELLED,
        "bg-primary": statusId === BOOKING_STATUS_DICTIONARY.COMPLETED,
        "bg-warning": statusId === BOOKING_STATUS_DICTIONARY.NO_SHOW,
        "bg-info": statusId === BOOKING_STATUS_DICTIONARY.ARRIVED,
      })}>
      {bookingStatuses[statusId]}
    </span>
  );
}

export default BookingStatusBadge;
