import React from "react";
import { Label, Input } from "reactstrap";
import dayjs from "dayjs";
import { useLanguage } from "contexts/LanguageContext";

export const dateOptions = {
  yesterday: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
  today: dayjs().format("YYYY-MM-DD"),
  tomorrow: dayjs().add(1, "day").format("YYYY-MM-DD"),
};

interface DateFilterProps {
  date: string;
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DateFilter: React.FC<DateFilterProps> = ({ date, onDateChange }) => {
  const { t } = useLanguage();

  return (
    <div className="mb-4">
      <Label for="date-select" className="text-dark">
        {t("hotels.landing.date")}
      </Label>
      <Input
        id="date-select"
        type="select"
        value={date}
        onChange={onDateChange}
        className="w-auto">
        <option value={dateOptions.yesterday}>
          {t("hotels.landing.yesterday")}
        </option>
        <option value={dateOptions.today}>{t("hotels.landing.today")}</option>
        <option value={dateOptions.tomorrow}>
          {t("hotels.landing.tomorrow")}
        </option>
        <option value="more">{t("hotels.landing.moreDates")}</option>
      </Input>
    </div>
  );
};

export default DateFilter;
