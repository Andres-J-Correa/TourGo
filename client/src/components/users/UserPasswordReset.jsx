import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Container } from "reactstrap";
import { Formik, Form } from "formik";
import CustomField from "components/commonUI/forms/CustomField";
import AuthCard from "components/commonUI/forms/AuthCard";
import DefaultHeader from "components/commonUI/headers/DefaultHeader";
import ErrorBoundary from "components/commonUI/ErrorBoundary";

import {
  userPasswordForgotSchema,
  userPasswordResetSchema,
} from "components/users/validationSchemas";
import { resetPassword, forgotPassword } from "services/userAuthService";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import { useLanguage } from "contexts/LanguageContext";
import { useAppContext } from "contexts/GlobalAppContext";
import backgroundImage from "assets/images/password-reset-bg.jpg";
import { ERROR_CODES } from "constants/errorCodes";
import Swal from "sweetalert2";

function UserPasswordReset() {
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const { t, getTranslatedErrorMessage } = useLanguage();
  const { user } = useAppContext();
  const navigate = useNavigate();

  const handleForgotPasswordSubmit = useCallback(
    async (values) => {
      try {
        Swal.fire({
          title: "Procesando...",
          text: "Estamos enviando instrucciones para restablecer tu contraseña.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const response = await forgotPassword(values);
        if (!Boolean(response?.isSuccessful)) {
          throw new Error("User not found");
        }

        setIsCodeSent(true);
        setUserEmail(values.email);

        Swal.fire({
          title: "Revisa tu correo",
          text: "Si el correo electrónico está registrado, recibirás un código para restablecer tu contraseña.",
          icon: "info",
          confirmButtonText: "OK",
        });
      } catch (error) {
        const errorMessage = getTranslatedErrorMessage(error);

        Swal.close();

        Swal.fire({
          title: "Error",
          text: errorMessage,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    },
    [getTranslatedErrorMessage]
  );

  const handlePasswordResetSubmit = useCallback(
    async (values, { setFieldError }) => {
      try {
        Swal.fire({
          title: "Actualizando contraseña...",
          text: "Por favor espera un momento.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const response = await resetPassword({ ...values, email: userEmail });

        if (!response?.isSuccessful) {
          throw new Error("Error changing password");
        }

        Swal.fire({
          title: "Contraseña actualizada",
          text: t("common.success"),
          icon: "success",
          confirmButtonText: "OK",
          timer: 1000,
          didClose: () => {
            navigate("/");
          },
        });
      } catch (error) {
        const errorMessage = getTranslatedErrorMessage(error);
        if (error?.response?.data?.code === ERROR_CODES.TOKEN_NOT_FOUND) {
          setFieldError("token", errorMessage);
        }
        Swal.close();

        Swal.fire({
          title: "Error",
          text: errorMessage,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    },
    [getTranslatedErrorMessage, navigate, t, userEmail]
  );

  const forgotPasswordForm = useMemo(
    () => (
      <Formik
        initialValues={{
          email: "",
        }}
        validationSchema={userPasswordForgotSchema}
        onSubmit={handleForgotPasswordSubmit}>
        <Form>
          <CustomField
            name="email"
            type="email"
            className="form-control"
            placeholder={t("client.passwordReset.email")}
            autoComplete="email"
          />
          <ErrorAlert />
          <div className="text-center">
            <Button
              type="submit"
              size="lg"
              className="bg-gradient-success w-100 mt-3 mb-0">
              {t("client.passwordReset.button")}
            </Button>
          </div>
        </Form>
      </Formik>
    ),
    [t, handleForgotPasswordSubmit]
  );

  const resetPasswordForm = useMemo(
    () => (
      <Formik
        initialValues={{
          password: "",
          confirmPassword: "",
          token: "",
        }}
        validationSchema={userPasswordResetSchema}
        onSubmit={handlePasswordResetSubmit}>
        <Form>
          <CustomField
            key="password"
            name="password"
            type="password"
            className="form-control"
            placeholder={t("client.passwordChange.newPassword")}
            autoComplete="new-password"
          />
          <CustomField
            key="confirmPassword"
            name="confirmPassword"
            type="password"
            className="form-control w-100"
            placeholder={t("client.passwordChange.confirmPassword")}
          />
          <CustomField
            name="token"
            type="text"
            className="form-control w-100"
            placeholder={t("client.passwordChange.token")}
            autoComplete="off"
          />
          <ErrorAlert />
          <div className="text-center">
            <Button
              type="submit"
              size="lg"
              className="bg-gradient-success w-100 mt-3 mb-0">
              {t("client.passwordChange.button")}
            </Button>
          </div>
        </Form>
      </Formik>
    ),
    [handlePasswordResetSubmit, t]
  );

  const renderform = () => {
    if (isCodeSent) {
      return resetPasswordForm;
    } else {
      return forgotPasswordForm;
    }
  };

  if (user.current.isAuthenticated) {
    return;
  }

  return (
    <>
      <ErrorBoundary>
        <DefaultHeader
          backgroundImage={backgroundImage}
          className="m-3 border-radius-xl min-vh-50"
        />

        <Container className="mt-n5">
          <AuthCard
            title={
              isCodeSent
                ? t("client.passwordChange.title")
                : t("client.passwordReset.title")
            }
            subtitle={
              isCodeSent
                ? t("client.passwordChange.subtitle")
                : t("client.passwordReset.subtitle")
            }
            xl={4}
            lg={6}
            md={8}
            sm={10}
            xs={12}>
            {renderform()}
          </AuthCard>
        </Container>
      </ErrorBoundary>
    </>
  );
}

export default UserPasswordReset;
