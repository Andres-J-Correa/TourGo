import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Chart } from "react-google-charts";
import DatePickersV2 from "components/commonUI/forms/DatePickersV2";
import Alert from "components/commonUI/Alert";
import SimpleLoader from "components/commonUI/loaders/SimpleLoader";
import { getCategoryPerformanceOverTime } from "services/financialReportService";
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_CATEGORY_TYPES_IDS,
} from "components/transactions/constants";
import { toast } from "react-toastify";
import { InputGroup, InputGroupText, Input, Row, Col } from "reactstrap";
import TransactionCategoriesExplanationIcon from "components/transactions/TransactionCategoriesExplanationIcon";
import { useLanguage } from "contexts/LanguageContext";
import { getDateString } from "utils/dateHelper";

const getMonthRange = () => ({
  start: dayjs().startOf("year").format("YYYY-MM-DD"),
  end: dayjs().endOf("year").format("YYYY-MM-DD"),
});

function CategoryPerformanceOverTimeReport({ hotelId }) {
  const [dates, setDates] = useState(getMonthRange());
  const [category, setCategory] = useState({
    id: 0,
    typeId: 0,
  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const { t } = useLanguage();

  const chartData = [
    [
      t("financialReports.categoryPerformanceOverTimeReport.month"),
      t("financialReports.categoryPerformanceOverTimeReport.total"),
    ],
    ...data.map((item) => [
      dayjs(item.month).format("MMM YYYY"),
      category.typeId === TRANSACTION_CATEGORY_TYPES_IDS.EXPENSE
        ? -item.total
        : item.total,
    ]),
  ];

  const handleDateChange = (type) => (date) => {
    setDates((prev) => ({
      ...prev,
      [type]: date ? getDateString(date) : "",
    }));
  };

  const handleClearDateFilter = () => {
    setDates({ start: "", end: "" });
    setData([]);
    setShowPrompt(true);
  };

  const handleCategoryChange = (e) => {
    const { value } = e.target;
    const categoryTypeId =
      e.target?.options[e.target.selectedIndex]?.dataset?.type;
    setCategory({
      id: value,
      typeId: categoryTypeId ? Number(categoryTypeId) : 0,
    });
    setShowPrompt(!e.target.value);
    setData([]);
  };

  useEffect(() => {
    if (category.id && dates.start && dates.end) {
      setLoading(true);
      setShowPrompt(false);
      getCategoryPerformanceOverTime(
        hotelId,
        category.id,
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
            toast.error(
              t("financialReports.categoryPerformanceOverTimeReport.loadError")
            );
          }
        })
        .finally(() => setLoading(false));
    } else if (!category.id) {
      setShowPrompt(true);
      setData([]);
    } else if (!dates.start || !dates.end) {
      setShowPrompt(true);
      setData([]);
    }
  }, [category.id, dates.start, dates.end, hotelId, t]);

  return (
    <div>
      <h4>{t("financialReports.categoryPerformanceOverTimeReport.title")}</h4>
      <p>
        {t("financialReports.categoryPerformanceOverTimeReport.description")}
      </p>
      <Row className="mb-3">
        <Col xs={12}>
          <DatePickersV2
            startDate={dates.start}
            endDate={dates.end}
            handleStartChange={handleDateChange("start")}
            handleEndChange={handleDateChange("end")}
            disabled={loading}
            allowSameDay={true}
            handleClearDates={handleClearDateFilter}
          />
        </Col>
        <Col xs={6}>
          <label className="form-label">
            {t("financialReports.categoryPerformanceOverTimeReport.category")}
          </label>
          <InputGroup>
            <Input
              type="select"
              value={category.id}
              onChange={handleCategoryChange}
              disabled={loading}>
              <option value="">
                {t(
                  "financialReports.categoryPerformanceOverTimeReport.selectCategory"
                )}
              </option>
              {TRANSACTION_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id} data-type={cat.typeId}>
                  {t(cat.name)}
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
            !category.id
              ? t(
                  "financialReports.categoryPerformanceOverTimeReport.selectCategoryPrompt"
                )
              : t(
                  "financialReports.categoryPerformanceOverTimeReport.selectDatesPrompt"
                )
          }
        />
      )}
      {!showPrompt && !loading && data.length === 0 && (
        <Alert
          type="info"
          message={t(
            "financialReports.categoryPerformanceOverTimeReport.noData"
          )}
        />
      )}
      {!showPrompt && !loading && data.length > 0 && (
        <Chart
          chartType="LineChart"
          width="100%"
          height="350px"
          data={chartData}
          options={{
            title: t(
              "financialReports.categoryPerformanceOverTimeReport.chartTitle"
            ),
            legend: { position: "bottom" },
            hAxis: {
              title: t(
                "financialReports.categoryPerformanceOverTimeReport.month"
              ),
            },
            vAxis: {
              title: t(
                "financialReports.categoryPerformanceOverTimeReport.total"
              ),
            },
            curveType: "function",
            pointSize: 5,
          }}
        />
      )}
    </div>
  );
}

export default CategoryPerformanceOverTimeReport;
