import React, { useRef } from "react";

import { Col, Row, FormGroup, Button, Spinner } from "reactstrap";

import { Formik, Form } from "formik";

import PhoneInputField from "components/commonUI/forms/PhoneInputField";
import CustomErrorMessage from "components/commonUI/forms/CustomErrorMessage";
import CustomField from "components/commonUI/forms/CustomField";
import AuthCard from "components/commonUI/forms/AuthCard";
import withModal from "components/commonUI/forms/withModal";

import { useUserSignUpSchema } from "components/users/validationSchemas";
import { useLanguage } from "contexts/LanguageContext";
import { usersRegister } from "services/userAuthService";
import { errorCodes } from "constants/errorCodes";

import PropTypes from "prop-types";
import { toast } from "react-toastify";

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  confirmPassword: "",
  authProvider: 1, //TODO this should be changed later for OAuth login
};

function SignUpForm({ onSignIn, loading, setLoading, role = 2 }) {
  const { t, getTranslatedErrorMessage } = useLanguage();
  const validationSchema = useUserSignUpSchema();

  const formRef = useRef(null);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const response = await usersRegister(values);
      if (!Boolean(response?.item)) {
        throw new Error("User not found");
      }
      toast.success(t("common.success"));
      onSignIn();
    } catch (error) {
      if (
        Number(error?.response.data?.code) === errorCodes.EMAIL_ALREADY_EXISTS
      ) {
        formRef?.current?.setFieldError(
          "email",
          t(`errors.custom.${errorCodes.EMAIL_ALREADY_EXISTS}`)
        );
      }
      if (
        Number(error?.response.data?.code) === errorCodes.PHONE_ALREADY_EXISTS
      ) {
        formRef?.current?.setFieldError(
          "phone",
          t(`errors.custom.${errorCodes.PHONE_ALREADY_EXISTS}`)
        );
      }

      toast.error(getTranslatedErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Formik
      initialValues={{ ...initialValues, role }}
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
            />
          </Col>
          <Col md={6} sm={12}>
            <CustomField
              name="lastName"
              type="text"
              className="form-control"
              placeholder={t("client.register.lastName")}
            />
          </Col>
        </Row>
        <CustomField
          name="email"
          type="email"
          className="form-control"
          placeholder={t("client.register.email")}
        />
        <FormGroup className="position-relative">
          <PhoneInputField
            name="phone"
            type="text"
            className="form-control d-flex"
            placeholder={t("client.register.phone")}
            autoComplete="tel"
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
        <div className="text-center">
          <Button
            type="submit"
            size="lg"
            className="bg-gradient-success mt-3 mb-0"
            disabled={loading}>
            {" "}
            {loading ? <Spinner size="sm" /> : t("client.register.button")}
          </Button>
        </div>
      </Form>
    </Formik>
  );
}

function _signUpFormModal({ onSignIn, loading, setLoading, role = 2 }) {
  const { t } = useLanguage();
  return (
    <AuthCard
      title={t("client.register.title")}
      subtitle={t("client.register.subtitle")}
      footer={
        onSignIn && (
          <p className="mb-0 mt-3 text-sm mx-auto">
            {" "}
            {t("client.register.alreadyHaveAccount")}{" "}
            <span
              className="text-success text-gradient font-weight-bold"
              onClick={loading ? null : onSignIn}
              role="button">
              {t("client.register.login")}
            </span>
          </p>
        )
      }>
      <SignUpForm
        onSignIn={onSignIn}
        loading={loading}
        setLoading={setLoading}
        role={role}
      />
    </AuthCard>
  );
}

const SignUpFormModal = withModal(_signUpFormModal);

export { SignUpForm, SignUpFormModal };

SignUpForm.propTypes = {
  onSignIn: PropTypes.func,
  loading: PropTypes.bool.isRequired,
  setLoading: PropTypes.func.isRequired,
  role: PropTypes.number,
};

SignUpFormModal.propTypes = {
  onSignIn: PropTypes.func,
  loading: PropTypes.bool,
  setLoading: PropTypes.func,
  role: PropTypes.number,
};
