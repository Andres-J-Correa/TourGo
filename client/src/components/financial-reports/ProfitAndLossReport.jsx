import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Chart } from "react-google-charts";
import DatePickers from "components/commonUI/forms/DatePickers";
import Alert from "components/commonUI/Alert";
import { getProfitAndLossSummary } from "services/financialReportService";
import SimpleLoader from "components/commonUI/loaders/SimpleLoader";
import { toast } from "react-toastify";
import { formatCurrency } from "utils/currencyHelper";

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

  const chartData = [
    ["Tipo", "Total", { role: "style" }, { role: "annotation" }],
    [
      "Ingresos",
      totals.totalRevenue,
      `color: #4caf50; opacity:0.5`,
      formatCurrency(totals.totalRevenue, "COP"),
    ],
    [
      "Gastos",
      totals.totalExpenses,
      `color: #f44335; opacity:0.5`,
      formatCurrency(totals.totalExpenses, "COP"),
    ],
    [
      "Utilidad Neta",
      totals.netProfit,
      `opacity:0.5`,
      formatCurrency(totals.netProfit, "COP"),
    ],
  ];

  const handleDateChange = (type) => (date) => {
    setDates((prev) => ({
      ...prev,
      [type]: date ? dayjs(date).format("YYYY-MM-DD") : "",
    }));
  };

  const handleClearDateFilter = () => {
    setDates({ start: "", end: "" });
    setTotals({ totalRevenue: 0, totalExpenses: 0, netProfit: 0 });
    setShowPrompt(true);
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
            toast.error("Error al cargar el reporte de ingresos y gastos");
          }
        })
        .finally(() => setLoading(false));
    } else {
      setTotals({ totalRevenue: 0, totalExpenses: 0, netProfit: 0 });
      setShowPrompt(true);
    }
  }, [dates.start, dates.end, hotelId]);
  return (
    <div>
      <h4>Ganancias y Pérdidas</h4>
      <p>
        Resume los ingresos, gastos y la utilidad neta del hotel en un periodo
        determinado.
      </p>
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
          message="Por favor selecciona un rango de fechas para ver el reporte de ingresos y gastos."
        />
      )}
      {!showPrompt && !loading && (
        <Chart
          chartType="ColumnChart"
          width="100%"
          height="350px"
          data={chartData}
          options={{
            title: "Resumen de Ingresos y Gastos",
            legend: { position: "none" },
            vAxis: { title: "Total (COP)" },
            hAxis: { title: "Tipo" },
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
