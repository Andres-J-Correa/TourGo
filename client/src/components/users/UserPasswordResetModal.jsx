import React, { useRef } from "react";

import { Button, Spinner } from "reactstrap";
import { Formik, Form } from "formik";
import CustomField from "components/commonUI/forms/CustomField";
import AuthCard from "components/commonUI/forms/AuthCard";
import withModal from "components/commonUI/forms/withModal";

import { useUserPasswordResetSchema } from "components/users/validationSchemas";
import { toast } from "react-toastify";
import { useLanguage } from "contexts/LanguageContext";
import { resetPassword } from "services/userAuthService";
import PropTypes from "prop-types";

function UserPasswordResetModal({
  toggle,
  onSignIn,
  loading,
  setLoading,
  redirectToLogin,
}) {
  const validationSchema = useUserPasswordResetSchema();

  const { t, getTranslatedErrorMessage } = useLanguage();

  const formRef = useRef(null);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const response = await resetPassword(values);
      if (!Boolean(response?.isSuccessful)) {
        throw new Error("User not found");
      }
      toast.info(t("common.checkEmail"));
      toggle();
      if (redirectToLogin) {
        onSignIn();
      }
    } catch (error) {
      const errorMessage = getTranslatedErrorMessage(error);

      toast.error(errorMessage);
      formRef.current?.setFieldError("email", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title={t("client.passwordReset.title")}
      subtitle={t("client.passwordReset.subtitle")}
      footer={
        <p className="mb-0 mt-3 text-sm mx-auto">
          {" "}
          {t("client.passwordReset.back")}{" "}
          <span
            className="text-success text-gradient font-weight-bold"
            onClick={onSignIn}
            role="button"
          >
            {t("client.register.login")}?
          </span>
        </p>
      }
    >
      <Formik
        initialValues={{
          email: "",
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        innerRef={formRef}
      >
        <Form>
          <CustomField
            name="email"
            type="email"
            className="form-control"
            placeholder={t("client.passwordReset.email")}
          />
          <div className="text-center">
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="bg-gradient-success w-100 mt-3 mb-0"
            >
              {loading ? (
                <Spinner size="sm" />
              ) : (
                t("client.passwordReset.button")
              )}
            </Button>
          </div>
        </Form>
      </Formik>
    </AuthCard>
  );
}

export default withModal(UserPasswordResetModal);

UserPasswordResetModal.propTypes = {
  toggle: PropTypes.func.isRequired,
  onSignIn: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  setLoading: PropTypes.func.isRequired,
  redirectToLogin: PropTypes.bool,
};
