import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Chart } from "react-google-charts";
import DatePickersV2 from "components/commonUI/forms/DatePickersV2";
import Alert from "components/commonUI/Alert";
import { getProfitAndLossSummary } from "services/financialReportService";
import SimpleLoader from "components/commonUI/loaders/SimpleLoader";
import { toast } from "react-toastify";
import { formatCurrency } from "utils/currencyHelper";
import { useLanguage } from "contexts/LanguageContext";
import { getDateString } from "utils/dateHelper";

const getMonthRange = () => ({
  start: dayjs().startOf("month").format("YYYY-MM-DD"),
  end: dayjs().endOf("month").format("YYYY-MM-DD"),
});

function ProfitAndLossReport({ hotelId }) {
  const [dates, setDates] = useState(getMonthRange());
  const [totals, setTotals] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
  });
  const [loading, setLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const { t } = useLanguage();

  const chartData = [
    [
      t("financialReports.profitAndLossReport.type"),
      t("financialReports.profitAndLossReport.total"),
      { role: "style" },
      { role: "annotation" },
    ],
    [
      t("financialReports.profitAndLossReport.revenue"),
      totals.totalRevenue,
      `color: #4caf50; opacity:0.5`,
      formatCurrency(totals.totalRevenue, "COP"),
    ],
    [
      t("financialReports.profitAndLossReport.expenses"),
      totals.totalExpenses,
      `color: #f44335; opacity:0.5`,
      formatCurrency(totals.totalExpenses, "COP"),
    ],
    [
      t("financialReports.profitAndLossReport.netProfit"),
      totals.netProfit,
      `opacity:0.5`,
      formatCurrency(totals.netProfit, "COP"),
    ],
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
      getProfitAndLossSummary(hotelId, dates.start, dates.end)
        .then((res) => {
          if (res?.isSuccessful && res.item) {
            setTotals({
              totalRevenue: res.item.totalRevenue,
              totalExpenses: res.item.totalExpenses,
              netProfit: res.item.netProfit,
            });
          } else {
            setTotals({ totalRevenue: 0, totalExpenses: 0, netProfit: 0 });
          }
        })
        .catch((error) => {
          setTotals({ totalRevenue: 0, totalExpenses: 0, netProfit: 0 });
          if (error?.response?.status !== 404) {
            toast.error(t("financialReports.profitAndLossReport.loadError"));
          }
        })
        .finally(() => setLoading(false));
    } else {
      setTotals({ totalRevenue: 0, totalExpenses: 0, netProfit: 0 });
      setShowPrompt(true);
    }
  }, [dates.start, dates.end, hotelId, t]);

  return (
    <div>
      <h4>{t("financialReports.profitAndLossReport.title")}</h4>
      <p>{t("financialReports.profitAndLossReport.description")}</p>
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
          message={t("financialReports.profitAndLossReport.selectDatesPrompt")}
        />
      )}
      {!showPrompt && !loading && (
        <Chart
          chartType="ColumnChart"
          width="100%"
          height="350px"
          data={chartData}
          options={{
            title: t("financialReports.profitAndLossReport.chartTitle"),
            legend: { position: "none" },
            vAxis: {
              title: t("financialReports.profitAndLossReport.vAxisTitle"),
            },
            hAxis: {
              title: t("financialReports.profitAndLossReport.hAxisTitle"),
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

export default ProfitAndLossReport;
