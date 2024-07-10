import React, { useRef } from "react";

import { Col, Row, FormGroup, Button, Spinner } from "reactstrap";

import { Formik, Form } from "formik";

import PhoneInputField from "components/commonUI/forms/PhoneInputField";
import CustomErrorMessage from "components/commonUI/forms/CustomErrorMessage";
import CustomField from "components/commonUI/forms/CustomField";
import AuthCard from "./AuthCard";
import withModal from "components/client/users/withModal";

import { useUserSignUpSchema } from "components/client/users/validationSchemas";
import { useLanguage } from "contexts/LanguageContext";
import { usersRegister } from "services/userAuthService";

import PropTypes from "prop-types";
import { toast } from "react-toastify";

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  confirmPassword: "",
  role: 2, //TODO this should be later passed as a prop
  authProvider: 1, //TODO this should be changed later for OAuth login
};

function UserSignUpModal({ onSignIn, loading, setLoading }) {
  const { t } = useLanguage();
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
      if (error?.appErrors?.includes("Email already exists")) {
        formRef?.current?.setFieldError("email", t("yup.emailTaken"));
      }
      if (error?.appErrors?.includes("Phone already exists")) {
        formRef?.current?.setFieldError("phone", t("yup.phoneTaken"));
      }

      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title={t("client.register.title")}
      subtitle={t("client.register.subtitle")}
      footer={
        <p className="mb-0 mt-3 text-sm mx-auto">
          {" "}
          {t("client.register.alreadyHaveAccount")}{" "}
          <span
            className="text-success text-gradient font-weight-bold"
            onClick={loading ? null : onSignIn}
            role="button"
          >
            {t("client.register.login")}
          </span>
        </p>
      }
    >
      <Formik
        initialValues={{ ...initialValues }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        innerRef={formRef}
      >
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
              disabled={loading}
            >
              {" "}
              {loading ? <Spinner size="sm" /> : t("client.register.button")}
            </Button>
          </div>
        </Form>
      </Formik>
    </AuthCard>
  );
}

export default withModal(UserSignUpModal);

UserSignUpModal.propTypes = {
  onSignIn: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  setLoading: PropTypes.func.isRequired,
};
