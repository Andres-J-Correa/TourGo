import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import { Button, Spinner, Row, Col } from "reactstrap";
import { add } from "services/hotelService";
import { toast } from "react-toastify";
import CustomField from "components/commonUI/forms/CustomField";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import Breadcrumb from "components/commonUI/Breadcrumb";
import { addValidationSchema } from "./constants";
import { useAppContext } from "contexts/GlobalAppContext";

const breadcrumbs = [
  { label: "Inicio", path: "/" },
  { label: "Hoteles", path: "/hotels" },
];

const HotelAdd = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAppContext();

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

  if (!user.isVerified) {
    return (
      <>
        <Breadcrumb breadcrumbs={breadcrumbs} active="Agregar Hotel" />
        <h1 className="display-6 mb-4">Agregar Nuevo Hotel</h1>
        <div className="text-center mt-5">
          <h2>Verifica tu correo electrónico</h2>
          <p>Para agregar un hotel, primero debes verificar tu cuenta.</p>
          <Button
            color="dark"
            onClick={() => navigate("/profile/settings?tab=email")}>
            Verificar Correo
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
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
        validationSchema={addValidationSchema}
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
            <ErrorAlert />
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
    </>
  );
};

export default HotelAdd;
