import React from "react";
import dayjs from "dayjs";
import DatePickers from "components/commonUI/forms/DatePickers";
import Alert from "components/commonUI/Alert";
import Swal from "sweetalert2";

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
      title: "Cambiar las fechas eliminará las celdas seleccionadas.",
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
      setSelectedRoomBookings([]);
    }
    onDateChange("start")(value);
  };

  const handleEndChange = async (value) => {
    if (selectedRoomBookings.length > 0) {
      const confirmed = await confirmChange();
      if (!confirmed) return;
      setSelectedRoomBookings([]);
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
