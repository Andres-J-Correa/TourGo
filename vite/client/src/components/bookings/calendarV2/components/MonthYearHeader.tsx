//types
import type { JSX } from "react";
import type { Dayjs } from "dayjs";

function MonthYearHeader({
  date,
  colSpan,
}: {
  date: Dayjs;
  colSpan: number;
}): JSX.Element {
  return (
    <th
      className="data-cell text-start align-content-center bg-light text-dark fw-bold"
      colSpan={colSpan}>
      <div>
        <span className="date-header-text text-capitalize">
          {date.format("MMM YYYY")}
        </span>
      </div>
    </th>
  );
}

export default MonthYearHeader;
