//types
import type { JSX } from "react";

//libs
import DatePicker from "react-datepicker";
import dayjs from "dayjs";
import { Row, Col } from "reactstrap";

//services & utils
import { getDate } from "utils/dateHelper";
import { useLanguage } from "contexts/LanguageContext";
import { useIsMobile } from "hooks/useIsMobile";

import "react-datepicker/dist/react-datepicker.css";
import "./DatePickers.css";

interface DatePickersV2Props {
  startDate: string | Date | null;
  endDate: string | Date | null;
  handleStartChange: (date: Date | null) => void;
  handleEndChange: (date: Date | null) => void;
  maxDate?: string | Date;
  disabled?: boolean;
  startDateLabel?: string;
  endDateLabel?: string;
  allowSameDay?: boolean;
  minDate?: string | Date;
}

function DatePickersV2({
  startDate,
  endDate,
  handleStartChange,
  handleEndChange,
  maxDate,
  disabled,
  startDateLabel,
  endDateLabel,
  allowSameDay = false,
  minDate,
}: DatePickersV2Props): JSX.Element {
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  const startLabel: string =
    startDateLabel || t("commonUI.datePickers.startDate");
  const endLabel: string = endDateLabel || t("commonUI.datePickers.endDate");

  const dateStart: Date | null = getDate(startDate);
  const dateEnd: Date | null = getDate(endDate);
  const dateMax: Date | null = getDate(maxDate);
  const dateMin: Date | null = getDate(minDate);
  const endDateMinDate: Date | null = allowSameDay
    ? dateStart
    : dateStart
    ? dayjs(dateStart).add(1, "day").toDate()
    : null;
  return (
    <div className="d-flex align-items-center mb-3">
      <Row>
        <Col>
          <label htmlFor="start-date" className="form-label w-100 text-dark">
            {startLabel}
          </label>
          <DatePicker
            id="start-date"
            selected={dateStart}
            className="form-control"
            onChange={handleStartChange}
            placeholderText="DD/MM/YYYY"
            selectsStart
            startDate={dateStart}
            dateFormat="dd/MM/yyyy"
            endDate={dateEnd}
            maxDate={dateMax || undefined}
            disabled={disabled}
            popperClassName="custom-datepicker"
            autoComplete="off"
            showYearDropdown
            yearDropdownItemNumber={100}
            scrollableYearDropdown
            showMonthDropdown
            isClearable={dateStart !== null && !disabled}
            minDate={dateMin || undefined}
            withPortal={isMobile}
          />
        </Col>
        <Col>
          <label htmlFor="end-date" className="form-label w-100 text-dark">
            {endLabel}
          </label>
          <DatePicker
            id="end-date"
            selected={dateEnd}
            className="form-control"
            onChange={handleEndChange}
            placeholderText="DD/MM/YYYY"
            selectsEnd
            startDate={dateStart}
            dateFormat="dd/MM/yyyy"
            endDate={dateEnd}
            minDate={endDateMinDate || undefined}
            maxDate={dateMax || undefined}
            disabled={disabled}
            popperClassName="custom-datepicker"
            autoComplete="off"
            showYearDropdown
            yearDropdownItemNumber={100}
            scrollableYearDropdown
            showMonthDropdown
            isClearable={dateEnd !== null && !disabled}
            withPortal={isMobile}
          />
        </Col>
      </Row>
    </div>
  );
}

export default DatePickersV2;
