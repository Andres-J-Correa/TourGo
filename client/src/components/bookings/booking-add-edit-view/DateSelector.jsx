import React from "react";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import DatePickers from "components/commonUI/forms/DatePickers";
import Alert from "components/commonUI/Alert";
import Swal from "sweetalert2";
import { useLanguage } from "contexts/LanguageContext";

dayjs.extend(isSameOrAfter);

function DateSelector({
  dates,
  onDateChange,
  isDisabled,
  selectedRoomBookings,
  setSelectedRoomBookings,
}) {
  const { t } = useLanguage();

  const isPastDate =
    dates.start && dayjs(dates.start).isBefore(dayjs().subtract(1, "day"));

  const confirmChange = async () => {
    const result = await Swal.fire({
      title: t("booking.dateSelector.confirmChangeTitle"),
      text: t("booking.dateSelector.confirmChangeText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("booking.dateSelector.confirmChangeYes"),
      cancelButtonText: t("common.cancel"),
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
          return dayjs(booking.date).isBefore(dayjs(value), "day");
        });
        return newState;
      });
    }
    onDateChange("end")(value);
  };

  return (
    <>
      <h5 className="mb-3">{t("booking.dateSelector.title")}</h5>
      {isPastDate && (
        <Alert
          type="warning"
          message={t("booking.dateSelector.pastDateWarning")}
        />
      )}
      <DatePickers
        startDate={dates.start}
        endDate={dates.end}
        startDateName={t("booking.dateSelector.startDate")}
        endDateName={t("booking.dateSelector.endDate")}
        handleStartChange={handleStartChange}
        handleEndChange={handleEndChange}
        isDisabled={isDisabled}
      />
    </>
  );
}

export default DateSelector;
