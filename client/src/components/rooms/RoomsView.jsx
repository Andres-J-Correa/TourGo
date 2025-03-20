import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Row,
  Col,
  Spinner,
} from "reactstrap";
import { Formik, Form } from "formik";
import { getByHotelId, add } from "services/roomService";
import CustomField from "components/commonUI/forms/CustomField";
import SimpleLoader from "components/commonUI/loaders/SimpleLoader";
import Breadcrumb from "components/commonUI/Breadcrumb";
import { toast } from "react-toastify";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import { addValidationSchema } from "./constants";

const RoomsView = () => {
  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { hotelId } = useParams();

  const breadcrumbs = [
    { label: "Inicio", path: "/" },
    { label: "Hoteles", path: "/hotels" },
    { label: "Hotel", path: `/hotels/${hotelId}` },
  ];

  const toggleForm = () => setShowForm((prev) => !prev);

  // Form Submission
  const handleAddRoom = async (values) => {
    try {
      setIsUploading(true);
      const res = await add(values, hotelId);
      if (res.isSuccessful && res.item > 0) {
        setRooms((prev) => [...prev, { id: res.item, ...values }]);
        setShowForm(false);
        toast.success("Habitación agregada correctamente");
      }
    } catch (error) {
      toast.error("Hubo un error al agregar la habitación");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    getByHotelId(hotelId)
      .then((res) => {
        if (res.isSuccessful) {
          setRooms(res.items);
        }
      })
      .catch((err) => {
        if (err?.response?.status !== 404) {
          toast.error("Hubo un error al cargar las habitaciones");
        }
      })
      .finally(() => setIsLoading(false));
  }, [hotelId]);

  return (
    <div className="container mt-4">
      <Breadcrumb breadcrumbs={breadcrumbs} active="Habitaciones" />
      <Row>
        <h1>Habitaciones</h1>
      </Row>
      {/* Add Room Form */}
      {showForm && (
        <Card className="mb-4 border-0 shadow-lg">
          <CardBody className="p-3">
            <CardTitle tag="h5">Nueva Habitación</CardTitle>
            <Formik
              initialValues={{ name: "", capacity: "", description: "" }}
              validationSchema={addValidationSchema}
              onSubmit={handleAddRoom}>
              <Form>
                <Row>
                  <Col md="3">
                    <CustomField
                      name="name"
                      type="text"
                      className="form-control"
                      placeholder="Nombre de la habitación"
                    />
                  </Col>
                  <Col md="3">
                    <CustomField
                      name="capacity"
                      type="number"
                      className="form-control"
                      placeholder="Capacidad"
                    />
                  </Col>
                  <Col md="3">
                    <CustomField
                      name="description"
                      type="text"
                      className="form-control"
                      placeholder="Descripción"
                    />
                  </Col>
                  <Col md="3" className="align-content-center">
                    <ErrorAlert />
                    <div className="text-center">
                      <Button
                        disabled={isUploading}
                        type="submit"
                        className="btn bg-success text-white">
                        {isUploading ? (
                          <Spinner size="sm" color="light" />
                        ) : (
                          "Agregar"
                        )}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </Formik>
          </CardBody>
        </Card>
      )}
      <Row>
        <Col>
          <Button
            onClick={toggleForm}
            disabled={isUploading}
            className={
              showForm ? "btn bg-warning text-white" : "btn bg-dark text-white"
            }>
            {showForm ? "Esconder Formulario" : "Agregar Habitación"}
          </Button>
        </Col>
      </Row>
      {/* Room Cards Display */}
      {isLoading ? (
        <SimpleLoader />
      ) : (
        <Row>
          {rooms.map((room) => (
            <Col md="3" key={room.id} className="mb-4">
              <Card className="h-100 d-flex flex-column">
                <CardBody className="d-flex flex-column">
                  <CardTitle tag="h5">{room.name}</CardTitle>
                  <CardText className="flex-grow-1">
                    <strong>Capacidad:</strong> {room.capacity} personas
                    <br />
                    <strong>Descripción:</strong> {room.description}
                  </CardText>
                  <div className="d-flex justify-content-between mt-auto">
                    <Button color="primary">Editar</Button>
                    <Button color="danger">Eliminar</Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default RoomsView;
