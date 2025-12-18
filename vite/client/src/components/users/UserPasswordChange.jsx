import React from "react";
import { Button, Col, FormGroup, Row } from "reactstrap";
import { Formik, Form } from "formik";
import CustomField from "components/commonUI/forms/CustomField";
import { useUserPasswordChangeSchema } from "components/users/validationSchemas";
import { useLanguage } from "contexts/LanguageContext";
import { changePassword } from "services/userAuthService";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import Swal from "sweetalert2";
import { ERROR_CODES } from "constants/errorCodes";

function UserPasswordChange() {
  const { t } = useLanguage();
  const validationSchema = useUserPasswordChangeSchema();

  const handleSubmit = async (
    values,
    { setSubmitting, resetForm, setFieldError }
  ) => {
    const result = await Swal.fire({
      title: t("users.passwordChange.confirmTitle"),
      text: t("users.passwordChange.confirmText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("users.passwordChange.confirmButton"),
      cancelButtonText: t("common.cancel"),
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      setSubmitting(false);
      return;
    }

    try {
      Swal.fire({
        title: t("users.passwordChange.changingTitle"),
        text: t("users.passwordChange.changingText"),
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
          title: t("common.success"),
          text: t("users.passwordChange.successText"),
          icon: "success",
          timer: 2000,
        });
        resetForm();
      } else {
        throw new Error(t("users.passwordChange.changeError"));
      }
    } catch (error) {
      const errorMessage = t("users.passwordChange.incorrectPassword");

      if (
        Number(error?.response?.data?.code) ===
        ERROR_CODES.INCORRECT_CREDENTIALS
      ) {
        setFieldError("oldPassword", errorMessage);
      }

      Swal.close();

      Swal.fire({
        title: t("common.error"),
        text: errorMessage,
        icon: "error",
        confirmButtonText: t("common.ok"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Row className="justify-content-center">
      <h4>{t("users.passwordChange.title")}</h4>
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
                  placeholder={t("users.passwordChange.oldPassword")}
                  autoComplete="current-password"
                />
              </FormGroup>
              <FormGroup>
                <CustomField
                  name="password"
                  type="password"
                  className="form-control"
                  placeholder={t("client.passwordChange.newPassword")}
                  autoComplete="new-password"
                />
              </FormGroup>
              <FormGroup>
                <CustomField
                  name="confirmPassword"
                  type="password"
                  className="form-control w-100"
                  placeholder={t("client.passwordChange.confirmPassword")}
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
                  {t("users.passwordChange.changeButton")}
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
