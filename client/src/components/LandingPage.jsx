import React, { useState } from "react";
import { Link } from "react-router-dom";

import Breadcrumb from "components/commonUI/Breadcrumb";
import LoadingOverlay from "./commonUI/loaders/LoadingOverlay";
import ErrorBoundary from "./commonUI/ErrorBoundary";

import { UserSignInForm } from "components/users/UserSignInForm";
import { SignUpForm } from "components/users/SignUpForm";
import { Col, Row } from "reactstrap";
import { useAppContext } from "contexts/GlobalAppContext";

const LandingPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user } = useAppContext();

  const handleSignUp = () => {
    setIsSignUp(true);
  };

  const handleSignIn = () => {
    setIsSignUp(false);
  };

  const renderSignInForm = () => (
    <Col xs="12" sm="8" md="6" lg="4">
      <UserSignInForm
        loading={loading}
        setLoading={setLoading}
        onSignUp={handleSignUp}
      />
    </Col>
  );

  const renderSignUpForm = () => (
    <Col xs="12" sm="8" md="6" lg="4">
      <SignUpForm
        loading={loading}
        setLoading={setLoading}
        onSignIn={handleSignIn}
      />
    </Col>
  );

  const renderGoToHotels = () => {
    return (
      <div className="text-center">
        <Link to="/hotels" className="btn btn-dark btn-lg">
          Ir a Hoteles
        </Link>
      </div>
    );
  };

  return (
    <>
      <Breadcrumb active="Inicio" />
      <LoadingOverlay isVisible={loading} />
      <ErrorBoundary>
        <div className="jumbotron text-center">
          <h1 className="display-3">Bienvenido a TourGo</h1>
          <p className="lead">
            Tu plataforma para administrar tu alojamiento de manera facil!
          </p>
          <hr className="my-4" />
          <Row className="justify-content-center mt-5 mb-3">
            {user.current.isAuthenticated
              ? renderGoToHotels()
              : isSignUp
              ? renderSignUpForm()
              : renderSignInForm()}
          </Row>
        </div>
      </ErrorBoundary>
    </>
  );
};

export default LandingPage;
