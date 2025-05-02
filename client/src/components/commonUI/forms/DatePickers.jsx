import React from "react";
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";
import dayjs from "dayjs";
import "react-datepicker/dist/react-datepicker.css";
import "./DatePickers.css"; // Custom styles for the date picker

const DatePickers = ({
  startDate,
  endDate,
  startDateName = "Fecha de inicio",
  endDateName = "Fecha fin",
  handleStartChange = () => {},
  handleEndChange = () => {},
  maxDate,
  isDisabled,
}) => {
  const parseDate = (date) => {
    if (!date) return null;
    if (!dayjs(date).isValid()) return null;

    const day = dayjs(date).get("date");
    const month = dayjs(date).get("month") + 1;
    const year = dayjs(date).get("year");
    const formattedDate = `${year}-${month < 10 ? "0" + month : month}-${
      day < 10 ? "0" + day : day
    }`;
    return formattedDate;
  };

  const onStartDateChange = (date) => {
    if (date) {
      handleStartChange(parseDate(date));
    }
  };

  const onEndDateChange = (date) => {
    if (date) {
      handleEndChange(parseDate(date));
    }
  };

  return (
    <div className="d-flex align-items-center gap-3 mb-3">
      <div>
        <label htmlFor="start-date" className="form-label w-100">
          {startDateName}
        </label>
        <DatePicker
          id="start-date"
          selected={startDate}
          onChange={onStartDateChange}
          dateFormat="yyyy-MM-dd"
          maxDate={parseDate(maxDate)}
          disabled={isDisabled}
          className="form-control"
          placeholderText={startDateName}
          popperClassName="custom-datepicker"
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="end-date" className="form-label w-100">
          {endDateName}
        </label>
        <DatePicker
          id="end-date"
          selected={endDate}
          onChange={onEndDateChange}
          dateFormat="yyyy-MM-dd"
          minDate={startDate ? dayjs(startDate).add(1, "day").toDate() : null}
          maxDate={parseDate(maxDate)}
          disabled={!startDate || isDisabled}
          className="form-control"
          placeholderText={endDateName}
          popperClassName="custom-datepicker"
          autoComplete="off"
        />
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
