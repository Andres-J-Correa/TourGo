import React, { useState } from "react";
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
  const [activeTab, setActiveTab] = useState("email");

  const renderContent = () => {
    switch (activeTab) {
      case "email":
        return <EmailVerification user={user} />;
      default:
        return <div>Select an option</div>;
    }
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
              className="flex-column bg-light p-3 rounded shadow-sm">
              <NavItem>
                <NavLink
                  active={activeTab === "email"}
                  onClick={() => setActiveTab("email")}
                  href="#">
                  Email Verification
                </NavLink>
              </NavItem>
              {/* Placeholder for future menu items */}
              <NavItem>
                <NavLink href="#" disabled>
                  Change Password
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="#" disabled>
                  Notification Preferences
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
