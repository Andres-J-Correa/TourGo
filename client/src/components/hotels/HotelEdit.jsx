import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Row, Col, Spinner } from "reactstrap";
import { Formik, Form } from "formik";
import CustomField from "components/commonUI/forms/CustomField";
import { getDetailsById, updateById, deleteById } from "services/hotelService";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import Breadcrumb from "components/commonUI/Breadcrumb";
import { addValidationSchema } from "./constants";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const HotelEdit = () => {
  const { hotelId } = useParams();
  const [hotel, setHotel] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const navigate = useNavigate();

  const breadcrumbs = [
    { label: "Inicio", path: "/" },
    { label: "Hoteles", path: "/hotels" },
    { label: "Hotel", path: `/hotels/${hotelId}` },
  ];

  // Handles form cancel action
  const handleCancel = (resetForm) => {
    resetForm();
    setIsEditing(false);
  };

  const updateHotel = (values) => {
    setIsUploading(true);
    updateById(values, hotelId)
      .then((res) => {
        if (res.isSuccessful) {
          setHotel((prev) => ({ ...prev, ...values }));
          toast.success("Hotel actualizado con éxito");
          setIsEditing(false);
        }
      })
      .catch(() => {
        toast.error("Hubo un error al actualizar el hotel");
      })
      .finally(() => setIsUploading(false));
  };

  const handleSubmit = (values) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Quieres actualizar los datos del hotel?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        updateHotel(values);
      }
    });
  };

  const deletehotel = () => {
    setIsUploading(true);
    deleteById(hotelId)
      .then((res) => {
        if (res.isSuccessful) {
          toast.success("Hotel eliminado con éxito");
          setTimeout(() => {
            navigate("/hotels");
          }, 2000);
        }
      })
      .catch(() => {
        toast.error("Hubo un error al eliminar el hotel");
      })
      .finally(() => setIsUploading(false));
  };

  const handleDelete = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Quieres eliminar este hotel?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        deletehotel();
      }
    });
  };

  useEffect(() => {
    setIsLoading(true);
    getDetailsById(hotelId)
      .then((res) => {
        if (res.isSuccessful) {
          setHotel(res.item);
        }
      })
      .catch((err) => {
        if (err?.response?.status !== 404) {
          toast.error("Hubo un error al cargar los detalles del hotel");
        }
      })
      .finally(() => setIsLoading(false));
  }, [hotelId]);

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} active="Editar" />
      <h1 className="display-6 mb-4">Detalles del Hotel</h1>

      <LoadingOverlay isVisible={isLoading} message="Cargando..." />
      <div>
        {" "}
        {/* Form for Editable Fields */}
        <Formik
          initialValues={{
            name: hotel?.name,
            phone: hotel?.phone,
            address: hotel?.address,
            email: hotel?.email,
            taxId: hotel?.taxId,
          }}
          validationSchema={addValidationSchema}
          onSubmit={handleSubmit}
          enableReinitialize>
          {({ resetForm }) => (
            <Form>
              <Row>
                <Col md="6">
                  <CustomField
                    name="name"
                    type="text"
                    placeholder="Nombre del Hotel"
                    className="form-control"
                    disabled={!isEditing || isUploading}
                  />
                </Col>

                <Col md="6">
                  <CustomField
                    name="phone"
                    type="text"
                    placeholder="Teléfono"
                    className="form-control"
                    disabled={!isEditing || isUploading}
                  />
                </Col>

                <Col md="6">
                  <CustomField
                    name="address"
                    type="text"
                    placeholder="Dirección"
                    className="form-control"
                    disabled={!isEditing || isUploading}
                  />
                </Col>

                <Col md="6">
                  <CustomField
                    name="email"
                    type="email"
                    placeholder="Correo Electrónico"
                    className="form-control"
                    disabled={!isEditing || isUploading}
                  />
                </Col>

                <Col md="6">
                  <CustomField
                    name="taxId"
                    type="text"
                    placeholder="Identificación Fiscal (NIT)"
                    className="form-control"
                    disabled={!isEditing || isUploading}
                  />
                </Col>
              </Row>

              {/* Action Buttons */}
              <div className="mt-3">
                {isEditing && (
                  <>
                    <Button
                      type="submit"
                      className="me-2 bg-success text-white"
                      disabled={isUploading}>
                      {isUploading ? <Spinner size="sm" /> : "Guardar"}
                    </Button>
                    <Button
                      type="button"
                      className="me-2 bg-secondary text-white"
                      disabled={isUploading}
                      onClick={() => handleCancel(resetForm)}>
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
            </Form>
          )}
        </Formik>
        {!isEditing && (
          <>
            <Button
              className="bg-dark text-white"
              type="button"
              disabled={isUploading}
              onClick={() => setIsEditing(true)}>
              Editar
            </Button>
            <Button
              className="ms-2 bg-danger text-white"
              type="button"
              onClick={handleDelete}
              disabled={isUploading}>
              {isUploading ? <Spinner size="sm" /> : "Eliminar Hotel"}
            </Button>
          </>
        )}
        {/* Hotel Info (Read-only Fields) */}
        <Row className="mb-3">
          <Col md="6">
            <strong>Fecha de creación:</strong>{" "}
            {new Date(hotel?.dateCreated).toLocaleDateString()}
          </Col>
          <Col md="6">
            <strong>Propietario:</strong>{" "}
            {hotel?.owner
              ? `${hotel.owner.firstName} ${hotel.owner.lastName}`
              : "N/A"}
          </Col>
        </Row>
      </div>
    </>
  );
};

export default HotelEdit;
