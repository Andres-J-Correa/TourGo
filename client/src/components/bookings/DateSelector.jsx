import React from "react";
import dayjs from "dayjs";
import DatePickers from "components/commonUI/forms/DatePickers";
import Alert from "components/commonUI/Alert";

function DateSelector({ dates, onDateChange, isDisabled }) {
  const isPastDate =
    dates.start && dayjs(dates.start).isBefore(dayjs().subtract(1, "day"));

  return (
    <>
      <h5 className="mb-3">Seleccione las Fechas de la reserva</h5>
      {isPastDate && (
        <Alert
          type="warning"
          message="Estas seleccionando fechas pasadas, por favor verifica."
        />
      )}

      <DatePickers
        startDate={dates.start}
        endDate={dates.end}
        startDateName="Fecha de llegada"
        endDateName="Fecha de salida"
        handleStartChange={onDateChange("start")}
        handleEndChange={onDateChange("end")}
        isDisabled={isDisabled}
      />
    </>
  );
}

export default DateSelector;
