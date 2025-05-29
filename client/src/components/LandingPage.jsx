import React, { useState } from "react";
import { Container } from "reactstrap";
import Breadcrumb from "components/commonUI/Breadcrumb";
import { UserSignInForm } from "components/users/UserSignInForm";

const LandingPage = () => {
  const [loading, setLoading] = useState(false);
  return (
    <div>
      <Container className="text-center mt-5">
        <Breadcrumb active="Inicio" />
        <div className="jumbotron">
          <h1 className="display-3">Bienvenido a TourGo</h1>
          <p className="lead">
            Tu plataforma para administrar tu alojamiento de manera facil!
          </p>
          <hr className="my-4" />
          {/* < UserSignInForm
          toggle={() => {}}
          onSignUp={() => {}}
          loading={loading}
          setLoading={setLoading}
        /> */}
        </div>
      </Container>
    </div>
  );
};

export default LandingPage;
