import React from "react";
import { Row, Col, Table, Card } from "reactstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Breadcrumb from "components/commonUI/Breadcrumb";
import { useAppContext } from "contexts/GlobalAppContext";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";

// Sample data for demonstration
const reservationsToday = [
  {
    id: 1,
    guest: "Juan Pérez",
    room: "101",
    amountDue: "$200",
    eta: "14:00",
    arrived: false,
  },
  {
    id: 2,
    guest: "María López",
    room: "202",
    amountDue: "$350",
    eta: null,
    arrived: false,
  },
];

const departuresToday = [
  {
    id: 3,
    guest: "Carlos Gómez",
    room: "305",
    note: "Solicitó transporte",
    departed: false,
  },
  { id: 4, guest: "Ana Martínez", room: "401", note: null, departed: false },
];

const todoList = [
  "Verificar inventario de limpieza",
  "Confirmar llegada del proveedor de alimentos",
  "Preparar facturas para las salidas del día",
];

const breadcrumbs = [
  { label: "Inicio", path: "/" },
  { label: "Hoteles", path: "/hotels" },
];

const HotelLandingPage = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const { hotel } = useAppContext();

  return (
    <>
      <LoadingOverlay isVisible={hotel.isLoading} />
      <Breadcrumb breadcrumbs={breadcrumbs} active="Hotel" />
      {/* Header with Hotel Name and Edit Button */}
      <Row className="align-items-center mb-3">
        <Col>
          <h1 className="display-4">{hotel.current.name}</h1>
        </Col>
        <Col className="text-end">
          <Link
            className="btn btn-outline-dark"
            to={`/hotels/${hotelId}/edit`}
            title="Editar Hotel">
            <FontAwesomeIcon icon={faEdit} size="lg" />
          </Link>
        </Col>
      </Row>

      {/* Panel with Reservations */}
      <Row>
        <Col md="6">
          <Card body>
            <h5 className="mb-3">Reservas que llegan hoy</h5>
            <Table bordered>
              <thead>
                <tr>
                  <th>Huésped</th>
                  <th>Habitación</th>
                  <th>Deuda</th>
                  <th>Hora Estimada</th>
                  <th>¿Llegó?</th>
                </tr>
              </thead>
              <tbody>
                {reservationsToday.map((res) => (
                  <tr
                    key={res.id}
                    onClick={() => navigate(`/bookings/${res.id}`)}
                    style={{ cursor: "pointer" }}>
                    <td>{res.guest}</td>
                    <td>{res.room}</td>
                    <td>{res.amountDue}</td>
                    <td>{res.eta || "N/A"}</td>
                    <td>
                      <input type="checkbox" checked={res.arrived} readOnly />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>

        <Col md="6">
          <Card body>
            <h5 className="mb-3">Reservas que salen hoy</h5>
            <Table bordered>
              <thead>
                <tr>
                  <th>Huésped</th>
                  <th>Habitación</th>
                  <th>Nota</th>
                  <th>¿Salió?</th>
                </tr>
              </thead>
              <tbody>
                {departuresToday.map((dep) => (
                  <tr key={dep.id}>
                    <td>{dep.guest}</td>
                    <td>{dep.room}</td>
                    <td>{dep.note || "N/A"}</td>
                    <td>
                      <input type="checkbox" checked={dep.departed} readOnly />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>

      {/* To-Do List */}
      <Card body className="mt-4">
        <h5 className="mb-3">Lista de Tareas</h5>
        <ul>
          {todoList.map((task, index) => (
            <li key={index}>{task}</li>
          ))}
        </ul>
      </Card>
    </>
  );
};

export default HotelLandingPage;
