import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import { Button, Spinner } from "reactstrap";
import CustomField from "components/commonUI/forms/CustomField";
import { userSignInSchema } from "components/users/validationSchemas";
import { usersLogin } from "services/userAuthService";
import { useAppContext } from "contexts/GlobalAppContext";
import { useLanguage } from "contexts/LanguageContext";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import AuthCard from "components/commonUI/forms/AuthCard";
import withModal from "components/commonUI/forms/withModal";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";

function UserSignInForm({ toggle, onSignUp, loading, setLoading }) {
  const { user } = useAppContext();
  const { t, getTranslatedErrorMessage } = useLanguage();
  const formRef = useRef(null);
  const validationSchema = userSignInSchema;
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const response = await usersLogin(values);
      if (!Boolean(response?.item)) {
        throw new Error("User not found");
      }
      toast.success(t("common.success"));
      navigate("/hotels");
      toggle();
      user.set((prev) => ({ ...prev, isAuthenticated: true }));
    } catch (error) {
      const errorMessage = getTranslatedErrorMessage(error);

      formRef.current?.setFieldError("email", errorMessage);
      formRef.current?.setFieldError("password", errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/users/password/reset");
    toggle();
  };

  return (
    <AuthCard
      title={t("client.login.title")}
      subtitle={t("client.login.subtitle")}
      footer={
        Boolean(onSignUp) ? (
          <p className="mb-0 mt-3 text-sm mx-auto">
            {t("client.login.noAccount")}{" "}
            <span
              className="text-success text-gradient font-weight-bold"
              onClick={loading ? null : onSignUp}
              role="button">
              {t("client.login.register")}
            </span>
          </p>
        ) : null
      }>
      <Formik
        initialValues={{
          email: "",
          password: "",
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        innerRef={formRef}>
        <Form>
          <CustomField
            name="email"
            type="email"
            className="form-control"
            placeholder={t("client.login.email")}
          />
          <CustomField
            name="password"
            type="password"
            className="form-control w-100"
            placeholder={t("client.login.password")}
            autoComplete="current-password"
          />
          <ErrorAlert />
          <div className="text-end">
            <button
              type="button"
              className="btn btn-link m-0 p-0"
              onClick={handleForgotPassword}
              disabled={loading}>
              {t("client.login.forgotPassword")}
            </button>
          </div>
          <div className="text-center">
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="bg-gradient-success w-100 mt-3 mb-0">
              {loading ? <Spinner size="sm" /> : t("client.login.button")}
            </Button>
          </div>
        </Form>
      </Formik>
    </AuthCard>
  );
}

UserSignInForm.propTypes = {
  toggle: PropTypes.func.isRequired,
  onSignUp: PropTypes.func,
  loading: PropTypes.bool.isRequired,
  setLoading: PropTypes.func.isRequired,
};

const UserSignInFormModal = withModal(UserSignInForm);

export { UserSignInForm, UserSignInFormModal };
