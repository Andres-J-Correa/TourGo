import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import { toast } from "react-toastify";

import SimpleLoader from "components/commonUI/loaders/SimpleLoader";

import { getPaymentMethodsTotalsByHotelId } from "services/financialReportService";
import { formatCurrency } from "utils/currencyHelper";

function AccountBalancesReport({ hotelId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPaymentMethodsTotalsByHotelId(hotelId)
      .then((res) => {
        if (res.isSuccessful && Array.isArray(res.items)) {
          const chartData = [
            ["Cuenta", "Total", { role: "annotation" }, { role: "style" }],
            ...res.items.map((item) => [
              item.paymentMethod,
              item.total,
              formatCurrency(item.total, "COP"),
              item.total < 0 ? "color: f44335;opacity:0.5;" : "opacity:0.5;", // Red if negative
            ]),
          ];
          setData(chartData);
        }
      })
      .catch((error) => {
        if (error?.response?.status !== 404) {
          toast.error("Error al cargar los datos de balances");
        }
      })
      .finally(() => setLoading(false));
  }, [hotelId]);

  return (
    <div>
      <h4>Balance en Cuentas</h4>
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
