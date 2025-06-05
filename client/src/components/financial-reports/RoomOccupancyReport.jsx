import React, { useState, useEffect } from "react";
import { Row, Col, Input, InputGroup, InputGroupText } from "reactstrap";
import { Chart } from "react-google-charts";
import DatePickers from "components/commonUI/forms/DatePickers";
import Alert from "components/commonUI/Alert";
import SimpleLoader from "components/commonUI/loaders/SimpleLoader";
import { getRoomOccupancyByDateRange } from "services/financialReportService";
import dayjs from "dayjs";
import { getByHotelId as getRoomsByHotelId } from "services/roomService";
import { toast } from "react-toastify";

const getMonthRange = () => ({
  start: dayjs().startOf("month").format("YYYY-MM-DD"),
  end: dayjs().endOf("month").format("YYYY-MM-DD"),
});

function RoomOccupancyReport({ hotelId }) {
  const [rooms, setRooms] = useState([]);
  const [dates, setDates] = useState(getMonthRange());
  const [roomId, setRoomId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);

  const handleDateChange = (type) => (date) => {
    setDates((prev) => ({
      ...prev,
      [type]: date ? dayjs(date).format("YYYY-MM-DD") : "",
    }));
  };

  const handleClearDateFilter = () => {
    setDates({ start: "", end: "" });
    setData(null);
    setShowPrompt(true);
  };

  const handleRoomChange = (e) => {
    setRoomId(e.target.value);
    setShowPrompt(!(e.target.value && dates.start && dates.end));
    setData(null);
  };

  const gaugeData = [
    ["Label", "Ocupación"],
    ["Ocupación", data !== null ? data * 100 : 0],
  ];

  const gaugeOptions = {
    width: 400,
    height: 220,
    min: 0,
    max: 100,
    greenFrom: 70,
    greenTo: 100,
    yellowFrom: 40,
    yellowTo: 70,
    redFrom: 0,
    redTo: 40,
    animation: { duration: 1000, easing: "out" },
    majorTicks: ["0", "20", "40", "60", "80", "100"],
  };

  useEffect(() => {
    if (hotelId && roomId && dates.start && dates.end) {
      setLoading(true);
      setShowPrompt(false);
      getRoomOccupancyByDateRange(hotelId, roomId, dates.start, dates.end)
        .then((res) => {
          if (res?.isSuccessful && typeof res.item === "number") {
            setData(res.item);
          } else {
            setData(null);
          }
        })
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    } else {
      setShowPrompt(true);
      setData(null);
    }
  }, [hotelId, roomId, dates.start, dates.end]);

  useEffect(() => {
    if (!hotelId) return;
    setLoadingRooms(true);
    getRoomsByHotelId(hotelId)
      .then((res) => {
        if (res.isSuccessful) {
          setRooms(res.items);
        }
      })
      .catch((error) => {
        if (error?.response?.status !== 404) {
          toast.error(
            "Ocurrió un error al obtener las habitaciones del hotel."
          );
        }
      })
      .finally(() => {
        setLoadingRooms(false);
      });
  }, [hotelId]);

  return (
    <div>
      <h4>Ocupación de Habitación</h4>
      <p>
        Muestra el porcentaje de ocupación de una habitación específica en un
        rango de fechas.
      </p>
      <Row>
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
      <Row className="mb-3">
        <Col xs={12} md={6}>
          <label className="form-label">Habitación</label>
          <InputGroup>
            <Input
              type="select"
              value={roomId}
              onChange={handleRoomChange}
              disabled={loading}>
              <option value="">
                {loadingRooms ? "cargando..." : "Selecciona una habitación"}
              </option>
              {rooms.length > 0 &&
                rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
            </Input>
            <InputGroupText>🛏️</InputGroupText>
          </InputGroup>
        </Col>
      </Row>
      <SimpleLoader isVisible={loading} />
      {showPrompt && (
        <Alert
          type="info"
          message={
            !dates.start || !dates.end
              ? "Por favor selecciona un rango de fechas para ver la ocupación."
              : "Selecciona una habitación y un rango de fechas para ver la ocupación."
          }
        />
      )}
      {!showPrompt && !loading && data === null && (
        <Alert
          type="info"
          message="No hay datos para la combinación y rango de fechas seleccionados."
        />
      )}
      {!showPrompt && !loading && data !== null && (
        <div className="d-flex flex-column align-items-center">
          <Chart
            chartType="Gauge"
            width="400px"
            height="220px"
            data={gaugeData}
            options={gaugeOptions}
            className="d-flex justify-content-center mb-3"
          />
          <div>
            <strong>Ocupación:</strong> {(data * 100).toFixed(1)}%
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomOccupancyReport;
