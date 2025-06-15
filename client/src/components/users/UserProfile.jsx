import React, { useState, useMemo } from "react";
import { Button, Row, Col, FormGroup } from "reactstrap";
import { Formik, Form } from "formik";
import CustomField from "components/commonUI/forms/CustomField";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import { useAppContext } from "contexts/GlobalAppContext";
import { usersUpdate } from "services/userAuthService";
import { userUpdateSchema } from "components/users/validationSchemas";
import Breadcrumb from "components/commonUI/Breadcrumb";
import PhoneInputField from "components/commonUI/forms/PhoneInputField";
import CustomErrorMessage from "components/commonUI/forms/CustomErrorMessage";
import Swal from "sweetalert2";
import { ERROR_CODES } from "constants/errorCodes";
import { useLanguage } from "contexts/LanguageContext";

const breadcrumbs = [{ label: "Inicio", path: "/" }];

function UserProfile() {
  const { user } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const { t, getTranslatedErrorMessage } = useLanguage();

  const initialValues = useMemo(
    () => ({
      firstName: user.current.firstName,
      lastName: user.current.lastName,
      email: user.current.email,
      phone: user.current.phone,
    }),
    [user]
  );

  const handleSubmit = async (values, { resetForm, setFieldError }) => {
    const { firstName, lastName, phone } = values;

    const result = await Swal.fire({
      title: "¿Guardar cambios en tu perfil?",
      text: "¿Estás seguro de que deseas actualizar tu información?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#0d6efd",
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: "Actualizando perfil",
        text: "Por favor espera",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await usersUpdate({
        firstName,
        lastName,
        phone,
      });

      if (response?.isSuccessful) {
        user.set((prev) => ({
          ...prev,
          ...values,
          phone: values.phone || "",
        }));

        await Swal.fire({
          icon: "success",
          title: "Perfil actualizado",
          text: "Tu información se ha guardado correctamente",
          timer: 1500,
          showConfirmButton: false,
          allowOutsideClick: false,
        });
      } else {
        throw new Error("Error al actualizar el perfil");
      }
    } catch (error) {
      if (
        Number(error?.response?.data?.code) === ERROR_CODES.PHONE_ALREADY_EXISTS
      ) {
        setFieldError(
          "phone",
          t(`errors.custom.${ERROR_CODES.PHONE_ALREADY_EXISTS}`)
        );
      }
      const errorMessage = getTranslatedErrorMessage(error);

      Swal.close();

      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      resetForm();
      setIsEditing(false);
    }
  };

  const handleCancel = (resetForm) => {
    resetForm();
    setIsEditing(false);
  };

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} active="Perfil" />
      <h2 className="display-6 mb-4">Perfil de Usuario</h2>
      <ErrorBoundary>
        <Formik
          initialValues={initialValues}
          validationSchema={userUpdateSchema}
          onSubmit={handleSubmit}
          enableReinitialize>
          {({ resetForm }) => (
            <Form>
              <Row>
                <Col md="6">
                  <CustomField
                    name="firstName"
                    type="text"
                    placeholder="Nombre"
                    className="form-control"
                    disabled={!isEditing}
                    isRequired={isEditing}
                  />
                </Col>
                <Col md="6">
                  <CustomField
                    name="lastName"
                    type="text"
                    placeholder="Apellido"
                    className="form-control"
                    disabled={!isEditing}
                    isRequired={isEditing}
                  />
                </Col>
                <Col md="6">
                  <CustomField
                    name="email"
                    type="email"
                    placeholder="Correo Electrónico"
                    className="form-control"
                    disabled
                  />
                </Col>
                <Col>
                  <FormGroup className="position-relative">
                    <PhoneInputField
                      name="phone"
                      type="text"
                      className="form-control d-flex"
                      placeholder="Teléfono"
                      autoComplete="tel"
                      disabled={!isEditing}
                    />
                    <CustomErrorMessage name="phone" />
                  </FormGroup>
                </Col>
              </Row>
              <div className="mt-3">
                {isEditing && (
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
        {!isEditing && (
          <Button
            className="bg-dark text-white"
            type="button"
            onClick={() => setIsEditing(true)}>
            Editar
          </Button>
        )}
      </ErrorBoundary>
    </>
  );
}

export default UserProfile;
