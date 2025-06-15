import React, { useMemo } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Row, Col, Nav, NavItem, NavLink } from "reactstrap";
import Breadcrumb from "components/commonUI/Breadcrumb";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import AccountBalancesReport from "components/financial-reports/AccountBalancesReport";
import ProfitAndLossReport from "components/financial-reports/ProfitAndLossReport";
import RevenueBreakdownReport from "components/financial-reports/RevenueBreakdownReport";
import ExpenseBreakdownReport from "components/financial-reports/ExpenseBreakdownReport";
import RevPAROverTimeReport from "components/financial-reports/RevPAROverTimeReport";
import CategoryPerformanceOverTimeReport from "components/financial-reports/CategoryPerformanceOverTimeReport";
import SubcategoryAnalysisReport from "components/financial-reports/SubcategoryAnalysisReport";
import CostToRevenueRatioReport from "components/financial-reports/CostToRevenueRatioReport";
import UtilityCostAnalysisReport from "components/financial-reports/UtilityCostAnalysisReport";
import HotelOccupancyOverTimeReport from "components/financial-reports/HotelOccupancyOverTimeReport";
import RoomOccupancyReport from "components/financial-reports/RoomOccupancyReport";

const TABS = [
  { key: "balance", label: "Balance en cuentas" },
  { key: "profitLoss", label: "Resumen de Ganancias y Pérdidas" },
  { key: "revenue", label: "Desglose de Ingresos" },
  { key: "expenses", label: "Desglose de Gastos" },
  {
    key: "revPAROverTime",
    label: "RevPAR en el Tiempo",
  },
  {
    key: "hotelOccupancyOverTime",
    label: "Ocupación del Hotel en el Tiempo",
  },
  {
    key: "roomOccupancy",
    label: "Ocupación de Habitaciones",
  },
  {
    key: "categoryPerformance",
    label: "Desempeño de Categoría en el Tiempo",
  },
  { key: "subcategoryAnalysis", label: "Análisis por Subcategoría" },
  { key: "costToRevenueRatio", label: "Relación de Gasto a Ingreso" },
  {
    key: "utilityCostAnalysis",
    label: "Análisis de Costos de Servicios Públicos",
  },
];

const tabComponents = {
  balance: AccountBalancesReport,
  profitLoss: ProfitAndLossReport,
  revenue: RevenueBreakdownReport,
  expenses: ExpenseBreakdownReport,
  categoryPerformance: CategoryPerformanceOverTimeReport,
  subcategoryAnalysis: SubcategoryAnalysisReport,
  costToRevenueRatio: CostToRevenueRatioReport,
  utilityCostAnalysis: UtilityCostAnalysisReport,
  revPAROverTime: RevPAROverTimeReport,
  hotelOccupancyOverTime: HotelOccupancyOverTimeReport,
  roomOccupancy: RoomOccupancyReport,
};

function FinanceDashboard() {
  const { hotelId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = useMemo(() => {
    const tab = new URLSearchParams(location.search).get("tab");
    return TABS.some((t) => t.key === tab) ? tab : TABS[0].key;
  }, [location.search]);

  const handleTabChange = (tab) => {
    const newParams = new URLSearchParams(location.search);
    newParams.set("tab", tab);
    navigate({
      pathname: location.pathname,
      search: newParams.toString(),
    });
  };

  const breadcrumbs = [
    { label: "Inicio", path: "/" },
    { label: "Hotel", path: `/hotels/${hotelId}` },
  ];

  const renderContent = () => {
    const Component = tabComponents[activeTab] || AccountBalancesReport;
    return <Component hotelId={hotelId} />;
  };

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} active="Panel de finanzas" />
      <h3 className="mb-4">Panel de finanzas</h3>
      <ErrorBoundary>
        <Row>
          <Col md="3">
            <Nav
              vertical
              pills
              className="flex-column bg-light p-3 rounded shadow-sm sticky-top"
              style={{ top: "40px", zIndex: 1020 }}>
              {TABS.map((tab) => (
                <NavItem key={tab.key}>
                  <NavLink
                    active={activeTab === tab.key}
                    onClick={() => handleTabChange(tab.key)}
                    className="cursor-pointer">
                    {tab.label}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
          </Col>
          <Col md="9">
            <div className="p-4 bg-white rounded shadow-sm">
              {renderContent()}
            </div>
          </Col>
        </Row>
      </ErrorBoundary>
    </>
  );
}

export default FinanceDashboard;
