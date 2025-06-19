import React, { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Nav, NavItem, NavLink, Row, Col } from "reactstrap";
import Breadcrumb from "components/commonUI/Breadcrumb";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import StaffList from "components/staff/StaffList";
import StaffInvites from "components/staff/StaffInvites";
import StaffInviteForm from "components/staff/StaffInviteForm";
import StaffRolesPermissions from "components/staff/StaffRolesPermissions";
import { useLanguage } from "contexts/LanguageContext";

const tabComponents = {
  staff: StaffList,
  invites: StaffInvites,
  new: StaffInviteForm,
  roles: StaffRolesPermissions,
};

const validTabs = ["staff", "invites", "new", "roles"];

const StaffView = () => {
  const { hotelId } = useParams();
  const { t } = useLanguage();

  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = useMemo(
    () => new URLSearchParams(location.search).get("tab") || "staff",
    [location.search]
  );

  const handleTabChange = (tab) => {
    const newTab = validTabs.includes(tab) ? tab : "staff";
    const newParams = new URLSearchParams(location.search);
    newParams.set("tab", newTab);
    navigate({
      pathname: location.pathname,
      search: newParams.toString(),
    });
  };

  const renderTabContent = () => {
    const Component = tabComponents[activeTab] || StaffList;
    return <Component />;
  };

  const breadcrumbs = [
    { label: t("staff.view.breadcrumbs.home"), path: "/" },
    { label: t("staff.view.breadcrumbs.hotels"), path: "/hotels" },
    { label: t("staff.view.breadcrumbs.hotel"), path: `/hotels/${hotelId}` },
  ];

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} active={t("staff.view.title")} />
      <h3>{t("staff.view.title")}</h3>
      <ErrorBoundary>
        <Row className="mt-4">
          <Col md="3">
            <Nav
              vertical
              pills
              className="flex-column bg-light p-3 rounded shadow-sm sticky-top"
              style={{ top: "40px", zIndex: 1020 }}>
              <NavItem>
                <NavLink
                  active={activeTab === "staff"}
                  onClick={() => handleTabChange("staff")}
                  className="cursor-pointer">
                  {t("staff.view.tabs.list")}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  active={activeTab === "new"}
                  onClick={() => handleTabChange("new")}
                  className="cursor-pointer">
                  {t("staff.view.tabs.invite")}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  active={activeTab === "invites"}
                  onClick={() => handleTabChange("invites")}
                  className="cursor-pointer">
                  {t("staff.view.tabs.invites")}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  active={activeTab === "roles"}
                  onClick={() => handleTabChange("roles")}
                  className="cursor-pointer">
                  {t("staff.view.tabs.roles")}
                </NavLink>
              </NavItem>
            </Nav>
          </Col>
          <Col md="9">{renderTabContent()}</Col>
        </Row>
      </ErrorBoundary>
    </>
  );
};

export default StaffView;
