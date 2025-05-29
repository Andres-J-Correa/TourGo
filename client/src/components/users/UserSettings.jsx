import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Row, Col, Nav, NavItem, NavLink } from "reactstrap";
import { useAppContext } from "contexts/GlobalAppContext";
import EmailVerification from "components/users/EmailVerification";
import Breadcrumb from "components/commonUI/Breadcrumb";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import ErrorBoundary from "components/commonUI/ErrorBoundary";

const breadcrumbs = [
  { label: "Inicio", path: "/" },
  { label: "Perfil", path: "/profile" },
];

const UserSettingsView = () => {
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState("");

  const location = useLocation();
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const renderContent = () => {
    switch (activeTab) {
      case "email":
        return <EmailVerification user={user} />;
      default:
        return <div>Seleccione una opción 👈</div>;
    }
  };

  useEffect(() => {
    const tabFromQuery = queryParams.get("tab");
    if (tabFromQuery) {
      setActiveTab(tabFromQuery);
    }
  }, [queryParams]);

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
              style={{ top: "80px", zIndex: 1020 }}>
              <NavItem>
                <NavLink
                  active={activeTab === "email"}
                  onClick={() => setActiveTab("email")}
                  href="#">
                  Verificación de Email
                </NavLink>
              </NavItem>
              {/* Placeholder for future menu items */}
              <NavItem>
                <NavLink href="#" disabled>
                  Cambiar Contraseña
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="#" disabled>
                  Preferencias de Notificaciones
                </NavLink>
              </NavItem>
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
};

export default UserSettingsView;
