import React, { useState, useRef } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Col,
  Button,
  Modal,
  ModalBody,
  Spinner,
} from "reactstrap";
import { Formik, Form } from "formik";
import CustomField from "components/commonUI/forms/CustomField";

import { useUserSignInSchema } from "./constants";
import { usersLogin } from "services/userAuthService";
import { useAppContext } from "contexts/GlobalAppContext";
import { useLanguage } from "contexts/LanguageContext";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

function UserSignInModal({ isOpen, toggle, onSignUp }) {
  const [loading, setLoading] = useState(false);

  const { user } = useAppContext();
  const { t } = useLanguage();

  const formRef = useRef(null);

  const validationSchema = useUserSignInSchema();

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const response = await usersLogin(values);
      if (!Boolean(response?.item)) {
        throw new Error("User not found");
      }
      toast.success(t("common.success"), {
        pauseOnHover: false,
        draggable: false,
      });
      toggle();
      user.set((prev) => ({ ...prev, isAuthenticated: true }));
    } catch {
      formRef.current?.setFieldError("email", t("yup.incorrectCredentials"));
      formRef.current?.setFieldError("password", t("yup.incorrectCredentials"));
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
                  {t("client.login.title")}
                </h4>
                <p className="mb-1 text-sm text-white">
                  {t("client.login.subtitle")}
                </p>
              </div>
            </CardHeader>
            <CardBody className="pb-0">
              <Formik
                initialValues={{
                  email: "",
                  password: "",
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
                    placeholder={t("client.login.email")}
                  />
                  <CustomField
                    name="password"
                    type="password"
                    className="form-control w-100"
                    placeholder={t("client.login.password")}
                  />
                  <div className="text-center">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={loading}
                      className="bg-gradient-success w-100 mt-4 mb-0"
                    >
                      {loading ? (
                        <Spinner size="sm" />
                      ) : (
                        t("client.login.button")
                      )}
                    </Button>
                  </div>
                </Form>
              </Formik>
            </CardBody>
            <CardFooter className="text-center pt-0 pb-3 px-sm-4 px-1">
              <p className="mb-0 mt-3 text-sm mx-auto">
                {" "}
                {t("client.login.noAccount")}{" "}
                <span
                  className="text-success text-gradient font-weight-bold"
                  onClick={onSignUp}
                  role="button"
                >
                  {t("client.login.register")}
                </span>
              </p>
            </CardFooter>
          </Card>
        </Col>
      </ModalBody>
    </Modal>
  );
}

export default UserSignInModal;

UserSignInModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
};
