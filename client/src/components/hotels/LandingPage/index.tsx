import React, { type JSX, useState, useMemo } from "react";
import {
  Row,
  Col,
  Card,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  CardBody,
  Button,
} from "reactstrap";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonWalkingLuggage } from "@fortawesome/free-solid-svg-icons";
import classnames from "classnames";

import { useAppContext } from "contexts/GlobalAppContext";
import { useLanguage } from "contexts/LanguageContext";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import BreadcrumbBuilder from "components/commonUI/BreadcrumbsBuilder";
import { HOTEL_ROLES_IDS } from "components/hotels/constants";
import "../HotelLandingPage.css"; // Reuse existing CSS

import { useHotelDashboard } from "./hooks/useHotelDashboard";
import { useHotelActions } from "./hooks/useHotelActions";
import DateFilter, { dateOptions } from "./components/DateFilter";
import ArrivalsPane from "./components/ArrivalsPane";
import DeparturesPane from "./components/DeparturesPane";
import StaysPane from "./components/StaysPane";
import RoomsPane from "./components/RoomsPane";

const HotelLandingPage = (): JSX.Element => {
  const [date, setDate] = useState(dateOptions.today);
  const [activeTab, setActiveTab] = useState("arrivals");

  const navigate = useNavigate();
  const { hotelId } = useParams();
  const { hotel } = useAppContext();
  const { t } = useLanguage();

  const { data, setData, loading } = useHotelDashboard(hotelId, date);
  const { handleCheckIn, handleComplete, handleLeaveHotel } = useHotelActions(
    hotelId,
    t,
    setData
  );

  const breadcrumbs = useMemo(
    () =>
      new BreadcrumbBuilder(t)
        .addHotels()
        .addActive(t("hotels.landing.breadcrumbActive"))
        .build(),
    [t]
  );

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "more") {
      navigate(`/hotels/${hotelId}/bookings`);
    } else {
      setDate(e.target.value);
    }
  };

  const toggleTab = (tab: string) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  return (
    <>
      <LoadingOverlay isVisible={hotel.isLoading || loading} />
      {breadcrumbs}
      <ErrorBoundary>
        <div className="hotel-landing-page">
          <Row className="align-items-center my-3">
            <Col>
              <h2>{hotel.current.name}</h2>
            </Col>
          </Row>
          {hotel.current.roleId !== HOTEL_ROLES_IDS.OWNER &&
            hotel.current.roleId !== 0 && (
              <Button
                className="float-end"
                color="dark"
                size="sm"
                onClick={handleLeaveHotel}>
                <FontAwesomeIcon
                  icon={faPersonWalkingLuggage}
                  className="me-2"
                />
                {t("hotels.landing.leaveHotel")}
              </Button>
            )}

          <DateFilter date={date} onDateChange={handleDateChange} />

          <Row className="mb-4">
            <Card>
              <CardBody>
                <h5>{t("hotels.landing.reservationsAndRooms")}</h5>

                <Nav tabs className="mt-3">
                  <NavItem>
                    <NavLink
                      className={classnames("cursor-pointer", {
                        active: activeTab === "arrivals",
                      })}
                      onClick={() => toggleTab("arrivals")}>
                      {t("hotels.landing.arrivals")}
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames("cursor-pointer", {
                        active: activeTab === "departures",
                      })}
                      onClick={() => toggleTab("departures")}>
                      {t("hotels.landing.departures")}
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames("cursor-pointer", {
                        active: activeTab === "stays",
                      })}
                      onClick={() => toggleTab("stays")}>
                      {t("hotels.landing.stays")}
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames("cursor-pointer", {
                        active: activeTab === "rooms",
                      })}
                      onClick={() => toggleTab("rooms")}>
                      {t("hotels.landing.rooms")}
                    </NavLink>
                  </NavItem>
                </Nav>
                <TabContent activeTab={activeTab} className="w-100 mt-3">
                  <TabPane tabId="arrivals">
                    <ArrivalsPane
                      arrivals={data.arrivals}
                      hotelId={hotelId}
                      handleCheckIn={handleCheckIn}
                    />
                  </TabPane>
                  <TabPane tabId="departures">
                    <DeparturesPane
                      departures={data.departures}
                      hotelId={hotelId}
                      handleComplete={handleComplete}
                    />
                  </TabPane>
                  <TabPane tabId="stays">
                    <StaysPane stays={data.stays} hotelId={hotelId} />
                  </TabPane>
                  <TabPane tabId="rooms">
                    <RoomsPane
                      arrivingRooms={data.arrivingRooms}
                      departingRooms={data.departingRooms}
                      forCleaningRooms={data.forCleaningRooms}
                      availableRooms={data.availableRooms}
                      hotelId={hotelId}
                    />
                  </TabPane>
                </TabContent>
              </CardBody>
            </Card>
          </Row>
        </div>
      </ErrorBoundary>
    </>
  );
};

export default HotelLandingPage;
