//types
import type { JSX } from "react";
import type { Dayjs } from "dayjs";

function DayHeader({ date }: { date: Dayjs }): JSX.Element {
  return (
    <th className="data-cell text-center align-content-center bg-light text-dark fw-bold">
      <div className="text-capitalize">{date.format("DD ddd")}</div>
    </th>
  );
}

export default DayHeader;
