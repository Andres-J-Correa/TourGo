import React, { useRef } from "react";
import { Col, Row, FormGroup, Button, Spinner } from "reactstrap";
import { Formik, Form } from "formik";
import PhoneInputField from "components/commonUI/forms/PhoneInputField";
import CustomErrorMessage from "components/commonUI/forms/CustomErrorMessage";
import CustomField from "components/commonUI/forms/CustomField";
import AuthCard from "components/commonUI/forms/AuthCard";
import withModal from "components/commonUI/forms/withModal";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import { userSignUpSchema } from "components/users/validationSchemas";
import { useLanguage } from "contexts/LanguageContext";
import { usersRegister } from "services/userAuthService";
import { ERROR_CODES } from "constants/errorCodes";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  confirmPassword: "",
  authProvider: 1,
};

function SignUpForm({ onSignIn, loading, setLoading }) {
  const { t, getTranslatedErrorMessage } = useLanguage();
  const formRef = useRef(null);
  const validationSchema = userSignUpSchema;

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const response = await usersRegister(values);
      if (!Boolean(response?.item)) {
        throw new Error("User not found");
      }
      toast.success(t("common.success"));
      if (onSignIn) onSignIn();
    } catch (error) {
      if (
        Number(error?.response?.data?.code) === ERROR_CODES.EMAIL_ALREADY_EXISTS
      ) {
        formRef.current?.setFieldError(
          "email",
          t(`errors.custom.${ERROR_CODES.EMAIL_ALREADY_EXISTS}`)
        );
      }
      if (
        Number(error?.response?.data?.code) === ERROR_CODES.PHONE_ALREADY_EXISTS
      ) {
        formRef.current?.setFieldError(
          "phone",
          t(`errors.custom.${ERROR_CODES.PHONE_ALREADY_EXISTS}`)
        );
      }
      const errorMessage = getTranslatedErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title={t("client.register.title")}
      subtitle={t("client.register.subtitle")}
      footer={
        Boolean(onSignIn) ? (
          <p className="mb-0 mt-3 text-sm mx-auto">
            {t("client.register.alreadyHaveAccount")}{" "}
            <span
              className="text-success text-gradient font-weight-bold"
              onClick={loading ? null : onSignIn}
              role="button">
              {t("client.register.login")}
            </span>
          </p>
        ) : null
      }>
      <Formik
        initialValues={{ ...initialValues }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        innerRef={formRef}>
        <Form>
          <Row>
            <Col md={6} sm={12}>
              <CustomField
                name="firstName"
                type="text"
                className="form-control"
                placeholder={t("client.register.firstName")}
                isRequired={true}
              />
            </Col>
            <Col md={6} sm={12}>
              <CustomField
                name="lastName"
                type="text"
                className="form-control"
                placeholder={t("client.register.lastName")}
                isRequired={true}
              />
            </Col>
          </Row>
          <CustomField
            name="email"
            type="email"
            className="form-control"
            placeholder={t("client.register.email")}
            isRequired={true}
          />
          <FormGroup className="position-relative">
            <PhoneInputField
              name="phone"
              type="text"
              className="form-control d-flex"
              placeholder={t("client.register.phone")}
              autoComplete="tel"
              isRequired={true}
            />
            <CustomErrorMessage name="phone" />
          </FormGroup>
          <CustomField
            name="password"
            type="password"
            className="form-control"
            placeholder={t("client.register.password")}
            autoComplete="new-password"
          />
          <CustomField
            name="confirmPassword"
            type="password"
            className="form-control"
            placeholder={t("client.register.confirmPassword")}
          />
          <ErrorAlert />
          <div className="text-center">
            <Button
              type="submit"
              size="lg"
              className="bg-gradient-success mt-3 mb-0"
              disabled={loading}>
              {loading ? <Spinner size="sm" /> : t("client.register.button")}
            </Button>
          </div>
        </Form>
      </Formik>
    </AuthCard>
  );
}

SignUpForm.propTypes = {
  onSignIn: PropTypes.func,
  loading: PropTypes.bool.isRequired,
  setLoading: PropTypes.func.isRequired,
};

function _SignUpFormModal({ onSignIn, loading, setLoading }) {
  return (
    <SignUpForm onSignIn={onSignIn} loading={loading} setLoading={setLoading} />
  );
}

_SignUpFormModal.propTypes = {
  onSignIn: PropTypes.func,
  loading: PropTypes.bool.isRequired,
  setLoading: PropTypes.func.isRequired,
};

const SignUpFormModal = withModal(_SignUpFormModal);

export { SignUpForm, SignUpFormModal };
