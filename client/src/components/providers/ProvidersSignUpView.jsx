import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SignUpForm } from "components/commonUI/forms/SignUpForm";
import DefaultHeader from "components/commonUI/headers/DefaultHeader";
import AuthCard from "components/commonUI/forms/AuthCard";
import { Container } from "reactstrap";
import { useLanguage } from "contexts/LanguageContext";
import backgroundImage from "assets/images/password-reset-bg.jpg";

function ProvidersSignUpView() {
  const [isLoading, setIsLoading] = useState(false);

  const { t } = useLanguage();

  const navigate = useNavigate();

  const onRegisterSuccess = () => {
    navigate("/provider");
  };

  return (
    <>
      <DefaultHeader
        backgroundImage={backgroundImage}
        className="m-3 border-radius-xl min-vh-50"
      />
      <Container className="mt-md-n10">
        <AuthCard
          title={t("client.register.title")}
          subtitle={t("client.register.subtitle")}
          xl="4"
          lg="6"
          md="8"
          sm="10"
          xs="12"
        >
          <SignUpForm
            isLoading={isLoading}
            setLoading={setIsLoading}
            role={3}
            onSignIn={onRegisterSuccess}
          />
        </AuthCard>
      </Container>
    </>
  );
}

export default ProvidersSignUpView;
