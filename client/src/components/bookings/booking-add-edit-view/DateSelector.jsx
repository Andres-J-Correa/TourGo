import React from "react";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import DatePickers from "components/commonUI/forms/DatePickers";
import Alert from "components/commonUI/Alert";
import Swal from "sweetalert2";

dayjs.extend(isSameOrAfter);

function DateSelector({
  dates,
  onDateChange,
  isDisabled,
  selectedRoomBookings,
  setSelectedRoomBookings,
}) {
  const isPastDate =
    dates.start && dayjs(dates.start).isBefore(dayjs().subtract(1, "day"));

  const confirmChange = async () => {
    const result = await Swal.fire({
      title: "Cambiar las fechas podría eliminar las celdas seleccionadas.",
      text: "¿Está seguro de que desea continuar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cambiar",
      cancelButtonText: "Cancelar",
    });
    return result.isConfirmed;
  };

  const handleStartChange = async (value) => {
    if (selectedRoomBookings.length > 0) {
      const confirmed = await confirmChange();
      if (!confirmed) return;
      setSelectedRoomBookings((prev) => {
        const newState = prev.filter((booking) => {
          return dayjs(booking.date).isSameOrAfter(dayjs(value), "day");
        });
        return newState;
      });
    }
    onDateChange("start")(value);
  };

  const handleEndChange = async (value) => {
    if (selectedRoomBookings.length > 0) {
      const confirmed = await confirmChange();
      if (!confirmed) return;
      setSelectedRoomBookings((prev) => {
        const newState = prev.filter((booking) => {
          const bookignDate = dayjs(booking.date);
          const newEndDate = dayjs(value);
          const isSameOrBefore = bookignDate.isBefore(newEndDate, "day");
          return isSameOrBefore;
        });
        return newState;
      });
    }
    onDateChange("end")(value);
  };

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
        handleStartChange={handleStartChange}
        handleEndChange={handleEndChange}
        isDisabled={isDisabled}
      />
    </>
  );
}

export default DateSelector;
