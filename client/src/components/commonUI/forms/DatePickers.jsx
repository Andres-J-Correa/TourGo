import React, { useState, useEffect } from "react";
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
    return typeof date === "string" ? dayjs(date).toDate() : date;
  };

  const [startDateState, setStartDateState] = useState(parseDate(startDate));
  const [endDateState, setEndDateState] = useState(parseDate(endDate));

  // Sync local state when props change
  useEffect(() => {
    setStartDateState(parseDate(startDate));
  }, [startDate]);

  useEffect(() => {
    setEndDateState(parseDate(endDate));
  }, [endDate]);

  const onStartDateChange = async (date) => {
    if (date) {
      const proceed = await handleStartChange(dayjs(date).format("YYYY-MM-DD"));
      if (!proceed) return; // If the parent component doesn't want to proceed, exit early
      setStartDateState(date);
      if (endDateState && dayjs(date).isAfter(dayjs(endDateState))) {
        const newEndDate = dayjs(date).add(1, "day").toDate();
        setEndDateState(newEndDate);
        handleEndChange(dayjs(newEndDate).format("YYYY-MM-DD"), true);
      }
    }
  };

  const onEndDateChange = async (date) => {
    if (date && startDateState && dayjs(date).isAfter(dayjs(startDateState))) {
      const proceed = await handleEndChange(dayjs(date).format("YYYY-MM-DD"));
      if (!proceed) return; // If the parent component doesn't want to proceed, exit early
      setEndDateState(date);
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
          selected={startDateState}
          onChange={onStartDateChange}
          dateFormat="yyyy-MM-dd"
          maxDate={parseDate(maxDate)}
          disabled={isDisabled}
          className="form-control"
          placeholderText={startDateName}
          popperClassName="custom-datepicker"
        />
      </div>

      <div>
        <label htmlFor="end-date" className="form-label w-100">
          {endDateName}
        </label>
        <DatePicker
          id="end-date"
          selected={endDateState}
          onChange={onEndDateChange}
          dateFormat="yyyy-MM-dd"
          minDate={startDateState}
          maxDate={parseDate(maxDate)}
          disabled={!startDateState || isDisabled}
          className="form-control"
          placeholderText={endDateName}
          popperClassName="custom-datepicker"
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
