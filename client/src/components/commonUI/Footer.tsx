import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Row,
  Col,
  Container,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { useLanguage } from "contexts/LanguageContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faCalendarCheck,
  faCalendarPlus,
  faCalendarDays,
  faCashRegister,
} from "@fortawesome/free-solid-svg-icons";

interface FooterNavigationProps {
  hotelId?: string;
}

const FooterNavigation = ({ hotelId }: FooterNavigationProps) => {
  const [bookingsDropdownOpen, setBookingsDropdownOpen] = useState(false);

  const toggleBookingsDropdown = () =>
    setBookingsDropdownOpen((prevState) => !prevState);

  const { t } = useLanguage();

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
              <FontAwesomeIcon icon={faCalendarCheck} />
            </Link>
          </Row>
        </Col>
        <Col>
          <Row className="d-flex align-items-center">
            <Dropdown
              isOpen={bookingsDropdownOpen}
              toggle={toggleBookingsDropdown}
              inNavbar
              direction="up">
              <DropdownToggle nav color="dark">
                <FontAwesomeIcon icon={faCalendarPlus} size="lg" />
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem>
                  <Link to={`/hotels/${hotelId}/bookings/new`}>
                    {t("commonUI.footer.newBooking")}
                  </Link>
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem>
                  <Link to={`/hotels/${hotelId}/bookings/quote`}>
                    {t("commonUI.footer.newQuote")}
                  </Link>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </Row>
        </Col>
        <Col>
          <Row className="d-flex align-items-center">
            <Link to={`/hotels/${hotelId}/calendar`}>
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
  const { t } = useLanguage();

  const publicUrl = process.env.REACT_APP_PUBLIC_URL || "";
  return (
    <Row className="w-100 no-print py-3 d-none d-md-flex">
      <footer className="text-center mt-2">
        &copy; 2025 Tourgo. {t("commonUI.footer.rightsReserved")}
        <div></div>
        <Link to={`${publicUrl}/legal/privacy-policy.html`} className="footer-link mx-2">
          {t("commonUI.footer.privacyPolicy")}
        </Link>
        <Link to={`${publicUrl}/legal/terms-of-service.html`} className="footer-link mx-2">
          {t("commonUI.footer.termsOfService")}
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
