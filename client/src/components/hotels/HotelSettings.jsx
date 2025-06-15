import React, { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Row, Col, Nav, NavItem, NavLink } from "reactstrap";
import { useAppContext } from "contexts/GlobalAppContext";
import HotelEdit from "components/hotels/HotelEdit";
import Breadcrumb from "components/commonUI/Breadcrumb";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import InvoicesTC from "components/hotels/InvoicesTC";

const tabComponents = {
  edit: HotelEdit,
  invoices: InvoicesTC,
  // Add more tabs here as needed
};

const validTabs = ["edit", "invoices"];

const HotelSettings = () => {
  const { user } = useAppContext();
  const location = useLocation();
  const { hotelId } = useParams();
  const navigate = useNavigate();

  const activeTab = useMemo(
    () => new URLSearchParams(location.search).get("tab") || "edit",
    [location.search]
  );

  const breadcrumbs = [
    { label: "Inicio", path: "/" },
    { label: "Hoteles", path: "/hotels" },
    { label: "Hotel", path: `/hotels/${hotelId}` },
  ];

  const handleTabChange = (tab) => {
    const newTab = validTabs.includes(tab) ? tab : "edit";
    const newParams = new URLSearchParams(location.search);
    newParams.set("tab", newTab);
    navigate({
      pathname: location.pathname,
      search: newParams.toString(),
    });
  };

  const renderTabContent = () => {
    const Component = tabComponents[activeTab];
    if (Component) {
      return <Component hotelId={hotelId} />;
    }
    return <div>Seleccione una opción 👈</div>;
  };

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} active="Configuración" />
      <ErrorBoundary>
        <LoadingOverlay isVisible={user.isLoading} />
        <Row className="min-vh-50">
          <Col md="3">
            <Nav
              vertical
              pills
              className="flex-column bg-light p-3 rounded shadow-sm sticky-top"
              style={{ top: "40px", zIndex: 1020 }}>
              <NavItem>
                <NavLink
                  active={activeTab === "edit"}
                  onClick={() => handleTabChange("edit")}
                  className="cursor-pointer">
                  Editar Hotel
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  active={activeTab === "invoices"}
                  onClick={() => handleTabChange("invoices")}
                  className="cursor-pointer">
                  T&C Facturas
                </NavLink>
              </NavItem>
            </Nav>
          </Col>
          <Col md="9">
            <div className="p-4 bg-white rounded shadow-sm">
              {renderTabContent()}
            </div>
          </Col>
        </Row>
      </ErrorBoundary>
    </>
  );
};

export default HotelSettings;
