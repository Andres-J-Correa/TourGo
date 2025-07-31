//types
import type { RoomBooking } from "types/entities/booking.types";
import type { JSX } from "react";

//libs
import { useCallback, useState } from "react";
import { Spinner } from "reactstrap";
import classNames from "classnames";

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
  isFirst = false,
  isAvailable = true,
  onClick,
  isHidden = false,
}: {
  roomBooking?: RoomBooking;
  colSpan?: number;
  hotelId?: string;
  isFirst?: boolean;
  isAvailable?: boolean;
  onClick?: () => Promise<void>;
  isHidden?: boolean;
}): JSX.Element {
  const [showBookingOffCanvas, setShowBookingOffCanvas] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const handleClick = useCallback(
    async (e: React.MouseEvent): Promise<void> => {
      e.stopPropagation();

      if (onClick && !isLoading) {
        setIsLoading(true);
        await onClick();
        setIsLoading(false);
      }
    },
    [onClick, isLoading]
  );

  if (!roomBooking) {
    return (
      <td
        onClick={handleClick}
        className={classNames("data-cell text-muted cursor-pointer", {
          "table-success": isAvailable,
          "table-danger": !isAvailable,
          "border-end-0": isFirst,
          "border-start-0 border-end-0": !isFirst,
          "ps-3 text-start": !isLoading,
          "d-none": isHidden,
          "cursor-not-allowed": isLoading,
        })}
        colSpan={colSpan}>
        {isLoading ? (
          <Spinner
            className="data-cell-spinner d-flex mx-auto my-auto text-muted"
            size="sm"
          />
        ) : isFirst ? (
          isAvailable ? (
            t("booking.calendar.available")
          ) : (
            t("booking.calendar.closed")
          )
        ) : (
          ""
        )}
      </td>
    );
  }

  return (
    <td
      className={classNames("data-cell align-content-center table-danger", {
        "d-none": isHidden,
      })}
      colSpan={colSpan}>
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
          className="btn btn-success w-100 py-1 px-2 fw-bold rounded text-center booking-data-cell d-none d-md-block btn-sm">
          {roomBooking.firstName} {roomBooking.lastName}
        </button>
      </Popover>
      <button
        onClick={handleBookingClick}
        className="btn btn-success w-100 py-1 px-2 fw-bold rounded text-center booking-data-cell d-md-none btn-sm">
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
