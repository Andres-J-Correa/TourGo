import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Chart } from "react-google-charts";
import DatePickers from "components/commonUI/forms/DatePickers";
import Alert from "components/commonUI/Alert";
import SimpleLoader from "components/commonUI/loaders/SimpleLoader";
import { getHotelOccupancyOverTime } from "services/financialReportService";
import { toast } from "react-toastify";
import { Row, Col } from "reactstrap";

const getYearRange = () => ({
  start: dayjs().startOf("year").format("YYYY-MM-DD"),
  end: dayjs().endOf("year").format("YYYY-MM-DD"),
});

function HotelOccupancyOverTimeReport({ hotelId }) {
  const [dates, setDates] = useState(getYearRange());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);

  const chartData = [
    ["Mes", "Ocupación (%)", "Habitaciones Totales"],
    ...data.map((item) => [
      dayjs(item.monthLabel).format("MMM YYYY"),
      item.occupancyRate * 100, // Convert to percentage
      item.totalRooms,
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
      getHotelOccupancyOverTime(hotelId, dates.start, dates.end)
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
            toast.error("Error al cargar la ocupación del hotel en el tiempo");
          }
        })
        .finally(() => setLoading(false));
    } else {
      setShowPrompt(true);
      setData([]);
    }
  }, [hotelId, dates.start, dates.end]);

  return (
    <div>
      <h4>Ocupación del Hotel</h4>
      <p>Este reporte muestra la ocupación del hotel a lo largo del tiempo,</p>
      <Row className="mb-3">
        <Col xs={12}>
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
      </Row>
      <SimpleLoader isVisible={loading} />
      {showPrompt && (
        <Alert
          type="info"
          message="Por favor selecciona un rango de fechas para ver la ocupación del hotel en el tiempo."
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
          chartType="LineChart"
          width="100%"
          height="350px"
          data={chartData}
          options={{
            title: "Ocupación (%) y Habitaciones Totales por Mes",
            legend: { position: "bottom" },
            hAxis: { title: "Mes" },
            vAxes: {
              0: { title: "Ocupación (%)" },
              1: { title: "Habitaciones Totales" },
            },
            series: {
              0: { targetAxisIndex: 0 }, // Ocupación (%) on left axis
              1: { targetAxisIndex: 1 }, // Habitaciones Totales on right axis
            },
            curveType: "function",
            pointSize: 5,
          }}
        />
      )}
    </div>
  );
}

export default HotelOccupancyOverTimeReport;
