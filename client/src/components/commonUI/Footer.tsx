import React from "react";
import { Link } from "react-router-dom";
import { Row, Col, Container } from "reactstrap";
import { useLanguage } from "contexts/LanguageContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faAddressBook,
  faCalendarPlus,
  faCalendarDays,
  faCashRegister,
} from "@fortawesome/free-solid-svg-icons";

interface FooterNavigationProps {
  hotelId?: string;
}

const FooterNavigation = ({ hotelId }: FooterNavigationProps) => {
  if (!hotelId) {
    return null;
  }

  return (
    <div className="bg-light w-100 py-2 text-center d-md-none fixed-bottom">
      <Row className="px-5">
        <Col>
          <Row className="d-flex align-items-center">
            <Col>
              <Row className="d-flex align-items-center">
                <Link to={`/hotels/${hotelId}`}>
                  <FontAwesomeIcon icon={faHome} />
                </Link>
              </Row>
            </Col>
          </Row>
        </Col>
        <Col>
          <Row className="d-flex align-items-center">
            <Link to={`/hotels/${hotelId}/bookings`}>
              <FontAwesomeIcon icon={faAddressBook} />
            </Link>
          </Row>
        </Col>
        <Col>
          <Row className="d-flex align-items-center">
            <Link to={`/hotels/${hotelId}/bookings/add`}>
              <FontAwesomeIcon icon={faCalendarPlus} size="lg" />
            </Link>
          </Row>
        </Col>
        <Col>
          <Row className="d-flex align-items-center">
            <Link to={`/hotels/${hotelId}/bookings/calendar`}>
              <FontAwesomeIcon icon={faCalendarDays} />
            </Link>
          </Row>
        </Col>
        <Col>
          <Row className="d-flex align-items-center">
            <Link to={`/hotels/${hotelId}/transactions`}>
              <FontAwesomeIcon icon={faCashRegister} />
            </Link>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

const FooterInfo = () => {
  const { t } = useLanguage(); // added

  return (
    <Row className="w-100 no-print py-3 d-none d-md-flex">
      <footer className="text-center mt-2">
        &copy; 2025 Tourgo. {t("commonUI.footer.rightsReserved")}
        <div></div>
        <Link to={`/privacy-policy`} className="footer-link mx-2">
          {t("commonUI.footer.privacyPolicy")}
        </Link>
        <Link to="/investors" className="footer-link mx-2">
          {t("commonUI.footer.investors")}
        </Link>
        <Link to="/careers" className="footer-link mx-2">
          {t("commonUI.footer.careers")}
        </Link>
      </footer>
    </Row>
  );
};

interface FooterProps {
  hotelId?: string;
}

function Footer({ hotelId }: FooterProps) {
  return (
    <React.Fragment>
      <footer className="footer mt-5">
        <Container fluid={true}>
          <FooterNavigation hotelId={hotelId} />
          <FooterInfo />
        </Container>
      </footer>
    </React.Fragment>
  );
}

export default Footer;
