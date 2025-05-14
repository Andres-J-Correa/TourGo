import React from "react";
import { Container } from "reactstrap";
import Breadcrumb from "components/commonUI/Breadcrumb";

const LandingPage = () => {
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
          <p className="fs-5">
            Por favor, inicia sesión o regístrate desde la barra de navegacion
            ☝️.
          </p>
        </div>
      </Container>
    </div>
  );
};

export default LandingPage;
