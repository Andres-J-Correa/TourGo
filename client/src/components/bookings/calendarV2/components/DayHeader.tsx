//types
import type { JSX } from "react";
import type { Dayjs } from "dayjs";

//libs
import { useMemo } from "react";
import dayjs from "dayjs";
import classNames from "classnames";

function DayHeader({ date }: { date: Dayjs }): JSX.Element {
  const isToday = useMemo((): boolean => date.isSame(dayjs(), "day"), [date]);

  return (
    <th
      className={classNames(
        "data-cell text-center align-content-center bg-light text-dark fw-bold",
        {
          "bg-warning-subtle": isToday,
        }
      )}>
      <div className="text-capitalize">{date.format("DD ddd")}</div>
    </th>
  );
}

export default DayHeader;
