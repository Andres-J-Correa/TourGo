import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Chart } from "react-google-charts";
import DatePickers from "components/commonUI/forms/DatePickers";
import Alert from "components/commonUI/Alert";
import { getUtilityCostAnalysis } from "services/financialReportService";
import SimpleLoader from "components/commonUI/loaders/SimpleLoader";
import { toast } from "react-toastify";
import { formatCurrency } from "utils/currencyHelper";
import { useLanguage } from "contexts/LanguageContext";

const getMonthRange = () => ({
  start: dayjs().startOf("month").format("YYYY-MM-DD"),
  end: dayjs().endOf("month").format("YYYY-MM-DD"),
});

function UtilityCostAnalysisReport({ hotelId }) {
  const [dates, setDates] = useState(getMonthRange());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const { t } = useLanguage();

  const chartData = [
    [
      t("financialReports.utilityCostAnalysisReport.subcategory"),
      t("financialReports.utilityCostAnalysisReport.total"),
      { role: "style" },
      { role: "annotation" },
    ],
    ...items.map((item) => [
      item.subcategory,
      item.total,
      "color: #2196f3; opacity: 0.7",
      formatCurrency(item.total, "COP"),
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
    setItems([]);
    setShowPrompt(true);
  };

  useEffect(() => {
    if (dates.start && dates.end) {
      setLoading(true);
      setShowPrompt(false);
      getUtilityCostAnalysis(hotelId, dates.start, dates.end)
        .then((res) => {
          if (res?.isSuccessful && Array.isArray(res.items)) {
            setItems(res.items);
          } else {
            setItems([]);
          }
        })
        .catch((error) => {
          setItems([]);
          if (error?.response?.status !== 404) {
            toast.error(
              t("financialReports.utilityCostAnalysisReport.loadError")
            );
          }
        })
        .finally(() => setLoading(false));
    } else {
      setItems([]);
      setShowPrompt(true);
    }
  }, [dates.start, dates.end, hotelId, t]);

  return (
    <div>
      <h4>{t("financialReports.utilityCostAnalysisReport.title")}</h4>
      <p>{t("financialReports.utilityCostAnalysisReport.description")}</p>
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
            "financialReports.utilityCostAnalysisReport.selectDatesPrompt"
          )}
        />
      )}
      {!showPrompt && !loading && (
        <Chart
          chartType="BarChart"
          width="100%"
          height="350px"
          data={chartData}
          options={{
            title: t("financialReports.utilityCostAnalysisReport.chartTitle"),
            legend: { position: "none" },
            vAxis: {
              title: t(
                "financialReports.utilityCostAnalysisReport.subcategory"
              ),
            },
            hAxis: {
              title: t(
                "financialReports.utilityCostAnalysisReport.totalWithCurrency"
              ),
            },
            annotations: {
              alwaysOutside: true,
              textStyle: { fontSize: 14, color: "#000", auraColor: "none" },
            },
          }}
        />
      )}
    </div>
  );
}

export default UtilityCostAnalysisReport;
