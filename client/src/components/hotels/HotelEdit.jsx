import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Row, Col, FormGroup, Label, Input } from "reactstrap";
import { Formik, Form, Field } from "formik";
import { getDetailsById } from "services/hotelService";
import SimpleLoader from "components/commonUI/loaders/SimpleLoader";
import Breadcrumbs from "components/commonUI/Breadcrumb";
import { toast } from "react-toastify";

const HotelEdit = () => {
  const { hotelId } = useParams();
  const [hotel, setHotel] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const breadcrumbs = [
    { label: "Inicio", path: "/" },
    { label: "Hoteles", path: "/hotels" },
    { label: "Hotel", path: `/hotels/${hotelId}` },
  ];

  useEffect(() => {
    setIsLoading(true);
    getDetailsById(hotelId)
      .then((res) => {
        if (res.isSuccessful) {
          setHotel(res.item);
        }
      })
      .catch((err) => {
        if (err.response.status !== 404) {
          toast.error("Hubo un error al cargar los detalles del hotel");
        }
      })
      .finally(() => setIsLoading(false));
  }, [hotelId]);

  // Handles form cancel action
  const handleCancel = (resetForm) => {
    resetForm();
    setIsEditing(false);
  };

  return (
    <div className="container mt-4">
      <Breadcrumbs breadcrumbs={breadcrumbs} active="Editar" />
      <h1 className="display-6 mb-4">Detalles del Hotel</h1>

      {isLoading ? (
        <SimpleLoader />
      ) : (
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
            onSubmit={() => {}} // Empty function for now
            enableReinitialize>
            {({ resetForm }) => (
              <Form>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label>Nombre</Label>
                      <Field
                        name="name"
                        type="text"
                        as={Input}
                        className="form-control"
                        disabled={!isEditing}
                      />
                    </FormGroup>
                  </Col>

                  <Col md="6">
                    <FormGroup>
                      <Label>Teléfono</Label>
                      <Field
                        name="phone"
                        type="text"
                        as={Input}
                        className="form-control"
                        disabled={!isEditing}
                      />
                    </FormGroup>
                  </Col>

                  <Col md="6">
                    <FormGroup>
                      <Label>Dirección</Label>
                      <Field
                        name="address"
                        type="text"
                        as={Input}
                        className="form-control"
                        disabled={!isEditing}
                      />
                    </FormGroup>
                  </Col>

                  <Col md="6">
                    <FormGroup>
                      <Label>Correo Electrónico</Label>
                      <Field
                        name="email"
                        type="email"
                        as={Input}
                        className="form-control"
                        disabled={!isEditing}
                      />
                    </FormGroup>
                  </Col>

                  <Col md="6">
                    <FormGroup>
                      <Label>Identificación Fiscal (NIT)</Label>
                      <Field
                        name="taxId"
                        type="text"
                        as={Input}
                        className="form-control"
                        disabled={!isEditing}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                {/* Action Buttons */}
                <div className="mt-3">
                  {!isEditing ? (
                    <Button
                      className="bg-dark text-white"
                      onClick={() => setIsEditing(true)}>
                      Editar
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="submit"
                        className="me-2 bg-success text-white">
                        Guardar
                      </Button>
                      <Button
                        type="button"
                        className="me-2 bg-secondary text-white"
                        onClick={() => handleCancel(resetForm)}>
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </Form>
            )}
          </Formik>
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
      )}
    </div>
  );
};

export default HotelEdit;
