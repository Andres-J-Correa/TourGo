import React, { useState, useMemo } from "react";
import { Button, Row, Col, FormGroup } from "reactstrap";
import { Formik, Form } from "formik";
import CustomField from "components/commonUI/forms/CustomField";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import { useAppContext } from "contexts/GlobalAppContext";
import { usersUpdate } from "services/userAuthService";
import { useUserUpdateSchema } from "components/users/validationSchemas";
import Breadcrumb from "components/commonUI/Breadcrumb";
import PhoneInputField from "components/commonUI/forms/PhoneInputField";
import CustomErrorMessage from "components/commonUI/forms/CustomErrorMessage";
import Swal from "sweetalert2";
import { ERROR_CODES } from "constants/errorCodes";
import { useLanguage } from "contexts/LanguageContext";

function UserProfile() {
  const { user } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const { t, getTranslatedErrorMessage } = useLanguage();
  const userUpdateSchema = useUserUpdateSchema();

  const breadcrumbs = [{ label: t("common.breadcrumbs.home"), path: "/" }];

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
      title: t(
        "users.profile.saveConfirmTitle",
        "¿Guardar cambios en tu perfil?"
      ),
      text: t(
        "users.profile.saveConfirmText",
        "¿Estás seguro de que deseas actualizar tu información?"
      ),
      icon: "question",
      showCancelButton: true,
      confirmButtonText: t("users.profile.saveButton", "Guardar"),
      cancelButtonText: t("common.cancel"),
      confirmButtonColor: "#0d6efd",
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: t("users.profile.updatingTitle", "Actualizando perfil"),
        text: t("users.profile.updatingText", "Por favor espera"),
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
          title: t("users.profile.updatedTitle", "Perfil actualizado"),
          text: t(
            "users.profile.updatedText",
            "Tu información se ha guardado correctamente"
          ),
          timer: 1500,
          showConfirmButton: false,
          allowOutsideClick: false,
        });
      } else {
        throw new Error(
          t("users.profile.updateError", "Error al actualizar el perfil")
        );
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
        title: t("common.error"),
        text: errorMessage,
        icon: "error",
        confirmButtonText: t("common.ok"),
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
      <Breadcrumb
        breadcrumbs={breadcrumbs}
        active={t("users.profile.breadcrumbActive")}
      />
      <h2 className="display-6 mb-4">{t("users.profile.title")}</h2>
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
                    placeholder={t("users.profile.firstName")}
                    className="form-control"
                    disabled={!isEditing}
                    isRequired={isEditing}
                  />
                </Col>
                <Col md="6">
                  <CustomField
                    name="lastName"
                    type="text"
                    placeholder={t("users.profile.lastName")}
                    className="form-control"
                    disabled={!isEditing}
                    isRequired={isEditing}
                  />
                </Col>
                <Col md="6">
                  <CustomField
                    name="email"
                    type="email"
                    placeholder={t("users.profile.email")}
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
                      placeholder={t("users.profile.phone")}
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
                      {t("users.profile.saveButton")}
                    </Button>
                    <Button
                      type="button"
                      className="me-2 bg-secondary text-white"
                      onClick={() => handleCancel(resetForm)}>
                      {t("users.profile.cancelButton")}
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
            {t("users.profile.editButton")}
          </Button>
        )}
      </ErrorBoundary>
    </>
  );
}

export default UserProfile;
