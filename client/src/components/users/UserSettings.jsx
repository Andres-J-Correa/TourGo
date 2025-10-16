import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Row, Col, Nav, NavItem, NavLink } from "reactstrap";
import { useAppContext } from "contexts/GlobalAppContext";
import EmailVerification from "components/users/EmailVerification";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import UserPasswordChange from "components/users/UserPasswordChange";
import { useLanguage } from "contexts/LanguageContext";
import BreadcrumbBuilder from "components/commonUI/BreadcrumbsBuilder";

const tabComponents = {
  email: EmailVerification,
  password: UserPasswordChange,
  // Add more tabs here as needed
};

const validTabs = ["email", "password"];

const UserSettingsView = () => {
  const { user } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const breadcrumbs = useMemo(
    () =>
      new BreadcrumbBuilder(t)
        .addUserProfile()
        .addActive(t("users.accountDropdown.settings"))
        .build(),
    [t]
  );

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
    return <div>{t("users.settings.selectOption")}</div>;
  };

  return (
    <>
      {breadcrumbs}
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
                  className="cursor-pointer">
                  {t("users.settings.emailVerification")}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  active={activeTab === "password"}
                  onClick={() => handleTabChange("password")}
                  className="cursor-pointer">
                  {t("users.settings.changePassword")}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink disabled>
                  {t("users.settings.notificationPreferences")}
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
