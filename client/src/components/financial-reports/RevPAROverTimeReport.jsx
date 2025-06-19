import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Chart } from "react-google-charts";
import DatePickers from "components/commonUI/forms/DatePickers";
import Alert from "components/commonUI/Alert";
import SimpleLoader from "components/commonUI/loaders/SimpleLoader";
import { getRevPAROverTime } from "services/financialReportService";
import { toast } from "react-toastify";
import { Row, Col } from "reactstrap";
import { useLanguage } from "contexts/LanguageContext";

const getYearRange = () => ({
  start: dayjs().startOf("year").format("YYYY-MM-DD"),
  end: dayjs().endOf("year").format("YYYY-MM-DD"),
});

function RevPAROverTimeReport({ hotelId }) {
  const [dates, setDates] = useState(getYearRange());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [goal, setGoal] = useState(500000);
  const [showBars, setShowBars] = useState(false);

  const { t } = useLanguage();

  // Combo chart data: RevPAR (line), Habitaciones Disponibles (bars), Meta RevPAR (line)
  const chartData = [
    [
      t("financialReports.revPAROverTimeReport.month"),
      t("financialReports.revPAROverTimeReport.revpar"),
      t("financialReports.revPAROverTimeReport.totalRooms"),
      t("financialReports.revPAROverTimeReport.goal"),
    ],
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
            toast.error(t("financialReports.revPAROverTimeReport.loadError"));
          }
        })
        .finally(() => setLoading(false));
    } else {
      setShowPrompt(true);
      setData([]);
    }
  }, [hotelId, dates.start, dates.end, t]);

  // Chart options with conditional bars
  const chartOptions = {
    title: t("financialReports.revPAROverTimeReport.chartTitle"),
    legend: { position: "bottom" },
    hAxis: { title: t("financialReports.revPAROverTimeReport.month") },
    vAxes: {
      0: { title: t("financialReports.revPAROverTimeReport.revpar") },
      1: { title: t("financialReports.revPAROverTimeReport.totalRooms") },
    },
    seriesType: "line",
    series: {
      0: { type: "line", targetAxisIndex: 0, color: "#4caf50" },
      1: showBars
        ? { type: "bars", targetAxisIndex: 1 }
        : { type: "line", color: "transparent", targetAxisIndex: 1 },
      2: {
        type: "line",
        targetAxisIndex: 0,
        lineDashStyle: [4, 4],
        color: "#FF9800",
      },
    },
    curveType: "function",
    pointSize: 5,
  };

  return (
    <div>
      <h4>{t("financialReports.revPAROverTimeReport.title")}</h4>
      <p>{t("financialReports.revPAROverTimeReport.description")}</p>
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
          <label className="me-2 mb-0">
            {t("financialReports.revPAROverTimeReport.goalLabel")}
          </label>
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
            ? t("financialReports.revPAROverTimeReport.hideBars")
            : t("financialReports.revPAROverTimeReport.showBars")}
        </button>
      </div>
      <SimpleLoader isVisible={loading} />
      {showPrompt && (
        <Alert
          type="info"
          message={t("financialReports.revPAROverTimeReport.selectDatesPrompt")}
        />
      )}
      {!showPrompt && !loading && data.length === 0 && (
        <Alert
          type="info"
          message={t("financialReports.revPAROverTimeReport.noData")}
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
