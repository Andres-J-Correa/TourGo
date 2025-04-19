import React from "react";
import PropTypes from "prop-types";
import dayjs from "dayjs";

const _logger = require("debug")("DatePickers");

const DatePickers = ({
  startDate,
  endDate,
  handleStartChange = (date) => _logger("handleStartChange", date),
  handleEndChange = (date) => _logger("handleEndChange", date),
  maxDate,
}) => {
  const formatDate = (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "");

  const handleStartInputChange = (e) => {
    const newDate = dayjs(e.target.value);
    if (newDate.isValid()) {
      handleStartChange(newDate.toDate());
      if (endDate && newDate.isAfter(dayjs(endDate))) {
        handleEndChange(null);
      }
    }
  };

  const handleEndInputChange = (e) => {
    const newDate = dayjs(e.target.value);
    if (newDate.isValid() && dayjs(startDate).isBefore(newDate, "day")) {
      handleEndChange(newDate.toDate());
    }
  };

  return (
    <div className="d-flex align-items-center gap-3">
      <div>
        <label htmlFor="start-date" className="form-label mb-1">
          Start Date
        </label>
        <input
          id="start-date"
          type="date"
          className="form-control"
          value={formatDate(startDate)}
          onChange={handleStartInputChange}
          max={maxDate ? formatDate(maxDate) : ""}
        />
      </div>

      <div>
        <label htmlFor="end-date" className="form-label mb-1">
          End Date
        </label>
        <input
          id="end-date"
          type="date"
          className="form-control"
          value={formatDate(endDate)}
          onChange={handleEndInputChange}
          min={startDate ? formatDate(startDate) : ""}
          max={maxDate ? formatDate(maxDate) : ""}
          disabled={!startDate}
        />
      </div>
    </div>
  );
};

DatePickers.propTypes = {
  startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
    .isRequired,
  endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  handleStartChange: PropTypes.func.isRequired,
  handleEndChange: PropTypes.func,
  maxDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
};

export default React.memo(DatePickers);
