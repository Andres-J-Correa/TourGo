import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Chart } from "react-google-charts";
import DatePickers from "components/commonUI/forms/DatePickers";
import Alert from "components/commonUI/Alert";
import SimpleLoader from "components/commonUI/loaders/SimpleLoader";
import { getRevenueBreakdown } from "services/financialReportService";
import { TRANSACTION_CATEGORIES_BY_ID } from "components/transactions/constants";
import { toast } from "react-toastify";
import { useLanguage } from "contexts/LanguageContext";

const getMonthRange = () => ({
  start: dayjs().startOf("month").format("YYYY-MM-DD"),
  end: dayjs().endOf("month").format("YYYY-MM-DD"),
});

function RevenueBreakdownReport({ hotelId }) {
  const [dates, setDates] = useState(getMonthRange());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const { t } = useLanguage();

  const chartData = [
    [
      t("financialReports.revenueBreakdownReport.category"),
      t("financialReports.revenueBreakdownReport.revenue"),
    ],
    ...data.map((item) => [
      t(TRANSACTION_CATEGORIES_BY_ID[item.categoryId]) || item.category,
      item.totalRevenue,
    ]),
  ];

  const handleDateChange = (type) => (date) => {
    setDates((prev) => ({
      ...prev,
      [type]: date ? dayjs(date).format("YYYY-MM-DD") : "",
    }));
  };

  const handleClearDateFilter = () => {
    setDates({ start: "", end: "" });
    setData([]);
    setShowPrompt(true);
  };

  useEffect(() => {
    if (dates.start && dates.end) {
      setLoading(true);
      setShowPrompt(false);
      getRevenueBreakdown(hotelId, dates.start, dates.end)
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
            toast.error(t("financialReports.revenueBreakdownReport.loadError"));
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
      <h4>{t("financialReports.revenueBreakdownReport.title")}</h4>
      <p>{t("financialReports.revenueBreakdownReport.description")}</p>
      <div className="mb-3">
        <DatePickers
          startDate={dates.start}
          endDate={dates.end}
          handleStartChange={handleDateChange("start")}
          handleEndChange={handleDateChange("end")}
          isDisabled={loading}
          allowSameDay={true}
          handleClearDates={handleClearDateFilter}
        />
      </div>
      <SimpleLoader isVisible={loading} />
      {showPrompt && (
        <Alert
          type="info"
          message={t(
            "financialReports.revenueBreakdownReport.selectDatesPrompt"
          )}
        />
      )}
      {!showPrompt && !loading && data.length === 0 && (
        <Alert
          type="info"
          message={t("financialReports.revenueBreakdownReport.noData")}
        />
      )}
      {!showPrompt && !loading && data.length > 0 && (
        <Chart
          chartType="PieChart"
          width="100%"
          height="350px"
          data={chartData}
          options={{
            title: t("financialReports.revenueBreakdownReport.chartTitle"),
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

export default RevenueBreakdownReport;
