import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Chart } from "react-google-charts";
import DatePickers from "components/commonUI/forms/DatePickers";
import Alert from "components/commonUI/Alert";
import SimpleLoader from "components/commonUI/loaders/SimpleLoader";
import { getRevPAROverTime } from "services/financialReportService";
import { toast } from "react-toastify";
import { Row, Col } from "reactstrap";

const getYearRange = () => ({
  start: dayjs().startOf("year").format("YYYY-MM-DD"),
  end: dayjs().endOf("year").format("YYYY-MM-DD"),
});

function RevPAROverTimeReport({ hotelId }) {
  const [dates, setDates] = useState(getYearRange());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [goal, setGoal] = useState(500000); // New state for RevPAR goal
  const [showBars, setShowBars] = useState(false); // New state for bars

  // Combo chart data: RevPAR (line), Habitaciones Disponibles (bars), Meta RevPAR (line)
  const chartData = [
    ["Mes", "RevPAR", "Habitaciones Disponibles", "Meta RevPAR"],
    ...data.map((item) => [
      dayjs(item.monthLabel).format("MMM YYYY"),
      item.revPAR,
      item.totalRooms,
      goal,
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
    if (hotelId && dates.start && dates.end) {
      setLoading(true);
      setShowPrompt(false);
      getRevPAROverTime(hotelId, dates.start, dates.end)
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
            toast.error("Error al cargar el RevPAR en el tiempo");
          }
        })
        .finally(() => setLoading(false));
    } else {
      setShowPrompt(true);
      setData([]);
    }
  }, [hotelId, dates.start, dates.end]);

  // Chart options with conditional bars
  const chartOptions = {
    title: "RevPAR y Habitaciones Totales por Mes",
    legend: { position: "bottom" },
    hAxis: { title: "Mes" },
    vAxes: {
      0: { title: "RevPAR" },
      1: { title: "Habitaciones Totales" },
    },
    seriesType: "line",
    series: {
      0: { type: "line", targetAxisIndex: 0, color: "#4caf50" }, // RevPAR
      1: showBars
        ? { type: "bars", targetAxisIndex: 1 }
        : { type: "line", color: "transparent", targetAxisIndex: 1 }, // Hide bars
      2: {
        type: "line",
        targetAxisIndex: 0,
        lineDashStyle: [4, 4],
        color: "#FF9800",
      }, // Meta RevPAR
    },
    curveType: "function",
    pointSize: 5,
  };

  return (
    <div>
      <h4>Ingresos por Habitación Disponible</h4>
      <p>
        Permite ver cómo ha cambiado el ingreso promedio por habitación
        disponible (RevPAR) a lo largo del tiempo.
      </p>
      <Row className="mb-3">
        <Col xs={12} md={8}>
          <DatePickers
            startDate={dates.start}
            endDate={dates.end}
            handleStartChange={handleDateChange("start")}
            handleEndChange={handleDateChange("end")}
            isDisabled={loading}
            allowSameDay={true}
            handleClearDates={handleClearDateFilter}
          />
        </Col>
        <Col xs={12} md={4} className="d-flex align-items-center">
          <label className="me-2 mb-0">Meta RevPAR:</label>
          <input
            type="number"
            min={0}
            value={goal}
            onChange={(e) => setGoal(Number(e.target.value))}
            className="form-control"
            style={{ width: 120 }}
            disabled={loading}
          />
        </Col>
      </Row>
      <div className="mb-3">
        <button
          className="btn btn-outline-dark btn-sm"
          onClick={() => setShowBars((prev) => !prev)}
          disabled={loading}>
          {showBars
            ? "Ocultar barras de habitaciones"
            : "Mostrar barras de habitaciones"}
        </button>
      </div>
      <SimpleLoader isVisible={loading} />
      {showPrompt && (
        <Alert
          type="info"
          message="Por favor selecciona un rango de fechas para ver el RevPAR en el tiempo."
        />
      )}
      {!showPrompt && !loading && data.length === 0 && (
        <Alert
          type="info"
          message="No hay datos para el rango de fechas seleccionado."
        />
      )}
      {!showPrompt && !loading && data.length > 0 && (
        <Chart
          chartType="ComboChart"
          width="100%"
          height="350px"
          data={chartData}
          options={chartOptions}
        />
      )}
    </div>
  );
}

export default RevPAROverTimeReport;
