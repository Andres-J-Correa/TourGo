import React, { useState } from "react";
import PropTypes from "prop-types";
import dayjs from "dayjs";

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
  const [startDateState, setStartDateState] = useState(startDate);
  const [endDateState, setEndDateState] = useState(endDate);

  const formatDate = (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "");

  const handleStartInputChange = (e) => {
    const newDate = dayjs(e.target.value);
    if (newDate.isValid()) {
      handleStartChange(newDate.format("YYYY-MM-DD"));
      setStartDateState(newDate.format("YYYY-MM-DD"));
      if (endDateState && newDate.isAfter(dayjs(endDateState))) {
        handleEndChange(newDate.add(1, "day").format("YYYY-MM-DD"));
        setEndDateState(newDate.add(1, "day").format("YYYY-MM-DD"));
      }
    }
  };

  const handleEndInputChange = (e) => {
    const newDate = dayjs(e.target.value);
    if (newDate.isValid() && dayjs(startDateState).isBefore(newDate, "day")) {
      handleEndChange(newDate.format("YYYY-MM-DD"));
      setEndDateState(newDate.format("YYYY-MM-DD"));
    }
  };

  return (
    <div className="d-flex align-items-center gap-3 mb-3">
      <div className="form-floating">
        <input
          id="start-date"
          type="date"
          className="form-control"
          value={formatDate(startDateState)}
          onChange={handleStartInputChange}
          max={maxDate ? formatDate(maxDate) : ""}
          disabled={isDisabled}
        />
        <label htmlFor="start-date" className="form-label text-body-secondary">
          {startDateName}
        </label>
      </div>

      <div className="form-floating">
        <input
          id="end-date"
          type="date"
          className="form-control"
          value={formatDate(endDateState)}
          onChange={handleEndInputChange}
          min={startDateState ? formatDate(startDateState) : ""}
          max={maxDate ? formatDate(maxDate) : ""}
          disabled={!startDateState || isDisabled}
        />
        <label htmlFor="end-date" className="form-label text-body-secondary">
          {endDateName}
        </label>
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
};

export default React.memo(DatePickers);
