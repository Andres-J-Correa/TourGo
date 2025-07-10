import React from "react";
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";
import dayjs from "dayjs";
import { getDateString } from "utils/dateHelper";
import { faRectangleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "react-datepicker/dist/react-datepicker.css";
import "./DatePickers.css"; // Custom styles for the date picker
import { useLanguage } from "contexts/LanguageContext"; // added

const DatePickers = ({
  startDate,
  endDate,
  startDateName,
  endDateName,
  handleStartChange = () => {},
  handleEndChange = () => {},
  handleClearDates,
  maxDate,
  isDisabled,
  allowSameDay = false,
}) => {
  const { t } = useLanguage(); // added
  // Use translation keys if not provided
  const startLabel = startDateName || t("commonUI.datePickers.startDate");
  const endLabel = endDateName || t("commonUI.datePickers.endDate");

  const endDateMinDate = allowSameDay
    ? startDate
    : startDate
    ? dayjs(startDate).add(1, "day").toDate()
    : null;

  const showClearButton = typeof handleClearDates === "function";

  const onStartDateChange = (date) => {
    const currentDate = dayjs(startDate);
    const newDate = dayjs(date);
    const isSameDate = currentDate.isSame(newDate, "day");

    if (isSameDate) return;

    if (date) {
      handleStartChange(getDateString(date));
    }
  };

  const onEndDateChange = (date) => {
    const currentDate = dayjs(endDate);
    const newDate = dayjs(date);
    const isSameDate = currentDate.isSame(newDate, "day");

    if (isSameDate) return;
    if (date) {
      handleEndChange(getDateString(date));
    }
  };

  const onClearDates = () => {
    // If the date pickers are disabled, do not clear the dates
    if (isDisabled) return;
    if (startDate || endDate) {
      handleClearDates();
    }
  };

  return (
    <div className="d-flex align-items-center mb-3">
      <div className="me-2">
        <label htmlFor="start-date" className="form-label w-100">
          {startLabel}
        </label>
        <DatePicker
          id="start-date"
          selected={startDate}
          onChange={onStartDateChange}
          dateFormat="dd-MM-yyyy"
          maxDate={getDateString(maxDate)}
          disabled={isDisabled}
          className="form-control"
          placeholderText={startLabel}
          popperClassName="custom-datepicker"
          autoComplete="off"
          showYearDropdown={true}
          showMonthDropdown={true}
          dropdownMode="select"
        />
      </div>

      <div className="me-2 position-relative">
        <label htmlFor="end-date" className="form-label w-100">
          {endLabel}
        </label>
        <DatePicker
          id="end-date"
          selected={endDate}
          onChange={onEndDateChange}
          dateFormat="dd-MM-yyyy"
          minDate={endDateMinDate}
          maxDate={getDateString(maxDate)}
          disabled={!startDate || isDisabled}
          className="form-control"
          placeholderText={endLabel}
          popperClassName="custom-datepicker"
          autoComplete="off"
          showYearDropdown={true}
          showMonthDropdown={true}
          dropdownMode="select"
        />
        {showClearButton && (
          <div className="position-absolute top-0 end-0">
            <FontAwesomeIcon
              size="sm"
              color="tomato"
              title={t("commonUI.datePickers.clear")}
              onClick={onClearDates}
              icon={faRectangleXmark}
              className={isDisabled ? "cursor-not-allowed" : "cursor-pointer"}
            />
          </div>
        )}
      </div>
    </div>
  );
};

DatePickers.propTypes = {
  startDate: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]),
  endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  handleStartChange: PropTypes.func,
  handleEndChange: PropTypes.func,
  maxDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  isDisabled: PropTypes.bool,
};

export default React.memo(DatePickers);
