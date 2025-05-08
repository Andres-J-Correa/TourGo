import React from "react";
import { Formik, Form } from "formik";
import { Row, Col, Button, FormGroup, Spinner } from "reactstrap";

import PropTypes from "prop-types";

import Swal from "sweetalert2";
import { getByDocumentNumber, add } from "services/customerService";

import PhoneInputField from "components/commonUI/forms/PhoneInputField";
import CustomField from "components/commonUI/forms/CustomField";
import CustomErrorMessage from "components/commonUI/forms/CustomErrorMessage";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import { customerSchema } from "components/bookings/constants";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function CustomerForm({
  customer,
  setCustomer,
  setCurrentStep,
  submitting,
  setCreating,
  setSubmitting,
  hotelId,
  creating = false,
  booking,
}) {
  const isUpdate = booking?.id > 0;

  const handleDocumentSubmit = async (values) => {
    try {
      setSubmitting(true);

      Swal.fire({
        title: "Buscando cliente...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await getByDocumentNumber(hotelId, values.documentNumber);

      Swal.close(); // Close loading

      if (res.item) {
        setCustomer(res.item);

        setTimeout(() => {
          setCurrentStep(1);
        }, 1500);

        await Swal.fire({
          icon: "success",
          title: "Cliente encontrado",
          timer: 1500,
          showConfirmButton: false,
          allowOutsideClick: false,
        });
      }
    } catch (err) {
      Swal.close(); // Close loading in case of error

      if (err.response?.status === 404) {
        setCreating(true);

        await Swal.fire({
          icon: "info",
          title: "Cliente no encontrado",
          text: "Por favor complete los datos",
          timer: 3000,
          showConfirmButton: false,
        });
      } else {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al buscar cliente, intente nuevamente",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomerCreate = async (values) => {
    try {
      setSubmitting(true);

      Swal.fire({
        title: "Creando cliente...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await add({ ...values }, hotelId);

      Swal.close();

      if (res.item > 0) {
        setCustomer({ ...values, id: res.item });
        setCreating(false);

        setTimeout(() => {
          setCurrentStep(1);
        }, 1500);

        await Swal.fire({
          icon: "success",
          title: "Cliente creado correctamente",
          timer: 1500,
          showConfirmButton: false,
          allowOutsideClick: false,
        });
      }
    } catch (err) {
      Swal.close();

      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear el cliente, intente nuevamente",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="text-end mb-4">
        {customer?.id && (
          <Button
            onClick={() => setCurrentStep(1)}
            color="secondary"
            disabled={submitting}>
            Siguiente
            <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
          </Button>
        )}
      </div>
      <Formik
        initialValues={{
          documentNumber: customer?.documentNumber || "",
          firstName: customer?.firstName || "",
          lastName: customer?.lastName || "",
          phone: customer?.phone || "",
          email: customer?.email || "",
        }}
        validationSchema={creating ? customerSchema : undefined}
        onSubmit={creating ? handleCustomerCreate : handleDocumentSubmit}
        enableReinitialize>
        {({ values, setFieldValue }) => {
          const handleDocChange = (e) => {
            const docValue = e.target.value;
            setFieldValue("documentNumber", docValue);
            // If there was a customer loaded, and docNumber is changing, reset rest
            if (customer?.id || creating) {
              setCustomer({
                documentNumber: docValue,
                firstName: "",
                lastName: "",
                phone: "",
                email: "",
              });
              setCreating(false);
            }
          };

          return (
            <Form>
              <Row className="mb-3">
                <Col md="6">
                  <CustomField
                    name="documentNumber"
                    placeholder="Documento de Identidad"
                    onChange={handleDocChange}
                    value={values.documentNumber}
                    disabled={submitting || isUpdate}
                    isRequired={true}
                  />
                </Col>
                <Col md="6" className="text-end">
                  <Button
                    type="submit"
                    disabled={submitting || isUpdate}
                    className="bg-gradient-success">
                    {submitting ? (
                      <Spinner size="sm" />
                    ) : creating ? (
                      "Guardar Cliente"
                    ) : (
                      "Buscar Cliente"
                    )}
                  </Button>
                </Col>
              </Row>

              {(creating || customer?.id) && (
                <>
                  <Row>
                    <Col md="6">
                      <CustomField
                        name="firstName"
                        placeholder="Nombre"
                        disabled={!!customer?.id || submitting}
                        isRequired={creating}
                      />
                    </Col>
                    <Col md="6">
                      <CustomField
                        name="lastName"
                        placeholder="Apellido"
                        disabled={!!customer?.id || submitting}
                        isRequired={creating}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <CustomField
                        name="email"
                        placeholder="Correo Electrónico"
                        disabled={!!customer?.id || submitting}
                        isRequired={creating}
                        autoComplete="email"
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
                          disabled={!!customer?.id || submitting}
                          isRequired={creating}
                        />
                        <CustomErrorMessage name="phone" />
                      </FormGroup>
                    </Col>
                  </Row>
                  <ErrorAlert />
                </>
              )}
            </Form>
          );
        }}
      </Formik>
    </>
  );
}

export default CustomerForm;

CustomerForm.propTypes = {
  customer: PropTypes.object,
  setCustomer: PropTypes.func.isRequired,
  setCurrentStep: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  setCreating: PropTypes.func.isRequired,
  creating: PropTypes.bool,
};
