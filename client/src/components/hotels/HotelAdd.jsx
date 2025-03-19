import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Button, Spinner, Row, Col } from "reactstrap";
import { add } from "services/hotelService";
import { toast } from "react-toastify";
import CustomField from "components/commonUI/forms/CustomField";
import Breadcrumb from "components/commonUI/Breadcrumb";

const breadcrumbs = [
  { label: "Inicio", path: "/" },
  { label: "Hoteles", path: "/hotels" },
];

const HotelAdd = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);

  // Validation Schema
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("El nombre es obligatorio")
      .max(100, "Máximo 100 caracteres"),
    phone: Yup.string()
      .required("El teléfono es obligatorio")
      .max(20, "Máximo 20 caracteres"),
    address: Yup.string()
      .required("La dirección es obligatoria")
      .max(200, "Máximo 200 caracteres"),
    email: Yup.string()
      .required("El correo electrónico es obligatorio")
      .email("Formato de correo inválido")
      .max(100),
    taxId: Yup.string().required("El ID Fiscal es obligatorio").max(100),
  });

  // Form Submission
  const handleAddHotel = async (values) => {
    setIsUploading(true);
    try {
      const response = await add(values);
      if (response.isSuccessful && response.item > 0) {
        toast.success("Hotel agregado exitosamente. Redirigiendo...");
        setTimeout(() => {
          navigate(`/hotels/${response.item}`);
        }, 2000);
      }
    } catch (error) {
      toast.error("Error al agregar el hotel");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mt-4">
      <Breadcrumb breadcrumbs={breadcrumbs} active="Agregar Hotel" />
      <h1 className="display-6 mb-4">Agregar Nuevo Hotel</h1>

      <Formik
        initialValues={{
          name: "",
          phone: "",
          address: "",
          email: "",
          taxId: "",
        }}
        validationSchema={validationSchema}
        onSubmit={handleAddHotel}>
        <Form>
          <Row>
            <Col md="6">
              <CustomField
                name="name"
                type="text"
                className="form-control"
                placeholder="Nombre"
              />
            </Col>

            <Col md="6">
              <CustomField
                name="phone"
                type="text"
                className="form-control"
                placeholder="Teléfono"
              />
            </Col>

            <Col md="6">
              <CustomField
                name="address"
                type="text"
                className="form-control"
                placeholder="Dirección"
              />
            </Col>

            <Col md="6">
              <CustomField
                name="email"
                type="email"
                className="form-control"
                placeholder="Correo Electrónico"
              />
            </Col>

            <Col md="6">
              <CustomField
                name="taxId"
                type="text"
                className="form-control"
                placeholder="Identificación Fiscal (NIT)"
              />
            </Col>
          </Row>

          {/* Submit Button */}
          <div className="mt-3 text-center">
            <Button
              type="submit"
              className="bg-dark text-white"
              disabled={isUploading}>
              {isUploading ? <Spinner size="sm" /> : "Agregar Hotel"}
            </Button>
          </div>
        </Form>
      </Formik>
    </div>
  );
};

export default HotelAdd;
