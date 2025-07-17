//types
import type { Dayjs } from "dayjs";
import type { JSX } from "react";

//components
import DayHeader from "./DayHeader";
import MonthYearHeader from "./MonthYearHeader";

function DatesTable({ datesArray }: { datesArray: Dayjs[] }): JSX.Element {
  const daysComponents: JSX.Element[] = [];
  const monthAndYearComponents: JSX.Element[] = [];

  let colSpan: number = 1;

  for (let i = 0; i < datesArray.length; i++) {
    const date: Dayjs | undefined = datesArray[i];

    if (!date) continue;

    const dateString: string = date.format("YYYY-MM-DD");

    daysComponents.push(
      <DayHeader key={`day-${i}-${dateString}`} date={date} />
    );

    const nextDate: Dayjs | undefined = datesArray[i + 1];
    if (
      nextDate &&
      date.month() === nextDate.month() &&
      date.year() === nextDate.year()
    ) {
      colSpan++;
    } else {
      monthAndYearComponents.push(
        <MonthYearHeader
          key={`month-year-${i}-${dateString}`}
          date={date}
          colSpan={colSpan}
        />
      );
      colSpan = 1;
    }
  }

  return (
    <table className="table table-bordered dates-header table-sm mb-2">
      <thead>
        <tr>
          <th rowSpan={2} className="bg-dark first-column"></th>
          {monthAndYearComponents}
        </tr>
        <tr>{daysComponents}</tr>
      </thead>
    </table>
  );
}

export default DatesTable;
