import React from "react";
import {
  BOOKING_STATUS_BY_ID,
  BOOKING_STATUS_IDS,
} from "components/bookings/constants";
import classNames from "classnames";
import { useLanguage } from "contexts/LanguageContext";

function BookingStatusBadge({ statusId, className = "", ...props }) {
  const { t } = useLanguage();

  return (
    <span
      {...props}
      className={classNames("badge text-capitalize", className, {
        "bg-success": statusId === BOOKING_STATUS_IDS.ACTIVE,
        "bg-danger": statusId === BOOKING_STATUS_IDS.CANCELLED,
        "bg-primary": statusId === BOOKING_STATUS_IDS.COMPLETED,
        "bg-warning": statusId === BOOKING_STATUS_IDS.NO_SHOW,
        "bg-info": statusId === BOOKING_STATUS_IDS.ARRIVED,
      })}>
      {t(BOOKING_STATUS_BY_ID[statusId])}
    </span>
  );
}

export default BookingStatusBadge;
