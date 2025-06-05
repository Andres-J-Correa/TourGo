import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Chart } from "react-google-charts";
import DatePickers from "components/commonUI/forms/DatePickers";
import Alert from "components/commonUI/Alert";
import SimpleLoader from "components/commonUI/loaders/SimpleLoader";
import { getCategoryPerformanceOverTime } from "services/financialReportService";
import { TRANSACTION_CATEGORIES } from "components/transactions/constants";
import { toast } from "react-toastify";
import { InputGroup, InputGroupText, Input, Row, Col } from "reactstrap";
import TransactionCategoriesExplanationIcon from "components/transactions/TransactionCategoriesExplanationIcon";

const getMonthRange = () => ({
  start: dayjs().startOf("year").format("YYYY-MM-DD"),
  end: dayjs().endOf("year").format("YYYY-MM-DD"),
});

function CategoryPerformanceOverTimeReport({ hotelId }) {
  const [dates, setDates] = useState(getMonthRange());
  const [categoryId, setCategoryId] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);

  const chartData = [
    ["Mes", "Total"],
    ...data.map((item) => [dayjs(item.month).format("MMM YYYY"), item.total]),
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

  const handleCategoryChange = (e) => {
    setCategoryId(e.target.value);
    setShowPrompt(!e.target.value);
    setData([]);
  };

  useEffect(() => {
    if (categoryId && dates.start && dates.end) {
      setLoading(true);
      setShowPrompt(false);
      getCategoryPerformanceOverTime(
        hotelId,
        categoryId,
        dates.start,
        dates.end
      )
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
            toast.error("Error al cargar el desempeño de la categoría");
          }
        })
        .finally(() => setLoading(false));
    } else if (!categoryId) {
      setShowPrompt(true);
      setData([]);
    } else if (!dates.start || !dates.end) {
      setShowPrompt(true); // Show prompt if dates are cleared
      setData([]);
    }
  }, [categoryId, dates.start, dates.end, hotelId]);

  return (
    <div>
      <h4>Desempeño de Categoría en el Tiempo</h4>
      <p>
        Permite ver cómo ha cambiado el total de ingresos o gastos de una
        categoría específica a lo largo del tiempo.
      </p>
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
        <Col xs={6}>
          <label className="form-label">Categoría</label>
          <InputGroup>
            <Input
              type="select"
              value={categoryId}
              onChange={handleCategoryChange}
              disabled={loading}>
              <option value="">Selecciona una categoría</option>
              {TRANSACTION_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Input>
            <InputGroupText>
              <TransactionCategoriesExplanationIcon />
            </InputGroupText>
          </InputGroup>
        </Col>
      </Row>
      <SimpleLoader isVisible={loading} />
      {showPrompt && (
        <Alert
          type="info"
          message={
            !categoryId
              ? "Por favor selecciona una categoría para ver el desempeño en el tiempo."
              : "Por favor selecciona un rango de fechas para ver el desempeño en el tiempo."
          }
        />
      )}
      {!showPrompt && !loading && data.length === 0 && (
        <Alert
          type="info"
          message="No hay datos para la categoría y rango de fechas seleccionados."
        />
      )}
      {!showPrompt && !loading && data.length > 0 && (
        <Chart
          chartType="LineChart"
          width="100%"
          height="350px"
          data={chartData}
          options={{
            title: "Desempeño de la Categoría por Mes",
            legend: { position: "bottom" },
            hAxis: { title: "Mes" },
            vAxis: { title: "Total" },
            curveType: "function",
            pointSize: 5,
          }}
        />
      )}
    </div>
  );
}

export default CategoryPerformanceOverTimeReport;
