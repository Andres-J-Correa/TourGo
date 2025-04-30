import React from "react";
import { Formik, Form } from "formik";
import { Row, Col, Button, FormGroup, Spinner } from "reactstrap";

import PropTypes from "prop-types";

import { toast } from "react-toastify";
import { getByDocumentNumber, add } from "services/customerService";

import PhoneInputField from "components/commonUI/forms/PhoneInputField";
import CustomField from "components/commonUI/forms/CustomField";
import CustomErrorMessage from "components/commonUI/forms/CustomErrorMessage";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import { customerSchema } from "./constants";

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
      const res = await getByDocumentNumber(hotelId, values.documentNumber);
      if (res.item) {
        setCustomer(res.item);
        toast.success("Cliente encontrado");
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setCreating(true);
        toast.info("Cliente no encontrado, por favor complete los datos", {
          autoClose: 3000,
        });
      } else {
        toast.error("Error al buscar cliente");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomerCreate = async (values) => {
    try {
      setSubmitting(true);
      const payload = { ...values };
      const res = await add(payload, hotelId);
      if (res.item > 0) {
        setCustomer({ ...values, id: res.item });
        setCreating(false);
        toast.success("Cliente creado");
      }
    } catch (err) {
      toast.error("Error al crear cliente");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{
        documentNumber: customer?.documentNumber || "",
        firstName: customer?.firstName || "",
        lastName: customer?.lastName || "",
        phone: customer?.phone || "",
        email: customer?.email || "",
      }}
      validationSchema={creating && customerSchema}
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
                <div className="text-end mt-3">
                  {customer?.id && (
                    <Button
                      onClick={() => setCurrentStep(1)}
                      color="secondary"
                      disabled={submitting}>
                      Siguiente
                    </Button>
                  )}
                </div>
              </>
            )}
          </Form>
        );
      }}
    </Formik>
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
