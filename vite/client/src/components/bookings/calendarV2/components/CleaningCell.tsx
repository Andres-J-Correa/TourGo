//types
import type { JSX } from "react";
import type { RoomBooking } from "types/entities/booking.types";

//libs
import { useState } from "react";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBroom } from "@fortawesome/free-solid-svg-icons";
import { Spinner } from "reactstrap";

function CleaningCell({
  roomBooking,
  isCleaningMode,
  handleToggleShouldClean,
  showBookingName,
}: {
  roomBooking?: RoomBooking;
  isCleaningMode: boolean;
  handleToggleShouldClean: (roomBooking: RoomBooking) => Promise<void>;
  showBookingName?: boolean;
}): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onToggleShouldClean = async (
    e: React.MouseEvent<HTMLTableCellElement>
  ): Promise<void> => {
    e.preventDefault();
    if (isLoading || !roomBooking) return;
    setIsLoading(true);
    await handleToggleShouldClean(roomBooking);
    setIsLoading(false);
  };

  if (!roomBooking) {
    return (
      <td
        className={classNames("data-cell text-center align-content-center", {
          "d-none": !isCleaningMode,
        })}>
        -
      </td>
    );
  }

  return (
    <td
      onClick={onToggleShouldClean}
      className={classNames(
        "data-cell text-center align-content-center table-success cursor-pointer position-relative",
        {
          "d-none": !isCleaningMode,
          "cursor-not-allowed": isLoading,
        }
      )}>
      <span
        className={classNames("cleaning-cell-booking-name text-muted", {
          "d-none": !showBookingName,
        })}
        title={`${roomBooking?.firstName} ${roomBooking?.lastName}`}>
        {roomBooking?.firstName} {roomBooking?.lastName}
      </span>
      {isLoading ? (
        <Spinner size="sm" className="text-muted" />
      ) : (
        <FontAwesomeIcon
          icon={faBroom}
          className={`${
            roomBooking?.shouldClean ? "text-danger" : "text-muted"
          }`}
        />
      )}
    </td>
  );
}

export default CleaningCell;
