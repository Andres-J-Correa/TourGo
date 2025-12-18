import React, { useMemo } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Row, Col, Nav, NavItem, NavLink } from "reactstrap";
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
import { useLanguage } from "contexts/LanguageContext";
import BreadcrumbBuilder from "components/commonUI/BreadcrumbsBuilder";

const TABS = [
  { key: "balance", labelKey: "financialReports.dashboard.tabs.balance" },
  { key: "profitLoss", labelKey: "financialReports.dashboard.tabs.profitLoss" },
  { key: "revenue", labelKey: "financialReports.dashboard.tabs.revenue" },
  { key: "expenses", labelKey: "financialReports.dashboard.tabs.expenses" },
  {
    key: "revPAROverTime",
    labelKey: "financialReports.dashboard.tabs.revPAROverTime",
  },
  {
    key: "hotelOccupancyOverTime",
    labelKey: "financialReports.dashboard.tabs.hotelOccupancyOverTime",
  },
  {
    key: "roomOccupancy",
    labelKey: "financialReports.dashboard.tabs.roomOccupancy",
  },
  {
    key: "categoryPerformance",
    labelKey: "financialReports.dashboard.tabs.categoryPerformance",
  },
  {
    key: "subcategoryAnalysis",
    labelKey: "financialReports.dashboard.tabs.subcategoryAnalysis",
  },
  {
    key: "costToRevenueRatio",
    labelKey: "financialReports.dashboard.tabs.costToRevenueRatio",
  },
  {
    key: "utilityCostAnalysis",
    labelKey: "financialReports.dashboard.tabs.utilityCostAnalysis",
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
  const { t } = useLanguage();

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

  const breadcrumbs = useMemo(() => {
    return hotelId
      ? new BreadcrumbBuilder(t)
          .addHotel(hotelId)
          .addActive(t("financialReports.dashboard.title"))
          .build()
      : null;
  }, [hotelId, t]);

  const renderContent = () => {
    const Component = tabComponents[activeTab] || AccountBalancesReport;
    return <Component hotelId={hotelId} />;
  };

  return (
    <>
      {breadcrumbs}
      <h3 className="mb-4">{t("financialReports.dashboard.title")}</h3>
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
                    {t(tab.labelKey)}
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
