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

const breadcrumbs = [
  { label: "Inicio", path: "/" },
  { label: "Hoteles", path: "/hotels" },
];

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
      : "Sin habitaciones";

  const handleLeaveHotel = async () => {
    const result = await Swal.fire({
      title: "¿Dejar este hotel?",
      text: "¿Estás seguro de que deseas dejar este hotel? Perderás acceso a su información.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, dejar hotel",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: "Procesando",
        text: "Por favor espera...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await leaveHotel(hotelId);
      if (res.isSuccessful) {
        Swal.fire({
          icon: "success",
          title: "Has dejado el hotel",
          text: "Ya no tienes acceso a este hotel.",
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
        title: "Error",
        text: "No se pudo dejar el hotel, intenta nuevamente.",
      });
    }
  };

  const handleCheckIn = useCallback(
    async (booking) => {
      let swalText = "Asegúrese de que el cliente ha llegado";
      let swalTitle = "¿Desea marcar la reserva como arribada?";
      let hasBalanceDue = booking.balanceDue > 0;
      if (hasBalanceDue) {
        swalText =
          "Esta reserva tiene un saldo pendiente. ¿Desea marcarla como arribada?";
        swalTitle = "Saldo pendiente!";
      }

      const result = await Swal.fire({
        title: swalTitle,
        text: swalText,
        icon: hasBalanceDue ? "warning" : "info",
        showCancelButton: true,
        confirmButtonText: "Sí, confirmar",
        cancelButtonText: "Cancelar",
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
          title: "Cargando...",
          text: "Por favor, espere.",
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
            title: "Éxito",
            text: "Reserva marcada como check-in",
            icon: "success",
            confirmButtonText: "Aceptar",
          });
        } else {
          throw new Error("Error al marcar como check-in");
        }
      } catch (error) {
        Swal.close();
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al marcar como check-in",
        });
      }
    },
    [hotelId]
  );

  const handleComplete = useCallback(
    async (booking) => {
      const result = await Swal.fire({
        title: "¿Desea marcar la reserva como completada?",
        text: "Ya no podrá editar la reserva",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, confirmar",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        confirmButtonColor: "green",
      });

      if (!result.isConfirmed) {
        return;
      }

      try {
        Swal.fire({
          title: "Cargando...",
          text: "Por favor, espere.",
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
            title: "Éxito",
            text: "Reserva marcada como completada",
            icon: "success",
            confirmButtonText: "Aceptar",
          });
        } else {
          throw new Error("Error al marcar como completada");
        }
      } catch (error) {
        Swal.close();
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al marcar como completada",
        });
      }
    },
    [hotelId]
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
      <Breadcrumb breadcrumbs={breadcrumbs} active="Hotel" />
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
                Dejar Hotel
              </Button>
            )}
          <div className="mb-4">
            <Label for="date-select" className="text-dark">
              Fecha
            </Label>
            <Input
              id="date-select"
              type="select"
              value={date}
              onChange={handleDateChange}
              className="w-auto">
              <option value={dateOptions.yesterday}>Ayer</option>
              <option value={dateOptions.today}>Hoy</option>
              <option value={dateOptions.tomorrow}>Mañana</option>
              <option value="more">Ver más fechas</option>
            </Input>
          </div>

          <Row className="mb-4">
            <Card>
              <CardBody>
                <h5>Reservas y Habitaciones</h5>

                {/* Tabs for Arrivals and Departures */}
                <Nav tabs className="mt-3">
                  <NavItem>
                    <NavLink
                      className={classnames({
                        active: activeTab === "arrivals",
                      })}
                      onClick={() => toggleTab("arrivals")}
                      style={{ cursor: "pointer" }}>
                      Llegadas
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({
                        active: activeTab === "departures",
                      })}
                      onClick={() => toggleTab("departures")}
                      style={{ cursor: "pointer" }}>
                      Salidas
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "stays" })}
                      onClick={() => toggleTab("stays")}
                      style={{ cursor: "pointer" }}>
                      Estancias
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "rooms" })}
                      onClick={() => toggleTab("rooms")}
                      style={{ cursor: "pointer" }}>
                      Habitaciones
                    </NavLink>
                  </NavItem>
                </Nav>
                <TabContent activeTab={activeTab} className="w-100 mt-3">
                  <TabPane tabId="arrivals">
                    {data.arrivals.length === 0 ? (
                      <div className="text-muted">
                        No hay llegadas para esta fecha.
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
                        No hay salidas para esta fecha.
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
                        No hay estancias para esta fecha.
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
                        <strong>Información</strong>
                        <p className="mb-0 text-dark">
                          Esta sección muestra habitaciones que se ocupan o
                          salen, incluyendo:
                        </p>
                        <ul>
                          <li>
                            Habitaciones con fechas de llegada o salida
                            diferentes a la de la reserva principal.
                          </li>
                          <li>Cambios de habitación.</li>
                        </ul>
                      </Col>

                      <Col md={6}>
                        <strong>Llegando</strong>
                        <ul>
                          {data.arrivingRooms?.length === 0 ? (
                            <li className="text-muted">Ninguna</li>
                          ) : (
                            data.arrivingRooms.map((item) => (
                              <li
                                key={`arriving-${item.room.id}-${item.bookingId}`}>
                                <strong>{item.room.name}</strong> —{" "}
                                {item.firstName} {item.lastName}{" "}
                                <Link
                                  to={`/hotels/${hotelId}/bookings/${item.bookingId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Ver detalles de la reserva">
                                  (Reserva # {item.bookingId})
                                </Link>
                              </li>
                            ))
                          )}
                        </ul>
                      </Col>
                      <Col md={6}>
                        <strong>Saliendo</strong>
                        <ul>
                          {data.departingRooms?.length === 0 ? (
                            <li className="text-muted">Ninguna</li>
                          ) : (
                            data.departingRooms.map((item) => (
                              <li
                                key={`departing-${item.room.id}-${item.bookingId}`}>
                                <strong>{item.room.name}</strong> —{" "}
                                {item.firstName} {item.lastName}{" "}
                                <Link
                                  to={`/hotels/${hotelId}/bookings/${item.bookingId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Ver detalles de la reserva">
                                  (Reserva # {item.bookingId})
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
