//types
import type { RoomBooking } from "types/entities/booking.types";
import type { JSX } from "react";

//libs
import { useCallback, useState } from "react";

//components
import BookingMinimalCard from "components/bookings/BookingMinimalCard";
import Popover from "components/commonUI/popover/Popover";
import BookingViewOffCanvas from "components/bookings/BookingViewOffCanvas";

//services & utils
import { useLanguage } from "contexts/LanguageContext";

function BookingCell({
  roomBooking,
  colSpan = 1,
  hotelId,
}: {
  roomBooking?: RoomBooking;
  colSpan?: number;
  hotelId?: string;
}): JSX.Element {
  const [showBookingOffCanvas, setShowBookingOffCanvas] =
    useState<boolean>(false);

  const { t } = useLanguage();

  const toggleBookingOffCanvas = (): void => {
    setShowBookingOffCanvas((prev) => !prev);
  };

  const handleBookingClick = useCallback(
    (e: React.MouseEvent): void => {
      e.stopPropagation();
      if (roomBooking) {
        toggleBookingOffCanvas();
      }
    },
    [roomBooking]
  );

  if (!roomBooking) {
    return (
      <td
        className="data-cell text-center align-content-center"
        colSpan={colSpan}>
        {t("booking.calendar.available")}
      </td>
    );
  }

  return (
    <td className="data-cell align-content-center" colSpan={colSpan}>
      <Popover
        action="hover"
        content={
          <BookingMinimalCard
            bookingId={roomBooking.bookingId}
            hotelId={hotelId}
          />
        }>
        <button
          onClick={handleBookingClick}
          className="btn btn-success w-100 py-1 px-2 fw-bold rounded text-center booking-data-cell d-none d-md-block">
          {roomBooking.firstName} {roomBooking.lastName}
        </button>
      </Popover>
      <button
        onClick={handleBookingClick}
        className="btn btn-success w-100 py-1 px-2 fw-bold rounded text-center booking-data-cell d-md-none">
        {roomBooking.firstName} {roomBooking.lastName}
      </button>
      <BookingViewOffCanvas
        offCanvasOpen={showBookingOffCanvas}
        handleToggleOffcanvas={toggleBookingOffCanvas}
        bookingId={roomBooking.bookingId}
        hotelId={hotelId}
      />
    </td>
  );
}

export default BookingCell;
