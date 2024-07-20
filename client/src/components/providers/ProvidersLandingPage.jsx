import React from "react";
import DefaultHeader from "components/commonUI/headers/DefaultHeader";
import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import backgroundImage from "assets/images/providers-landing-bg.jpg";

function ProvidersLandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/provider/signup");
  };

  return (
    <React.Fragment>
      <DefaultHeader backgroundImage={backgroundImage} className="min-vh-75">
        <Container>
          <Row>
            <Col lg={7}>
              <h1 className="text-light">
                Join Our Platform and Boost Your Sales!
              </h1>
              <p className="lead text-white pe-md-5 me-md-5 opacity-8">
                Become a part of our community and showcase your tours to a
                wider audience, increasing your bookings and brand visibility.
              </p>
              <div>
                <Button
                  className="bg-gradient-success mt-4"
                  onClick={handleGetStarted}
                >
                  Get Started
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </DefaultHeader>
      <Card className="blur mx-3 mx-md-4 mt-n6 mb-4">
        <CardBody>
          <h1>Coming Soon...</h1>
        </CardBody>
      </Card>
    </React.Fragment>
  );
}

export default ProvidersLandingPage;
