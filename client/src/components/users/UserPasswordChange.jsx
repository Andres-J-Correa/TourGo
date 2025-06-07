import React from "react";
import { Button, Col, FormGroup, Row } from "reactstrap";
import { Formik, Form } from "formik";
import CustomField from "components/commonUI/forms/CustomField";
import { userPasswordChangeSchema } from "components/users/validationSchemas";
import { useLanguage } from "contexts/LanguageContext";
import { changePassword } from "services/userAuthService";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import Swal from "sweetalert2";
import { ERROR_CODES } from "constants/errorCodes";

function UserPasswordChange() {
  const { t } = useLanguage();
  const validationSchema = userPasswordChangeSchema;

  const handleSubmit = async (
    values,
    { setSubmitting, resetForm, setFieldError }
  ) => {
    const result = await Swal.fire({
      title: "¿Cambiar contraseña?",
      text: "¿Estás seguro de que deseas cambiar tu contraseña?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cambiar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      setSubmitting(false);
      return;
    }

    try {
      Swal.fire({
        title: "Cambiando...",
        text: "Por favor, espera mientras se actualiza tu contraseña.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await changePassword({
        oldPassword: values.oldPassword,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });

      Swal.close();

      if (response?.isSuccessful) {
        Swal.fire({
          title: "Éxito",
          text: "Tu contraseña ha sido cambiada exitosamente.",
          icon: "success",
          timer: 2000,
        });
        resetForm();
      } else {
        throw new Error("Error al cambiar la contraseña.");
      }
    } catch (error) {
      const errorMessage =
        "La contraseña actual es incorrecta. Por favor, inténtalo de nuevo.";

      if (
        Number(error?.response?.data?.code) ===
        ERROR_CODES.INCORRECT_CREDENTIALS
      ) {
        setFieldError("oldPassword", errorMessage);
      }

      Swal.close();

      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Row className="justify-content-center">
      <h4>Cambiar Contraseña</h4>
      <Col md="6" className="mb-4">
        <Formik
          initialValues={{
            oldPassword: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}>
          {({ isSubmitting }) => (
            <Form>
              <FormGroup>
                <CustomField
                  name="oldPassword"
                  type="password"
                  className="form-control"
                  placeholder={"Contraseña Actual"}
                  autoComplete="current-password"
                />
              </FormGroup>
              <FormGroup>
                <CustomField
                  name="password"
                  type="password"
                  className="form-control"
                  placeholder={
                    t("client.passwordChange.newPassword") || "Nueva Contraseña"
                  }
                  autoComplete="new-password"
                />
              </FormGroup>
              <FormGroup>
                <CustomField
                  name="confirmPassword"
                  type="password"
                  className="form-control w-100"
                  placeholder={
                    t("client.passwordChange.confirmPassword") ||
                    "Confirmar Nueva Contraseña"
                  }
                  autoComplete="new-password"
                />
              </FormGroup>
              <ErrorAlert />
              <div className="text-center">
                <Button
                  type="submit"
                  size="lg"
                  className="bg-gradient-success w-100 mt-3 mb-0"
                  disabled={isSubmitting}>
                  Cambiar Contraseña
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Col>
    </Row>
  );
}

export default UserPasswordChange;
