import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import { toast } from "react-toastify";

import SimpleLoader from "components/commonUI/loaders/SimpleLoader";
import DatePickers from "components/commonUI/forms/DatePickers";

import { getPaymentMethodsTotalsByHotelId } from "services/financialReportService";
import { formatCurrency } from "utils/currencyHelper";
import { Col, Row } from "reactstrap";
import dayjs from "dayjs";

function AccountBalancesReport({ hotelId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState({
    start: "",
    end: "",
  });

  const handleDateChange = (type) => (date) => {
    setDates((prev) => ({
      ...prev,
      [type]: date ? dayjs(date).format("YYYY-MM-DD") : "",
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
            ["Cuenta", "Total", { role: "annotation" }, { role: "style" }],
            ...res.items.map((item) => [
              item.paymentMethod,
              item.total,
              formatCurrency(item.total, "COP"),
              item.total < 0 ? "color: #f44335; opacity:0.5;" : "opacity:0.5;", // Red if negative
            ]),
          ];
          setData(chartData);
        }
      })
      .catch((error) => {
        if (error?.response?.status !== 404) {
          toast.error("Error al cargar los datos de balances");
        }
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [hotelId, dates]);

  return (
    <div>
      <h4>Balance en Cuentas</h4>
      <p>
        Muestra el saldo actual de dinero en cada cuenta o método de pago del
        hotel.
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
      <SimpleLoader isVisible={loading} />
      {!loading && data.length > 1 && (
        <Chart
          chartType="BarChart"
          width="100%"
          height="300px"
          data={data}
          options={{
            title: "Balance en cuentas por métodos de pago",
            legend: { position: "none" },
            hAxis: { title: "Total" },
            vAxis: { title: "Método de pago" },
            annotations: {
              alwaysOutside: true,
              textStyle: {
                fontSize: 14,
                color: "#000", // Default color for positive
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
