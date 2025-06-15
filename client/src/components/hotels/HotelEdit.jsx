import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Row, Col, Spinner } from "reactstrap";
import { Formik, Form } from "formik";
import CustomField from "components/commonUI/forms/CustomField";
import { getDetailsById, updateById, deleteById } from "services/hotelService";
import { addValidationSchema, HOTEL_ROLES } from "components/hotels/constants";
import { useAppContext } from "contexts/GlobalAppContext";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import SimpleLoader from "components/commonUI/loaders/SimpleLoader";

const HotelEdit = ({ hotelId }) => {
  const [hotel, setHotel] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const { hotel: currentHotel } = useAppContext();

  const navigate = useNavigate();

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
      <h4 className="display-6 mb-4">Editar Hotel</h4>
      <SimpleLoader isVisible={isLoading} />
      {!isLoading && (
        <div>
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
              {currentHotel.current.roleId === HOTEL_ROLES.OWNER && (
                <Button
                  className="ms-2 bg-danger text-white"
                  type="button"
                  onClick={handleDelete}
                  disabled={isUploading}>
                  {isUploading ? <Spinner size="sm" /> : "Eliminar Hotel"}
                </Button>
              )}
            </>
          )}
          <Row className="mt-4">
            <Col>
              <strong>Propietario:</strong>{" "}
              <p>
                {" "}
                {hotel?.owner
                  ? `${hotel.owner.firstName} ${hotel.owner.lastName}`
                  : "N/A"}
              </p>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <strong>Creado por:</strong>
              <p>
                {hotel?.createdBy?.firstName} {hotel?.createdBy?.lastName}
              </p>
            </Col>
            <Col>
              <strong>Fecha de creación:</strong>
              <p>{dayjs(hotel?.dateCreated).format("DD/MM/YYYY h:mm a")}</p>
            </Col>
            <Col>
              <strong>Modificado por:</strong>
              <p>
                {hotel?.modifiedBy?.firstName} {hotel?.modifiedBy?.lastName}
              </p>
            </Col>
            <Col>
              <strong>Fecha de modificación</strong>
              <p>{dayjs(hotel?.dateModified).format("DD/MM/YYYY h:mm a")}</p>
            </Col>
          </Row>
        </div>
      )}
    </>
  );
};

export default HotelEdit;
