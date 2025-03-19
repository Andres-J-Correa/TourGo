import React, { useState, useEffect } from "react";
import { Row, Col, Table, Card } from "reactstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import { faEdit, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getMinimalById } from "services/hotelService";
import { toast } from "react-toastify";

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

const HotelLandingPage = () => {
  const [hotel, setHotel] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    getMinimalById(id)
      .then((res) => {
        if (res.isSuccessful) {
          setHotel(res.item);
        }
      })
      .catch((error) => {
        if (error.response.status !== 404) {
          toast.error("Hubo un error al cargar el hotel");
        }
      });
  }, [id]);

  return (
    <div className="container mt-4">
      {/* Header with Hotel Name and Edit Button */}
      <Row className="align-items-center mb-3">
        <Col>
          <h1 className="display-4">{hotel.name}</h1>
        </Col>
        <Col className="text-end">
          <Link
            className="btn btn-outline-dark"
            to={`/hotels/${id}/edit`}
            title="Editar Hotel">
            <FontAwesomeIcon icon={faEdit} size="lg" />
          </Link>
        </Col>
      </Row>

      {/* Navigation Buttons */}
      <Row className="mb-3">
        <Link
          className="w-auto me-2 btn btn-outline-dark"
          to={`/hotels/${id}/bookings/new`}>
          <FontAwesomeIcon icon={faPlus} /> Nueva Reserva
        </Link>
        <Link
          className="w-auto me-2 btn btn-outline-dark"
          to={`/hotels/${id}/bookings`}>
          Reservas
        </Link>
        <Link
          className="w-auto me-2 btn btn-outline-dark"
          to={`/hotels/${id}/rooms`}>
          Habitaciones
        </Link>
        <Link
          className="w-auto me-2 btn btn-outline-dark"
          to={`/hotels/${id}/customers`}>
          Clientes
        </Link>
        <Link
          className="w-auto me-2 btn btn-outline-dark"
          to={`/hotels/${id}/staff`}>
          Empleados
        </Link>
        <Link
          className="w-auto me-2 btn btn-outline-dark"
          to={`/hotels/${id}/finances`}>
          Finanzas
        </Link>
        <Link
          className="w-auto me-2 btn btn-outline-dark"
          to={`/hotels/${id}/extra-charges`}>
          Cargos Extra
        </Link>
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
    </div>
  );
};

export default HotelLandingPage;
