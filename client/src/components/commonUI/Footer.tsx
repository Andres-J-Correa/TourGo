import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
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
import "./Footer.css";

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
                <NavLink to={`/hotels/${hotelId}`} end>
                  <FontAwesomeIcon icon={faHome} />
                </NavLink>
              </Row>
            </Col>
          </Row>
        </Col>
        <Col>
          <Row className="d-flex align-items-center">
            <NavLink to={`/hotels/${hotelId}/bookings`} end>
              <FontAwesomeIcon icon={faCalendarCheck} />
            </NavLink>
          </Row>
        </Col>
        <Col>
          <Row className="d-flex align-items-center">
            <Dropdown
              isOpen={bookingsDropdownOpen}
              toggle={toggleBookingsDropdown}
              inNavbar
              direction="up">
              <DropdownToggle nav color="dark" className="footer-dropdown">
                <FontAwesomeIcon icon={faCalendarPlus} size="lg" />
              </DropdownToggle>
              <DropdownMenu className="footer-dropdown-menu">
                <DropdownItem>
                  <NavLink to={`/hotels/${hotelId}/bookings/new`} end>
                    {t("commonUI.footer.newBooking")}
                  </NavLink>
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem>
                  <NavLink to={`/hotels/${hotelId}/bookings/quote`} end>
                    {t("commonUI.footer.newQuote")}
                  </NavLink>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </Row>
        </Col>
        <Col>
          <Row className="d-flex align-items-center">
            <NavLink to={`/hotels/${hotelId}/calendar`} end>
              <FontAwesomeIcon icon={faCalendarDays} />
            </NavLink>
          </Row>
        </Col>
        <Col>
          <Row className="d-flex align-items-center">
            <NavLink to={`/hotels/${hotelId}/transactions`} end>
              <FontAwesomeIcon icon={faCashRegister} />
            </NavLink>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

const FooterInfo = () => {
  const { t } = useLanguage();

  const publicUrl = import.meta.env.VITE_PUBLIC_URL || "";
  return (
    <Row className="w-100 no-print py-3 d-none d-md-flex">
      <footer className="text-center mt-2">
        &copy; 2025 Tourgo. {t("commonUI.footer.rightsReserved")}
        <div></div>
        <Link
          to={`${publicUrl}/legal/privacy-policy.html`}
          className="footer-link mx-2">
          {t("commonUI.footer.privacyPolicy")}
        </Link>
        <Link
          to={`${publicUrl}/legal/terms-of-service.html`}
          className="footer-link mx-2">
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
