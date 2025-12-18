import React, { useState, useEffect } from "react";
import { Row, Col, Input, InputGroup, InputGroupText } from "reactstrap";
import { Chart } from "react-google-charts";
import DatePickersV2 from "components/commonUI/forms/DatePickersV2";
import Alert from "components/commonUI/Alert";
import SimpleLoader from "components/commonUI/loaders/SimpleLoader";
import { getCostToRevenueRatio } from "services/financialReportService";
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_CATEGORY_TYPES_IDS,
} from "components/transactions/constants";
import dayjs from "dayjs";
import { useLanguage } from "contexts/LanguageContext";

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
  const { t } = useLanguage();

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
    [
      t("financialReports.costToRevenueRatioReport.gaugeLabel"),
      data?.costToRevenueRatio ? data.costToRevenueRatio * 100 : 0,
    ],
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
      <h4>{t("financialReports.costToRevenueRatioReport.title")}</h4>
      <p>{t("financialReports.costToRevenueRatioReport.description")}</p>
      <Row>
        <Col xs={12}>
          <DatePickersV2
            startDate={dates.start}
            endDate={dates.end}
            handleStartChange={handleDateChange("start")}
            handleEndChange={handleDateChange("end")}
            disabled={loading}
            allowSameDay={true}
          />
        </Col>
      </Row>
      <Row className="mb-3">
        <Col xs={12} md={5}>
          <label className="form-label">
            {t("financialReports.costToRevenueRatioReport.revenueCategory")}
          </label>
          <InputGroup>
            <Input
              type="select"
              value={revenueCategoryId}
              onChange={handleRevenueChange}
              disabled={loading}>
              <option value="">
                {t("financialReports.costToRevenueRatioReport.selectRevenue")}
              </option>
              {revenueCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {t(cat.name)}
                </option>
              ))}
            </Input>
            <InputGroupText>💰</InputGroupText>
          </InputGroup>
        </Col>
        <Col xs={12} md={2}></Col>
        <Col xs={12} md={5}>
          <label className="form-label">
            {t("financialReports.costToRevenueRatioReport.expenseCategory")}
          </label>
          <InputGroup>
            <Input
              type="select"
              value={expenseCategoryId}
              onChange={handleExpenseChange}
              disabled={loading}>
              <option value="">
                {t("financialReports.costToRevenueRatioReport.selectExpense")}
              </option>
              {expenseCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {t(cat.name)}
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
              ? t("financialReports.costToRevenueRatioReport.selectDatesPrompt")
              : t(
                  "financialReports.costToRevenueRatioReport.selectCategoriesPrompt"
                )
          }
        />
      )}
      {!showPrompt && !loading && !data && (
        <Alert
          type="info"
          message={t("financialReports.costToRevenueRatioReport.noData")}
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
            <strong>
              {t("financialReports.costToRevenueRatioReport.gaugeLabel")}:
            </strong>{" "}
            {(data.costToRevenueRatio * 100).toFixed(1)}%
          </div>
        </div>
      )}
    </div>
  );
}

export default CostToRevenueRatioReport;
