import React from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import { Button, Row, Col, FormGroup } from "reactstrap";
import { add } from "services/hotelService";
import CustomField from "components/commonUI/forms/CustomField";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import Breadcrumb from "components/commonUI/Breadcrumb";
import { addValidationSchema } from "./constants";
import { useAppContext } from "contexts/GlobalAppContext";
import VerifyAccountFallback from "components/commonUI/VerifyAccountFallback";
import PhoneInputField from "components/commonUI/forms/PhoneInputField";
import CustomErrorMessage from "components/commonUI/forms/CustomErrorMessage";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import Swal from "sweetalert2";

const breadcrumbs = [
  { label: "Inicio", path: "/" },
  { label: "Hoteles", path: "/hotels" },
];

const HotelAdd = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();

  // Form Submission
  const handleAddHotel = async (values) => {
    try {
      Swal.fire({
        title: "Agregando hotel",
        text: "Por favor espera",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await add(values);
      Swal.close();

      if (response.isSuccessful) {
        await Swal.fire({
          icon: "success",
          title: "Hotel agregado exitosamente",
          text: "Redirigiendo...",
          timer: 2000,
          showConfirmButton: false,
          allowOutsideClick: false,
        });
        navigate(`/hotels/${response.item}`);
      }
    } catch (error) {
      Swal.close();
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al agregar el hotel",
      });
    }
  };

  if (!user.current.isVerified) {
    return (
      <>
        <Breadcrumb breadcrumbs={breadcrumbs} active="Agregar Hotel" />
        <h2 className="display-6 mb-4">Agregar Nuevo Hotel</h2>
        <VerifyAccountFallback />
      </>
    );
  }

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} active="Agregar Hotel" />
      <h2 className="display-6 mb-4">Agregar Nuevo Hotel</h2>
      <ErrorBoundary>
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
                  isRequired={true}
                />
              </Col>

              <Col md="6">
                <CustomField
                  name="address"
                  type="text"
                  className="form-control"
                  placeholder="Dirección"
                  isRequired={true}
                />
              </Col>

              <Col md="6">
                <CustomField
                  name="email"
                  type="email"
                  className="form-control"
                  placeholder="Correo Electrónico"
                  isRequired={true}
                />
              </Col>

              <Col md="6">
                <FormGroup className="position-relative">
                  <PhoneInputField
                    name="phone"
                    type="text"
                    className="form-control d-flex"
                    placeholder="Teléfono"
                    autoComplete="tel"
                    isRequired={true}
                  />
                  <CustomErrorMessage name="phone" />
                </FormGroup>
              </Col>

              <Col md="6">
                <CustomField
                  name="taxId"
                  type="text"
                  className="form-control"
                  placeholder="Identificación Fiscal (NIT)"
                  isRequired={true}
                />
              </Col>
              <ErrorAlert />
            </Row>

            {/* Submit Button */}
            <div className="mt-3 text-center">
              <Button type="submit" className="bg-dark text-white">
                Agregar Hotel
              </Button>
            </div>
          </Form>
        </Formik>
      </ErrorBoundary>
    </>
  );
};

export default HotelAdd;
