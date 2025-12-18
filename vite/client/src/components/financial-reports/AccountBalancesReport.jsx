import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import { toast } from "react-toastify";

import SimpleLoader from "components/commonUI/loaders/SimpleLoader";
import DatePickersV2 from "components/commonUI/forms/DatePickersV2";
import Alert from "components/commonUI/Alert";

import { getPaymentMethodsTotalsByHotelId } from "services/financialReportService";
import { formatCurrency } from "utils/currencyHelper";
import { Col, Row } from "reactstrap";
import { useLanguage } from "contexts/LanguageContext";
import { getDateString } from "utils/dateHelper";

function AccountBalancesReport({ hotelId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState({
    start: "",
    end: "",
  });
  const { t } = useLanguage(); // added

  const handleDateChange = (type) => (date) => {
    setDates((prev) => ({
      ...prev,
      [type]: getDateString(date),
    }));
  };

  const handleClearDateFilter = () => {
    setDates({ start: "", end: "" });
  };

  useEffect(() => {
    if (!hotelId) return;
    if ((dates.start && !dates.end) || (!dates.start && dates.end)) return;
    setLoading(true);
    getPaymentMethodsTotalsByHotelId(hotelId, dates.start, dates.end)
      .then((res) => {
        if (res.isSuccessful && Array.isArray(res.items)) {
          const chartData = [
            [
              t("financialReports.accountBalancesReport.account"),
              t("financialReports.accountBalancesReport.total"),
              { role: "annotation" },
              { role: "style" },
            ],
            ...res.items.map((item) => [
              item.paymentMethod,
              item.total,
              formatCurrency(item.total, "COP"),
              item.total < 0 ? "color: #f44335; opacity:0.5;" : "opacity:0.5;",
            ]),
          ];
          setData(chartData);
        }
      })
      .catch((error) => {
        if (error?.response?.status !== 404) {
          toast.error(t("financialReports.accountBalancesReport.loadError"));
        }
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [hotelId, dates, t]);

  return (
    <div>
      <h4>{t("financialReports.accountBalancesReport.title")}</h4>
      <p>{t("financialReports.accountBalancesReport.description")}</p>
      <Row>
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
        {((dates.start && !dates.end) || (!dates.start && dates.end)) && (
          <Col xs={12} className="mt-2">
            <Alert
              type="info"
              message={t(
                "financialReports.accountBalancesReport.bothDatesRequired"
              )}
            />
          </Col>
        )}
      </Row>
      <SimpleLoader isVisible={loading} />
      {!loading && data.length > 1 && (
        <Chart
          chartType="BarChart"
          width="100%"
          height="300px"
          data={data}
          options={{
            title: t("financialReports.accountBalancesReport.chartTitle"),
            legend: { position: "none" },
            hAxis: { title: t("financialReports.accountBalancesReport.total") },
            vAxis: {
              title: t("financialReports.accountBalancesReport.paymentMethod"),
            },
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

export default AccountBalancesReport;
