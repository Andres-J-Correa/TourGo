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
import {
  getByHotelId,
  add,
  updateById,
  deleteById,
} from "services/roomService";
import CustomField from "components/commonUI/forms/CustomField";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import Breadcrumb from "components/commonUI/Breadcrumb";
import { toast } from "react-toastify";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import { addValidationSchema } from "./constants";
import Swal from "sweetalert2";

const RoomsView = () => {
  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: "",
    capacity: "",
    description: "",
  });
  const [roomIdToDelete, setRoomIdToDelete] = useState(null);

  const { hotelId } = useParams();

  const breadcrumbs = [
    { label: "Inicio", path: "/" },
    { label: "Hoteles", path: "/hotels" },
    { label: "Hotel", path: `/hotels/${hotelId}` },
  ];

  const toggleForm = () => {
    let isHiding = showForm;
    setShowForm((prev) => !prev);
    if (isHiding) {
      setInitialValues({ name: "", capacity: "", description: "" });
    }
  };

  // Form Submission
  const handleSubmit = async (values) => {
    try {
      setIsUploading(true);
      if (values.id) {
        const res = await updateById(values, values.id);
        if (res.isSuccessful && res.item > 0) {
          const index = rooms.findIndex((room) => room.id === values.id);
          const newRooms = [...rooms];
          newRooms[index] = { ...values, id: res.item };
          setRooms(newRooms);
          setShowForm(false);
          toast.success("Habitación actualizada correctamente");
        }
      } else {
        const res = await add(values, hotelId);
        if (res.isSuccessful && res.item > 0) {
          setRooms((prev) => [...prev, { id: res.item, ...values }]);
          setShowForm(false);
          toast.success("Habitación agregada correctamente");
        }
      }
    } catch (error) {
      toast.error("Hubo un error al agregar la habitación");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditRoom = (room) => {
    setInitialValues(room);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteRoom = async (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsUploading(true);
          setRoomIdToDelete(id);
          const res = await deleteById(id);
          if (res.isSuccessful) {
            const newRooms = rooms.filter((room) => room.id !== id);
            setRooms(newRooms);
            toast.success("Habitación eliminada correctamente");
          }
        } catch (error) {
          toast.error("Hubo un error al eliminar la habitación");
        } finally {
          setIsUploading(false);
          setRoomIdToDelete(null);
        }
      }
    });
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
        <Card className="border-0 shadow-lg">
          <CardBody className="p-3">
            <CardTitle tag="h5">Nueva Habitación</CardTitle>
            <Formik
              initialValues={initialValues}
              validationSchema={addValidationSchema}
              onSubmit={handleSubmit}
              enableReinitialize>
              <Form>
                <ErrorAlert />

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
                    <div className="text-center">
                      <Button
                        disabled={isUploading}
                        type="submit"
                        className="btn bg-success text-white mb-3">
                        {isUploading ? (
                          <Spinner size="sm" color="light" />
                        ) : initialValues.id ? (
                          "Actualizar"
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
              showForm
                ? "btn bg-warning text-white my-4"
                : "btn bg-dark text-white my-4"
            }>
            {showForm ? "Esconder Formulario" : "Agregar Habitación"}
          </Button>
        </Col>
      </Row>
      {/* Room Cards Display */}
      <LoadingOverlay isVisible={isLoading} message="Cargando..." />
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
                  <Button
                    color="secondary"
                    outline
                    disabled={isUploading}
                    onClick={() => handleEditRoom(room)}>
                    Editar
                  </Button>

                  <Button
                    color="danger"
                    outline
                    disabled={isUploading}
                    onClick={() => handleDeleteRoom(room.id)}>
                    {isUploading && roomIdToDelete === room.id ? (
                      <Spinner size="sm" color="danger" />
                    ) : (
                      "Eliminar"
                    )}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default RoomsView;
