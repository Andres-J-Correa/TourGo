import React, { useCallback, useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Input,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Label,
  CardBody,
  Button,
} from "reactstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "contexts/GlobalAppContext";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import classnames from "classnames";
import { faPersonWalkingLuggage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";

import { useLanguage } from "contexts/LanguageContext";

import Breadcrumb from "components/commonUI/Breadcrumb";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import BookingDeparture from "components/bookings/BookingDeparture";
import BookingArrival from "components/bookings/BookingArrival";
import BookingStay from "components/bookings/BookingStay";

import {
  getArrivals,
  getDepartures,
  getArrivingRooms,
  getDepartingRooms,
  getStays,
  updateStatusToCheckedIn,
  updateStatusToCompleted,
} from "services/bookingService";
import { leaveHotel } from "services/staffService";
import { HOTEL_ROLES_IDS } from "components/hotels/constants";
import { BOOKING_STATUS_IDS } from "components/bookings/constants";
import "./HotelLandingPage.css";

const dateOptions = {
  yesterday: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
  today: dayjs().format("YYYY-MM-DD"),
  tomorrow: dayjs().add(1, "day").format("YYYY-MM-DD"),
};

const HotelLandingPage = () => {
  const [data, setData] = useState({
    arrivals: [],
    departures: [],
    arrivingRooms: [],
    departingRooms: [],
    stays: [],
  });
  const [date, setDate] = useState(dateOptions.today);
  const [loadingArrivalsDepartures, setLoadingArrivalsDepartures] =
    useState(false);
  const [activeTab, setActiveTab] = useState("arrivals");

  const navigate = useNavigate();

  const { hotelId } = useParams();
  const { hotel } = useAppContext();
  const { t } = useLanguage();

  const breadcrumbs = [
    { label: t("hotels.breadcrumbs.home"), path: "/" },
    { label: t("hotels.breadcrumbs.hotels"), path: "/hotels" },
  ];

  const handleDateChange = (e) => {
    if (e.target.value === "more") {
      navigate(`/hotels/${hotelId}/bookings`);
    } else {
      setDate(e.target.value);
    }
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  // Helper to render room names separated by " - "
  const renderRooms = (rooms) =>
    rooms && rooms.length > 0
      ? rooms.map((r) => (
          <li key={r.id} className="mb-1">
            {r.name}
          </li>
        ))
      : t("hotels.landing.noRooms");

  const handleLeaveHotel = async () => {
    const result = await Swal.fire({
      title: t("hotels.landing.leaveTitle"),
      text: t("hotels.landing.leaveText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("hotels.landing.leaveConfirm"),
      cancelButtonText: t("hotels.landing.cancel"),
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: t("hotels.landing.processing"),
        text: t("hotels.landing.pleaseWait"),
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await leaveHotel(hotelId);
      if (res.isSuccessful) {
        Swal.fire({
          icon: "success",
          title: t("hotels.landing.leftTitle"),
          text: t("hotels.landing.leftText"),
          timer: 1500,
          showConfirmButton: false,
          allowOutsideClick: false,
        });
        navigate("/hotels");
      }
    } catch {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: t("common.error"),
        text: t("hotels.landing.leaveError"),
      });
    }
  };

  const handleCheckIn = useCallback(
    async (booking) => {
      let swalText = t("hotels.landing.checkInText");
      let swalTitle = t("hotels.landing.checkInTitle");
      let hasBalanceDue = booking.balanceDue > 0;
      if (hasBalanceDue) {
        swalText = t("hotels.landing.checkInBalanceDueText");
        swalTitle = t("hotels.landing.checkInBalanceDueTitle");
      }

      const result = await Swal.fire({
        title: swalTitle,
        text: swalText,
        icon: hasBalanceDue ? "warning" : "info",
        showCancelButton: true,
        confirmButtonText: t("hotels.landing.confirmYes"),
        cancelButtonText: t("hotels.landing.cancel"),
        reverseButtons: hasBalanceDue,
        confirmButtonColor: hasBalanceDue ? "red" : "#0d6efd",
        didOpen: () => {
          if (hasBalanceDue) {
            Swal.getConfirmButton().style.display = "none";
            Swal.showLoading();
            setTimeout(() => {
              if (Swal.isVisible()) {
                Swal.getConfirmButton().style.display = "inline-block";
                Swal.hideLoading();
              }
            }, 2000);
          }
        },
      });

      if (!result.isConfirmed) {
        return;
      }

      try {
        Swal.fire({
          title: t("hotels.landing.loading"),
          text: t("hotels.landing.pleaseWait"),
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const res = await updateStatusToCheckedIn(booking.id, hotelId);
        if (res.isSuccessful) {
          setData((prevData) => ({
            ...prevData,
            arrivals: prevData.arrivals.map((arrival) =>
              arrival.id === booking.id
                ? { ...arrival, statusId: BOOKING_STATUS_IDS.ARRIVED }
                : arrival
            ),
          }));

          Swal.fire({
            title: t("hotels.landing.success"),
            text: t("hotels.landing.checkInSuccess"),
            icon: "success",
            confirmButtonText: t("hotels.landing.ok"),
          });
        } else {
          throw new Error("Error al marcar como check-in");
        }
      } catch (error) {
        Swal.close();
        await Swal.fire({
          icon: "error",
          title: t("common.error"),
          text: t("hotels.landing.checkInError"),
        });
      }
    },
    [hotelId, t]
  );

  const handleComplete = useCallback(
    async (booking) => {
      const result = await Swal.fire({
        title: t("hotels.landing.completeTitle"),
        text: t("hotels.landing.completeText"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t("hotels.landing.confirmYes"),
        cancelButtonText: t("hotels.landing.cancel"),
        reverseButtons: true,
        confirmButtonColor: "green",
      });

      if (!result.isConfirmed) {
        return;
      }

      try {
        Swal.fire({
          title: t("hotels.landing.loading"),
          text: t("hotels.landing.pleaseWait"),
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const res = await updateStatusToCompleted(booking.id, hotelId);
        if (res.isSuccessful) {
          setData((prevData) => ({
            ...prevData,
            departures: prevData.departures.map((departure) =>
              departure.id === booking.id
                ? { ...departure, statusId: BOOKING_STATUS_IDS.COMPLETED }
                : departure
            ),
          }));

          Swal.fire({
            title: t("hotels.landing.success"),
            text: t("hotels.landing.completeSuccess"),
            icon: "success",
            confirmButtonText: t("hotels.landing.ok"),
          });
        } else {
          throw new Error("Error al marcar como completada");
        }
      } catch (error) {
        Swal.close();
        await Swal.fire({
          icon: "error",
          title: t("common.error"),
          text: t("hotels.landing.completeError"),
        });
      }
    },
    [hotelId, t]
  );

  useEffect(() => {
    setLoadingArrivalsDepartures(true);

    Promise.allSettled([
      getArrivals(hotelId, date),
      getDepartures(hotelId, date),
      getArrivingRooms(hotelId, date),
      getDepartingRooms(hotelId, date),
      getStays(hotelId, date),
    ])
      .then(
        ([
          arrivalsResult,
          departuresResult,
          arrivingRoomsResult,
          departingRoomsResult,
          staysResult,
        ]) => {
          const errors = [];
          let arrivals = [];
          let departures = [];
          let arrivingRooms = [];
          let departingRooms = [];
          let stays = [];

          if (arrivalsResult.status === "fulfilled") {
            arrivals = arrivalsResult.value?.items || [];
          } else if (arrivalsResult.reason?.response?.status !== 404) {
            errors.push("Error al cargar llegadas de hoy");
          }

          if (departuresResult.status === "fulfilled") {
            departures = departuresResult.value?.items || [];
          } else if (departuresResult.reason?.response?.status !== 404) {
            errors.push("Error al cargar salidas de hoy");
          }

          if (arrivingRoomsResult.status === "fulfilled") {
            arrivingRooms = arrivingRoomsResult.value?.items || [];
          } else if (arrivingRoomsResult.reason?.response?.status !== 404) {
            errors.push("Error al cargar habitaciones que llegan hoy");
          }

          if (departingRoomsResult.status === "fulfilled") {
            departingRooms = departingRoomsResult.value?.items || [];
          } else if (departingRoomsResult.reason?.response?.status !== 404) {
            errors.push("Error al cargar habitaciones que salen hoy");
          }

          if (staysResult.status === "fulfilled") {
            stays = staysResult.value?.items || [];
          } else if (staysResult.reason?.response?.status !== 404) {
            errors.push("Error al cargar estancias de hoy");
          }

          setData({
            arrivals,
            departures,
            arrivingRooms,
            departingRooms,
            stays,
          });

          if (errors.length > 0) {
            toast.error(errors.join(" | "));
          }
        }
      )
      .finally(() => {
        setLoadingArrivalsDepartures(false);
      });
  }, [hotelId, date]);

  return (
    <>
      <LoadingOverlay
        isVisible={hotel.isLoading || loadingArrivalsDepartures}
      />
      <Breadcrumb
        breadcrumbs={breadcrumbs}
        active={t("hotels.landing.breadcrumbActive")}
      />
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
          <div className="mb-4">
            <Label for="date-select" className="text-dark">
              {t("hotels.landing.date")}
            </Label>
            <Input
              id="date-select"
              type="select"
              value={date}
              onChange={handleDateChange}
              className="w-auto">
              <option value={dateOptions.yesterday}>
                {t("hotels.landing.yesterday")}
              </option>
              <option value={dateOptions.today}>
                {t("hotels.landing.today")}
              </option>
              <option value={dateOptions.tomorrow}>
                {t("hotels.landing.tomorrow")}
              </option>
              <option value="more">{t("hotels.landing.moreDates")}</option>
            </Input>
          </div>

          <Row className="mb-4">
            <Card>
              <CardBody>
                <h5>{t("hotels.landing.reservationsAndRooms")}</h5>

                {/* Tabs for Arrivals and Departures */}
                <Nav tabs className="mt-3">
                  <NavItem>
                    <NavLink
                      className={classnames({
                        active: activeTab === "arrivals",
                      })}
                      onClick={() => toggleTab("arrivals")}
                      style={{ cursor: "pointer" }}>
                      {t("hotels.landing.arrivals")}
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({
                        active: activeTab === "departures",
                      })}
                      onClick={() => toggleTab("departures")}
                      style={{ cursor: "pointer" }}>
                      {t("hotels.landing.departures")}
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "stays" })}
                      onClick={() => toggleTab("stays")}
                      style={{ cursor: "pointer" }}>
                      {t("hotels.landing.stays")}
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "rooms" })}
                      onClick={() => toggleTab("rooms")}
                      style={{ cursor: "pointer" }}>
                      {t("hotels.landing.rooms")}
                    </NavLink>
                  </NavItem>
                </Nav>
                <TabContent activeTab={activeTab} className="w-100 mt-3">
                  <TabPane tabId="arrivals">
                    {data.arrivals.length === 0 ? (
                      <div className="text-muted">
                        {t("hotels.landing.noArrivals")}
                      </div>
                    ) : (
                      data.arrivals.map((arrival, i) => (
                        <BookingArrival
                          key={`arrival-${arrival.id}-${i}`}
                          arrival={arrival}
                          hotelId={hotelId}
                          handleCheckIn={handleCheckIn}
                          hasBottomBorder={i < data.arrivals.length - 1}
                          renderRooms={renderRooms}
                        />
                      ))
                    )}
                  </TabPane>
                  <TabPane tabId="departures">
                    {data.departures.length === 0 ? (
                      <div className="text-muted">
                        {t("hotels.landing.noDepartures")}
                      </div>
                    ) : (
                      data.departures.map((departure, i) => (
                        <BookingDeparture
                          key={`departure-${departure.id}-${i}`}
                          departure={departure}
                          hotelId={hotelId}
                          handleComplete={handleComplete}
                          hasBottomBorder={i < data.departures.length - 1}
                          renderRooms={renderRooms}
                        />
                      ))
                    )}
                  </TabPane>
                  <TabPane tabId="stays">
                    {data.stays.length === 0 ? (
                      <div className="text-muted">
                        {t("hotels.landing.noStays")}
                      </div>
                    ) : (
                      data.stays.map((stay, i) => (
                        <BookingStay
                          key={`stay-${stay.id}-${i}`}
                          stay={stay}
                          hotelId={hotelId}
                          hasBottomBorder={i < data.stays.length - 1}
                          renderRooms={renderRooms}
                        />
                      ))
                    )}
                  </TabPane>
                  <TabPane tabId="rooms">
                    <Row className="mb-4">
                      <Col md={12}>
                        <strong>{t("hotels.landing.infoTitle")}</strong>
                        <p className="mb-0 text-dark">
                          {t("hotels.landing.infoText")}
                        </p>
                        <ul>
                          <li>{t("hotels.landing.infoArrivingOrDeparting")}</li>
                          <li>{t("hotels.landing.infoRoomChanges")}</li>
                        </ul>
                      </Col>

                      <Col md={6}>
                        <strong>{t("hotels.landing.arriving")}</strong>
                        <ul>
                          {data.arrivingRooms?.length === 0 ? (
                            <li className="text-muted">
                              {t("hotels.landing.none")}
                            </li>
                          ) : (
                            data.arrivingRooms.map((item) => (
                              <li
                                key={`arriving-${item.room.id}-${item.bookingId}`}>
                                <strong>{item.room.name}</strong> —{" "}
                                {item.firstName} {item.lastName}{" "}
                                <Link
                                  to={`/hotels/${hotelId}/bookings/${item.bookingId}`}
                                  title={t(
                                    "hotels.landing.viewBookingDetails"
                                  )}>
                                  {t("hotels.landing.bookingNumber", {
                                    bookingId: item.bookingId,
                                  })}
                                </Link>
                              </li>
                            ))
                          )}
                        </ul>
                      </Col>
                      <Col md={6}>
                        <strong>{t("hotels.landing.departing")}</strong>
                        <ul>
                          {data.departingRooms?.length === 0 ? (
                            <li className="text-muted">
                              {t("hotels.landing.none")}
                            </li>
                          ) : (
                            data.departingRooms.map((item) => (
                              <li
                                key={`departing-${item.room.id}-${item.bookingId}`}>
                                <strong>{item.room.name}</strong> —{" "}
                                {item.firstName} {item.lastName}{" "}
                                <Link
                                  to={`/hotels/${hotelId}/bookings/${item.bookingId}`}
                                  title={t(
                                    "hotels.landing.viewBookingDetails"
                                  )}>
                                  {t("hotels.landing.bookingNumber", {
                                    bookingId: item.bookingId,
                                  })}
                                </Link>
                              </li>
                            ))
                          )}
                        </ul>
                      </Col>
                    </Row>
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
