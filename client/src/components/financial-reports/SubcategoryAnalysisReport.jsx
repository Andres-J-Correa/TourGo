import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import DatePickers from "components/commonUI/forms/DatePickers";
import Alert from "components/commonUI/Alert";
import SimpleLoader from "components/commonUI/loaders/SimpleLoader";
import { getSubcategoryAnalysis } from "services/financialReportService";
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_CATEGORY_TYPES_IDS,
} from "components/transactions/constants";
import { toast } from "react-toastify";
import { Input, Row, Col, InputGroup, InputGroupText } from "reactstrap";
import TransactionCategoriesExplanationIcon from "components/transactions/TransactionCategoriesExplanationIcon";
import dayjs from "dayjs";
import { formatCurrency } from "utils/currencyHelper";
import { useLanguage } from "contexts/LanguageContext";

const getMonthRange = () => ({
  start: dayjs().startOf("year").format("YYYY-MM-DD"),
  end: dayjs().endOf("year").format("YYYY-MM-DD"),
});

function SubcategoryAnalysisReport({ hotelId }) {
  const [dates, setDates] = useState(getMonthRange());
  const [category, setCategory] = useState({ id: "", typeId: 0 });
  const [loading, setLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [data, setData] = useState([]);

  const { t } = useLanguage();

  const chartData = [
    [
      t("financialReports.subcategoryAnalysisReport.subcategory"),
      t("financialReports.subcategoryAnalysisReport.total"),
      { role: "annotation" },
      { role: "style" },
    ],
    ...data.map((item) => {
      const value =
        category.typeId === TRANSACTION_CATEGORY_TYPES_IDS.EXPENSE
          ? -item.total
          : item.total;
      return [
        item.subcategory,
        value,
        formatCurrency(value, "COP"),
        value < 0 ? "color: #f44335; opacity:0.5;" : "opacity:0.5;",
      ];
    }),
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
    const { value } = e.target;
    const categoryTypeId =
      e.target?.options[e.target.selectedIndex]?.dataset?.type;
    setCategory({
      id: value,
      typeId: categoryTypeId ? Number(categoryTypeId) : 0,
    });
    setShowPrompt(!value);
    setData([]);
  };

  useEffect(() => {
    if (category.id && dates.start && dates.end) {
      setLoading(true);
      setShowPrompt(false);
      getSubcategoryAnalysis(hotelId, category.id, dates.start, dates.end)
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
              t("financialReports.subcategoryAnalysisReport.loadError")
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
      <h4>{t("financialReports.subcategoryAnalysisReport.title")}</h4>
      <p>{t("financialReports.subcategoryAnalysisReport.description")}</p>
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
          <label className="form-label">
            {t("financialReports.subcategoryAnalysisReport.categoryLabel")}
          </label>
          <InputGroup>
            <Input
              type="select"
              value={category.id}
              onChange={handleCategoryChange}
              disabled={loading}>
              <option value="">
                {t("financialReports.subcategoryAnalysisReport.selectCategory")}
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
                  "financialReports.subcategoryAnalysisReport.selectCategoryPrompt"
                )
              : t(
                  "financialReports.subcategoryAnalysisReport.selectDatesPrompt"
                )
          }
        />
      )}
      {!showPrompt && !loading && data.length === 0 && (
        <Alert
          type="info"
          message={t("financialReports.subcategoryAnalysisReport.noData")}
        />
      )}
      {!showPrompt && !loading && data.length > 0 && (
        <Chart
          chartType="BarChart"
          width="100%"
          height="350px"
          data={chartData}
          options={{
            title: t("financialReports.subcategoryAnalysisReport.chartTitle"),
            legend: { position: "none" },
            hAxis: {
              title: t("financialReports.subcategoryAnalysisReport.total"),
            },
            vAxis: {
              title: t(
                "financialReports.subcategoryAnalysisReport.subcategory"
              ),
            },
            bars: "horizontal",
            annotations: {
              alwaysOutside: true,
              textStyle: {
                fontSize: 14,
                color: "#000",
                auraColor: "none",
              },
            },
          }}
        />
      )}
    </div>
  );
}

export default SubcategoryAnalysisReport;
