import React, { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Nav, NavItem, NavLink, Row, Col } from "reactstrap";
import Breadcrumb from "components/commonUI/Breadcrumb";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import StaffList from "components/staff/StaffList";
import StaffInvites from "components/staff/StaffInvites";
import StaffInviteForm from "components/staff/StaffInviteForm";
import StaffRolesPermissions from "components/staff/StaffRolesPermissions";

const tabComponents = {
  staff: StaffList,
  invites: StaffInvites,
  new: StaffInviteForm,
  roles: StaffRolesPermissions,
};

const validTabs = ["staff", "invites", "new", "roles"];

const StaffView = () => {
  const { hotelId } = useParams();

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
    { label: "Inicio", path: "/" },
    { label: "Hoteles", path: "/hotels" },
    { label: "Hotel", path: `/hotels/${hotelId}` },
  ];

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} active="Personal" />
      <h3>Personal</h3>
      <ErrorBoundary>
        <Row className="mt-4">
          <Col md="3">
            <Nav
              vertical
              pills
              className="flex-column bg-light p-3 rounded shadow-sm sticky-top"
              style={{ top: "80px", zIndex: 1020 }}>
              <NavItem>
                <NavLink
                  active={activeTab === "staff"}
                  onClick={() => handleTabChange("staff")}
                  className="cursor-pointer">
                  Listado
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  active={activeTab === "new"}
                  onClick={() => handleTabChange("new")}
                  className="cursor-pointer">
                  Invitar Personal
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  active={activeTab === "invites"}
                  onClick={() => handleTabChange("invites")}
                  className="cursor-pointer">
                  Invitaciones
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  active={activeTab === "roles"}
                  onClick={() => handleTabChange("roles")}
                  className="cursor-pointer">
                  Permisos de Roles
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
