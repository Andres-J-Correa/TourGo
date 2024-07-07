import React, { useState, useRef } from "react";

import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Col,
  Row,
  FormGroup,
  Button,
  Modal,
  ModalBody,
  Spinner,
} from "reactstrap";

import { Formik, Form } from "formik";

import PhoneInputField from "components/commonUI/forms/PhoneInputField";
import CustomErrorMessage from "components/commonUI/forms/CustomErrorMessage";
import CustomField from "components/commonUI/forms/CustomField";

import { useUserSignUpSchema } from "./constants";
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

function UserSignUpModal({ isOpen, toggle, onSignIn }) {
  const [loading, setLoading] = useState(false);

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
      toast.success(t("common.success"), {
        pauseOnHover: false,
        draggable: false,
      });
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
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      centered={true}
      className="px-sm-5"
      backdrop={loading ? "static" : true}
      keyboard={!loading}
    >
      <ModalBody className="p-0">
        <Col xs="12" className="mx-auto">
          <Card className="z-index-0">
            <CardHeader className="p-0 position-relative mt-n4 mx-3 z-index-2">
              <div className="bg-gradient-success shadow-info border-radius-lg py-3 pe-1 text-center py-4">
                <h4 className="font-weight-bolder text-white mt-1 mb-0">
                  {t("client.register.title")}
                </h4>
                <p className="mb-1 text-sm text-white">
                  {t("client.register.subtitle")}
                </p>
              </div>
            </CardHeader>
            <CardBody className="pb-0">
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
                      className="form-control"
                      placeholder={t("client.register.phone")}
                    />
                    <CustomErrorMessage name="phone" />
                  </FormGroup>
                  <CustomField
                    name="password"
                    type="password"
                    className="form-control"
                    placeholder={t("client.register.password")}
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
                      className="bg-gradient-success mt-4 mb-0"
                      disabled={loading}
                    >
                      {" "}
                      {loading ? (
                        <Spinner size="sm" />
                      ) : (
                        t("client.register.button")
                      )}
                    </Button>
                  </div>
                </Form>
              </Formik>
            </CardBody>
            <CardFooter className="text-center pt-0 pb-3 px-sm-4 px-1">
              <p className="mb-0 mt-3 text-sm mx-auto">
                {" "}
                {t("client.register.alreadyHaveAccount")}{" "}
                <span
                  className="text-success text-gradient font-weight-bold"
                  onClick={onSignIn}
                  role="button"
                >
                  {t("client.register.login")}
                </span>
              </p>
            </CardFooter>
          </Card>
        </Col>
      </ModalBody>
    </Modal>
  );
}

export default UserSignUpModal;

UserSignUpModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
};
