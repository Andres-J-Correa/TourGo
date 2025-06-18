import React, { useState } from "react";
import { Formik, Form } from "formik";
import { Row, Col, Button, FormGroup, Spinner } from "reactstrap";

import PropTypes from "prop-types";

import Swal from "sweetalert2";
import { getByDocumentNumber, add, update } from "services/customerService";

import PhoneInputField from "components/commonUI/forms/PhoneInputField";
import CustomField from "components/commonUI/forms/CustomField";
import CustomErrorMessage from "components/commonUI/forms/CustomErrorMessage";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import useBookingSchemas from "./useBookingSchemas";
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
  const isUpdate = booking?.id;
  const [editing, setEditing] = useState(false);

  const { customerSchema, searchCustomerSchema } = useBookingSchemas();

  const handleDocumentSubmit = async (values) => {
    try {
      setSubmitting(true);

      Swal.fire({
        title: "Buscando cliente...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await getByDocumentNumber(
        hotelId,
        values.documentNumber.trim()
      );

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

      const trimmedData = {
        ...values,
        documentNumber: values.documentNumber.trim(),
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
      };

      const res = await add(trimmedData, hotelId);

      Swal.close();

      if (res.item > 0) {
        setCustomer({ ...trimmedData, id: res.item });
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

  const handleCustomerUpdate = async (values) => {
    const result = await Swal.fire({
      title: "Confirmar actualización",
      text: "¿Está seguro de que desea actualizar los datos del cliente?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, actualizar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      setSubmitting(true);
      Swal.fire({
        title: "Actualizando cliente...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const res = await update(values, hotelId, customer.id);
      Swal.close();
      if (res.isSuccessful) {
        setCustomer((prev) => ({
          ...prev,
          ...values,
        }));
        setEditing(false);
        await Swal.fire({
          icon: "success",
          title: "Cliente actualizado correctamente",
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
        text: "No se pudo actualizar el cliente, intente nuevamente",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = (resetForm) => {
    setEditing(false);
    resetForm();
  };

  return (
    <>
      <div className="text-end mb-4">
        {customer?.id && (
          <Button
            onClick={() => setCurrentStep(1)}
            color="dark"
            disabled={submitting || editing}>
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
        validationSchema={
          creating || editing ? customerSchema : searchCustomerSchema
        }
        onSubmit={
          creating
            ? handleCustomerCreate
            : editing
            ? handleCustomerUpdate
            : handleDocumentSubmit
        }
        enableReinitialize>
        {({ values, setFieldValue, resetForm }) => {
          const handleDocChange = (e) => {
            const docValue = e.target.value;
            setFieldValue("documentNumber", docValue);
            // If there was a customer loaded, and docNumber is changing, reset rest
            if ((customer?.id || creating) && !editing) {
              setCustomer({
                documentNumber: docValue,
                firstName: "",
                lastName: "",
                phone: "",
                email: "",
              });
              setCreating(false);
              setEditing(false);
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
                    disabled={submitting || (isUpdate && !editing)}
                    isRequired={true}
                  />
                </Col>
                <Col md="6" className="text-end">
                  {customer?.id && !editing && (
                    <Button
                      onClick={() => setEditing(true)}
                      color="warning"
                      disabled={submitting}
                      className="me-2">
                      Editar
                    </Button>
                  )}
                  {editing && (
                    <Button
                      type="button"
                      color="secondary"
                      className="me-2"
                      disabled={submitting}
                      onClick={() => handleCancelEdit(resetForm)}>
                      Cancelar
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={submitting || (isUpdate && !editing)}
                    className="bg-gradient-success">
                    {submitting ? (
                      <Spinner size="sm" />
                    ) : creating ? (
                      "Guardar Cliente"
                    ) : editing ? (
                      "Actualizar Cliente"
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
                        disabled={(!!customer?.id && !editing) || submitting}
                        isRequired={creating || editing}
                      />
                    </Col>
                    <Col md="6">
                      <CustomField
                        name="lastName"
                        placeholder="Apellido"
                        disabled={(!!customer?.id && !editing) || submitting}
                        isRequired={creating || editing}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <CustomField
                        name="email"
                        placeholder="Correo Electrónico"
                        disabled={(!!customer?.id && !editing) || submitting}
                        isRequired={creating || editing}
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
                          disabled={(!!customer?.id && !editing) || submitting}
                          isRequired={creating || editing}
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
