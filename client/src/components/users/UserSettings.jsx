import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Row, Col, Nav, NavItem, NavLink } from "reactstrap";
import { useAppContext } from "contexts/GlobalAppContext";
import EmailVerification from "components/users/EmailVerification";
import Breadcrumb from "components/commonUI/Breadcrumb";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import UserPasswordChange from "components/users/UserPasswordChange";

const tabComponents = {
  email: EmailVerification,
  password: UserPasswordChange,
  // Add more tabs here as needed
};

const validTabs = ["email", "password"];

const breadcrumbs = [
  { label: "Inicio", path: "/" },
  { label: "Perfil", path: "/profile" },
];

const UserSettingsView = () => {
  const { user } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = useMemo(
    () => new URLSearchParams(location.search).get("tab") || "email",
    [location.search]
  );

  const handleTabChange = (tab) => {
    const newTab = validTabs.includes(tab) ? tab : "email";
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
      return <Component user={user} />;
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
                  active={activeTab === "email"}
                  onClick={() => handleTabChange("email")}
                  className="cursor-pointer"
                  href="#">
                  Verificación de Email
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  active={activeTab === "password"}
                  onClick={() => handleTabChange("password")}
                  className="cursor-pointer"
                  href="#">
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
              {renderTabContent()}
            </div>
          </Col>
        </Row>
      </ErrorBoundary>
    </>
  );
};

export default UserSettingsView;
