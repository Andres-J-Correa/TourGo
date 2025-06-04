import React, { useMemo } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Row, Col, Nav, NavItem, NavLink } from "reactstrap";
import Breadcrumb from "components/commonUI/Breadcrumb";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import AccountBalancesReport from "components/financial-reports/AccountBalancesReport";
import ProfitAndLossReport from "./ProfitAndLossReport";
import RevenueBreakdownReport from "./RevenueBreakdownReport";
import ExpenseBreakdownReport from "./ExpenseBreakdownReport";
import CategoryPerformanceOverTimeReport from "components/financial-reports/CategoryPerformanceOverTimeReport";
import SubcategoryAnalysisReport from "components/financial-reports/SubcategoryAnalysisReport";
import CostToRevenueRatioReport from "components/financial-reports/CostToRevenueRatioReport";
import UtilityCostAnalysisReport from "components/financial-reports/UtilityCostAnalysisReport";

const TABS = [
  { key: "balance", label: "Balance en cuentas" },
  { key: "profitLoss", label: "Resumen de Ganancias y Pérdidas" },
  { key: "revenue", label: "Desglose de Ingresos" },
  { key: "expenses", label: "Desglose de Gastos" },
  {
    key: "categoryPerformance",
    label: "Desempeño de Categoría a lo Largo del Tiempo",
  },
  { key: "subcategoryAnalysis", label: "Análisis por Subcategoría" },
  { key: "costToRevenueRatio", label: "Ratio de Costo a Ingreso" },
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
                    className="cursor-pointer"
                    href="#">
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
