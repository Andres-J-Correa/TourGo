import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Container, Button, Spinner } from "reactstrap";
import { Formik, Form } from "formik";
import CustomField from "components/commonUI/forms/CustomField";
import DefaultHeader from "components/commonUI/headers/DefaultHeader";
import AuthCard from "./AuthCard";
import { useUserPasswordChangeSchema } from "components/client/users/validationSchemas";
import { toast } from "react-toastify";
import { useLanguage } from "contexts/LanguageContext";
import { changePassword, validateToken } from "services/userAuthService";
import "react-lazy-load-image-component/src/effects/blur.css";
import backgroundImage from "assets/images/password-reset-bg.jpg";
import NoRecords404 from "components/commonUI/errors/NoRecords404";

function UserPasswordChange() {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [isTokenValid, setIsTokenValid] = useState(null);

  const [searchParams] = useSearchParams();
  const tokenId = searchParams.get("tokenId");

  const navigate = useNavigate();
  const { t } = useLanguage();
  const validationSchema = useUserPasswordChangeSchema();
  const formRef = useRef(null);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await changePassword({ ...values, token: tokenId });
      if (!response?.isSuccessful) {
        throw new Error(response?.message || "Error changing password");
      }
      toast.success(t("common.success"));
      setIsTokenValid(false);
      navigate("/");
    } catch {
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && isTokenValid === null) {
      validateToken(token)
        .then((response) => {
          setIsTokenValid(response?.item ? true : false);
        })
        .catch(() => {
          toast.warning(t("common.redirecting"), {
            autoClose: 3000,
          });
          setTimeout(() => navigate("/"), 3000);
        });
    }
  }, [isTokenValid, token, t, navigate]);

  useEffect(() => {
    if (!token && tokenId) {
      setToken(tokenId);
    }
  }, [tokenId, token]);

  return (
    <>
      {isTokenValid ? (
        <>
          <DefaultHeader
            backgroundImage={backgroundImage}
            className="max-vh-50 m-3 border-radius-xl"
          />
          <Container className="mt-md-n8">
            <AuthCard
              title={t("client.passwordChange.title")}
              subtitle={t("client.passwordChange.subtitle")}
              xl="4"
              lg="6"
              md="8"
              sm="10"
              xs="12"
            >
              <Formik
                initialValues={{
                  password: "",
                  confirmPassword: "",
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                innerRef={formRef}
              >
                <Form>
                  <CustomField
                    name="password"
                    type="password"
                    className="form-control"
                    placeholder={t("client.passwordChange.newPassword")}
                    autoComplete="new-password"
                  />
                  <CustomField
                    name="confirmPassword"
                    type="password"
                    className="form-control w-100"
                    placeholder={t("client.passwordChange.confirmPassword")}
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
                        t("client.passwordChange.button")
                      )}
                    </Button>
                  </div>
                </Form>
              </Formik>
            </AuthCard>
          </Container>
        </>
      ) : (
        <NoRecords404 />
      )}
    </>
  );
}

export default UserPasswordChange;
