import React, { useState, useEffect } from "react";
import { Row, Col, Input, InputGroup, InputGroupText } from "reactstrap";
import { Chart } from "react-google-charts";
import DatePickers from "components/commonUI/forms/DatePickers";
import Alert from "components/commonUI/Alert";
import SimpleLoader from "components/commonUI/loaders/SimpleLoader";
import { getCostToRevenueRatio } from "services/financialReportService";
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_CATEGORY_TYPES_IDS,
} from "components/transactions/constants";
import dayjs from "dayjs";

const getMonthRange = () => ({
  start: dayjs().startOf("month").format("YYYY-MM-DD"),
  end: dayjs().endOf("month").format("YYYY-MM-DD"),
});

function CostToRevenueRatioReport({ hotelId }) {
  const [dates, setDates] = useState(getMonthRange());
  const [revenueCategoryId, setRevenueCategoryId] = useState("");
  const [expenseCategoryId, setExpenseCategoryId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);

  // Filter categories for selects
  const revenueCategories = TRANSACTION_CATEGORIES.filter(
    (cat) => cat.typeId === TRANSACTION_CATEGORY_TYPES_IDS.INCOME
  );
  const expenseCategories = TRANSACTION_CATEGORIES.filter(
    (cat) => cat.typeId === TRANSACTION_CATEGORY_TYPES_IDS.EXPENSE
  );

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

  const handleRevenueChange = (e) => {
    setRevenueCategoryId(e.target.value);
    setShowPrompt(!(e.target.value && expenseCategoryId));
    setData(null);
  };

  const handleExpenseChange = (e) => {
    setExpenseCategoryId(e.target.value);
    setShowPrompt(!(revenueCategoryId && e.target.value));
    setData(null);
  };

  useEffect(() => {
    if (
      hotelId &&
      revenueCategoryId &&
      expenseCategoryId &&
      dates.start &&
      dates.end
    ) {
      setLoading(true);
      setShowPrompt(false);
      getCostToRevenueRatio(
        hotelId,
        revenueCategoryId,
        expenseCategoryId,
        dates.start,
        dates.end
      )
        .then((res) => {
          if (
            res?.isSuccessful &&
            Array.isArray(res.items) &&
            res.items.length > 0
          ) {
            setData(res.items[0]);
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
    // eslint-disable-next-line
  }, [hotelId, revenueCategoryId, expenseCategoryId, dates.start, dates.end]);

  // Prepare Gauge chart data
  const gaugeData = [
    ["Label", "Ratio"],
    ["Costo/Ingreso", data?.costToRevenueRatio * 100 ?? 0],
  ];

  const gaugeOptions = {
    width: 400,
    height: 220,
    min: 0,
    max: 100,
    greenFrom: 0,
    greenTo: 50,
    yellowFrom: 50,
    yellowTo: 75,
    redFrom: 75,
    redTo: 100,
    animation: { duration: 1000, easing: "out" },
    majorTicks: ["0", "20", "40", "60", "80", "100"],
  };

  return (
    <div>
      <h4>Relación Gasto a Ingreso</h4>
      <p>
        Muestra la relación entre una categoría de gastos y una categoría de
        ingresos del hotel, mostrando qué porcentaje de los ingresos se gasta.
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
        <Col xs={12} md={5}>
          <label className="form-label">Categoría de Ingresos</label>
          <InputGroup>
            <Input
              type="select"
              value={revenueCategoryId}
              onChange={handleRevenueChange}
              disabled={loading}>
              <option value="">Selecciona ingresos</option>
              {revenueCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Input>
            <InputGroupText>💰</InputGroupText>
          </InputGroup>
        </Col>
        <Col xs={12} md={2}></Col>
        <Col xs={12} md={5}>
          <label className="form-label">Categoría de Gastos</label>
          <InputGroup>
            <Input
              type="select"
              value={expenseCategoryId}
              onChange={handleExpenseChange}
              disabled={loading}>
              <option value="">Selecciona gastos</option>
              {expenseCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Input>
            <InputGroupText>💸</InputGroupText>
          </InputGroup>
        </Col>
      </Row>
      <SimpleLoader isVisible={loading} />
      {showPrompt && (
        <Alert
          type="info"
          message={
            !dates.start || !dates.end
              ? "Por favor selecciona un rango de fechas para ver la relación costo/ingreso."
              : "Selecciona una categoría de ingresos y una de gastos, y un rango de fechas para ver la relación costo/ingreso."
          }
        />
      )}
      {!showPrompt && !loading && !data && (
        <Alert
          type="info"
          message="No hay datos para la combinación y rango de fechas seleccionados."
        />
      )}
      {!showPrompt && !loading && data && (
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
            <strong>Relación Costo/Ingreso:</strong>{" "}
            {(data.costToRevenueRatio * 100).toFixed(1)}%
          </div>
        </div>
      )}
    </div>
  );
}

export default CostToRevenueRatioReport;
