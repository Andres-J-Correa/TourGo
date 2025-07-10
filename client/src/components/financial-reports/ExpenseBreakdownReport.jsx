import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Chart } from "react-google-charts";
import DatePickersV2 from "components/commonUI/forms/DatePickersV2";
import Alert from "components/commonUI/Alert";
import SimpleLoader from "components/commonUI/loaders/SimpleLoader";
import { getExpenseBreakdown } from "services/financialReportService";
import { TRANSACTION_CATEGORIES_BY_ID } from "components/transactions/constants";
import { toast } from "react-toastify";
import { useLanguage } from "contexts/LanguageContext";
import { getDateString } from "utils/dateHelper";

const getMonthRange = () => ({
  start: dayjs().startOf("month").format("YYYY-MM-DD"),
  end: dayjs().endOf("month").format("YYYY-MM-DD"),
});

function ExpenseBreakdownReport({ hotelId }) {
  const [dates, setDates] = useState(getMonthRange());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const { t } = useLanguage();

  const chartData = [
    [
      t("financialReports.expenseBreakdownReport.category"),
      t("financialReports.expenseBreakdownReport.expenses"),
    ],
    ...data.map((item) => [
      t(TRANSACTION_CATEGORIES_BY_ID[item.categoryId]) || item.category,
      item.totalExpenses,
    ]),
  ];

  const handleDateChange = (type) => (date) => {
    setDates((prev) => ({
      ...prev,
      [type]: getDateString(date),
    }));
  };

  useEffect(() => {
    if (dates.start && dates.end) {
      setLoading(true);
      setShowPrompt(false);
      getExpenseBreakdown(hotelId, dates.start, dates.end)
        .then((res) => {
          if (res?.isSuccessful && Array.isArray(res.items)) {
            setData(res.items);
          } else {
            setData([]);
          }
        })
        .catch((error) => {
          setData([]);
          if (error?.response?.status !== 404) {
            toast.error(t("financialReports.expenseBreakdownReport.loadError"));
          }
        })
        .finally(() => setLoading(false));
    } else {
      setData([]);
      setShowPrompt(true);
    }
  }, [dates.start, dates.end, hotelId, t]);

  return (
    <div>
      <h4>{t("financialReports.expenseBreakdownReport.title")}</h4>
      <p>{t("financialReports.expenseBreakdownReport.description")}</p>
      <div className="mb-3">
        <DatePickersV2
          startDate={dates.start}
          endDate={dates.end}
          handleStartChange={handleDateChange("start")}
          handleEndChange={handleDateChange("end")}
          disabled={loading}
          allowSameDay={true}
        />
      </div>
      <SimpleLoader isVisible={loading} />
      {showPrompt && (
        <Alert
          type="info"
          message={t(
            "financialReports.expenseBreakdownReport.selectDatesPrompt"
          )}
        />
      )}
      {!showPrompt && !loading && data.length === 0 && (
        <Alert
          type="info"
          message={t("financialReports.expenseBreakdownReport.noData")}
        />
      )}
      {!showPrompt && !loading && data.length > 0 && (
        <Chart
          chartType="PieChart"
          width="100%"
          height="350px"
          data={chartData}
          options={{
            title: t("financialReports.expenseBreakdownReport.chartTitle"),
            legend: { position: "right" },
            tooltip: { trigger: "focus", showColorCode: true },
            pieSliceText: "percentage",
            is3D: true,
          }}
        />
      )}
    </div>
  );
}

export default ExpenseBreakdownReport;
