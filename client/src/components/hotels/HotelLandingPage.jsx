import React, { useEffect, useState } from "react";
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
import Breadcrumb from "components/commonUI/Breadcrumb";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import { useAppContext } from "contexts/GlobalAppContext";
import {
  getArrivals,
  getDepartures,
  getArrivingRooms,
  getDepartingRooms,
  getStays,
} from "services/bookingService";
import { leaveHotel } from "services/staffService";
import { formatCurrency } from "utils/currencyHelper";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import classnames from "classnames";
import { faPersonWalkingLuggage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";

import { HOTEL_ROLES_IDS } from "components/hotels/constants";
import BookingStatusBadge from "components/bookings/BookingStatusBadge";
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
                      data.arrivals.map((arrival, i) => {
                        const { arrivingRooms, otherRooms } = arrival;
                        const arrivingRoomIds = new Set(
                          arrivingRooms.map((ar) => ar.id)
                        );
                        const filteredRooms =
                          otherRooms?.length > 0
                            ? otherRooms.filter(
                                (r) => !arrivingRoomIds.has(r.id)
                              )
                            : [];

                        return (
                          <div
                            key={`arrival-${arrival.id}-${i}`}
                            className={classnames(
                              "w-100 border-dark-subtle text-dark-subtle py-3",
                              {
                                "border-bottom": i < data.arrivals.length - 1,
                              }
                            )}>
                            <div>
                              <Row className="justify-content-between">
                                <Col md={5}>
                                  <strong>Reserva #:</strong> {arrival.id}
                                  <div className="ms-3 display-inline">
                                    <BookingStatusBadge
                                      statusId={arrival.statusId}
                                    />
                                  </div>
                                  <br />
                                  <strong>Cliente:</strong>{" "}
                                  {arrival.customer?.firstName}{" "}
                                  {arrival.customer?.lastName}
                                  <br />
                                  <strong>Teléfono:</strong>{" "}
                                  {arrival.customer?.phone || "N/A"}
                                  <br />
                                  <strong>Documento:</strong>{" "}
                                  {arrival.customer?.documentNumber || "N/A"}
                                </Col>
                                <Col>
                                  <strong>ID externa:</strong>{" "}
                                  {arrival.externalBookingId}
                                  <br />
                                  <strong>Proveedor:</strong>{" "}
                                  {arrival.bookingProviderName || "N/A"}
                                  <br />
                                  <strong>Total:</strong>{" "}
                                  {formatCurrency(arrival.total, "COP")}
                                  <br />
                                  <strong>Saldo:</strong>{" "}
                                  {formatCurrency(arrival.balanceDue, "COP")}
                                </Col>
                                <Col md="auto">
                                  <strong>Fecha de llegada:</strong>{" "}
                                  {dayjs(date).format("DD/MM/YYYY")}
                                  <br />
                                  <strong>Fecha de salida:</strong>{" "}
                                  {dayjs(date)
                                    .add(arrival.nights, "days")
                                    .format("DD/MM/YYYY")}
                                  <br />
                                  <strong>Noches:</strong> {arrival.nights}
                                </Col>
                              </Row>
                              {dayjs(arrival.eta).isValid() && (
                                <Row>
                                  <Col>
                                    <strong>Fecha y hora de llegada:</strong>{" "}
                                    {dayjs().format("DD/MM/YYYY h:mm")}
                                  </Col>
                                </Row>
                              )}
                              {arrival.notes && (
                                <Row>
                                  <strong>Notas:</strong>
                                  <p className="mb-0">{arrival.notes}</p>
                                </Row>
                              )}
                              <Row>
                                <Col md={5}>
                                  <strong>Habitaciones que llegan:</strong>{" "}
                                  <ul className="mb-0">
                                    {renderRooms(arrivingRooms)}
                                  </ul>
                                </Col>
                                <Col md={5}>
                                  <strong>
                                    Habitaciones que llegan otro día:
                                  </strong>{" "}
                                  <ul className="mb-0">
                                    {filteredRooms.length > 0
                                      ? renderRooms(filteredRooms)
                                      : "Ninguna"}
                                  </ul>
                                </Col>
                                <Col className="text-end align-content-end">
                                  <Link
                                    to={`/hotels/${hotelId}/bookings/${arrival.id}`}
                                    className="btn btn-outline-dark"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Ver detalles de la reserva">
                                    Ver Detalles
                                  </Link>
                                </Col>
                              </Row>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </TabPane>
                  <TabPane tabId="departures">
                    {data.departures.length === 0 ? (
                      <div className="text-muted">
                        No hay salidas para esta fecha.
                      </div>
                    ) : (
                      data.departures.map((departure, i) => (
                        <div
                          key={`departure-${departure.id}-${i}`}
                          className={classnames(
                            "w-100 border-dark-subtle py-3",
                            {
                              "border-bottom": i < data.departures.length - 1,
                            }
                          )}>
                          <div>
                            <Row className="justify-content-between">
                              <Col md={5}>
                                <strong>Reserva #:</strong> {departure.id}
                                <div className="ms-3 display-inline">
                                  <BookingStatusBadge
                                    statusId={departure.statusId}
                                  />
                                </div>
                                <br />
                                <strong>Cliente:</strong>{" "}
                                {departure.customer?.firstName}{" "}
                                {departure.customer?.lastName}
                                <br />
                                <strong>Teléfono:</strong>{" "}
                                {departure.customer?.phone || "N/A"}
                                <br />
                                <strong>Documento:</strong>{" "}
                                {departure.customer?.documentNumber || "N/A"}
                              </Col>
                              <Col>
                                <strong>ID externa:</strong>{" "}
                                {departure.externalBookingId}
                                <br />
                                <strong>Proveedor:</strong>{" "}
                                {departure.bookingProviderName || "N/A"}
                              </Col>
                              <Col md="auto">
                                <strong>Fecha de llegada:</strong>{" "}
                                {dayjs(date)
                                  .subtract(departure.nights, "days")
                                  .format("DD/MM/YYYY")}
                                <br />
                                <strong>Fecha de salida:</strong>{" "}
                                {dayjs(date).format("DD/MM/YYYY")}
                                <br />
                                <strong>Noches:</strong> {departure.nights}
                                <br />
                              </Col>
                            </Row>
                            <Row>
                              <Col md={5}>
                                <strong>Habitaciones que salen:</strong>{" "}
                                <ul className="mb-0">
                                  {renderRooms(departure.departingRooms)}
                                </ul>
                              </Col>
                              <Col>
                                {departure.notes && (
                                  <>
                                    <strong>Notas:</strong>
                                    <p className="mb-0">{departure.notes}</p>
                                  </>
                                )}
                              </Col>
                              <Col className="text-end align-content-end">
                                <Link
                                  to={`/hotels/${hotelId}/bookings/${departure.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-outline-dark"
                                  title="Ver detalles de la reserva">
                                  Ver Detalles
                                </Link>
                              </Col>
                            </Row>
                          </div>
                        </div>
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
                        <div
                          key={`stays-${stay.id}-${i}`}
                          className={classnames(
                            "w-100 border-dark-subtle py-3",
                            {
                              "border-bottom": i < data.stays.length - 1,
                            }
                          )}>
                          <div>
                            <Row className="justify-content-between">
                              <Col md={5}>
                                <strong>Reserva #:</strong> {stay.id}
                                <div className="ms-3 display-inline">
                                  <BookingStatusBadge
                                    statusId={stay.statusId}
                                  />
                                </div>
                                <br />
                                <strong>Cliente:</strong>{" "}
                                {stay.customer?.firstName}{" "}
                                {stay.customer?.lastName}
                                <br />
                                <strong>Teléfono:</strong>{" "}
                                {stay.customer?.phone || "N/A"}
                                <br />
                                <strong>Documento:</strong>{" "}
                                {stay.customer?.documentNumber || "N/A"}
                              </Col>
                              <Col>
                                <strong>ID externa:</strong>{" "}
                                {stay.externalBookingId}
                                <br />
                                <strong>Proveedor:</strong>{" "}
                                {stay.bookingProviderName || "N/A"}
                              </Col>
                              <Col md="auto">
                                <strong>Fecha de llegada:</strong>{" "}
                                {dayjs(stay.arrivalDate).format("DD/MM/YYYY")}
                                <br />
                                <strong>Fecha de salida:</strong>{" "}
                                {dayjs(stay.departureDate).format("DD/MM/YYYY")}
                                <br />
                                <strong>Noches:</strong> {stay.nights}
                                <br />
                              </Col>
                            </Row>
                            <Row>
                              <Col md={5}>
                                <strong>Habitaciones ocupadas:</strong>{" "}
                                <ul className="mb-0">
                                  {renderRooms(stay.rooms)}
                                </ul>
                              </Col>
                              <Col>
                                {stay.notes && (
                                  <>
                                    <strong>Notas:</strong>
                                    <p className="mb-0">{stay.notes}</p>
                                  </>
                                )}
                              </Col>
                              <Col className="text-end align-content-end">
                                <Link
                                  to={`/hotels/${hotelId}/bookings/${stay.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-outline-dark"
                                  title="Ver detalles de la reserva">
                                  Ver Detalles
                                </Link>
                              </Col>
                            </Row>
                          </div>
                        </div>
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
