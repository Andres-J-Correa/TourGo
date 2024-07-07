import React, { useState, useEffect } from "react";

import {
  Container,
  Row,
  Col,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Collapse,
  Nav,
} from "reactstrap";

import NavbarItem from "./NavbarItem";
import UserAccountDropdown from "components/client/users/UserAccountDropdown";
import LanguageSelector from "components/commonUI/languages/LanguageSelector";

import PropTypes from "prop-types";
import "./navbar.css";

function DefaultNavbar({
  brand = "Tour Go",
  isOpen,
  toggle,
  navbarItems = [],
  showLanguageSelector = true,
  showUserItem = true,
}) {
  const [mappedItems, setMappedItems] = useState([]);

  useEffect(() => {
    const navbarMappedItems = navbarItems.map((item, index) => (
      <NavbarItem navItem={item} key={`navbar-item-${index}-${item.name}`} />
    ));

    setMappedItems(navbarMappedItems);
  }, [navbarItems]);

  return (
    <Container className="position-sticky z-index-sticky top-0">
      <Row>
        <Col xs="12">
          <Navbar
            color="light"
            light
            expand="lg"
            className="blur border-radius-xl top-0 z-index-fixed shadow position-absolute my-3 p-2 start-0 end-0 mx-4"
          >
            <NavbarBrand className="font-weight-bolder ms-sm-3" href="/">
              {brand}
            </NavbarBrand>
            <NavbarToggler onClick={toggle} className="shadow-none ms-2" />
            <Collapse
              isOpen={isOpen}
              navbar
              className="pt-3 pb-2 py-lg-0 w-100"
            >
              <Nav className="ms-auto" navbar>
                {showLanguageSelector && <LanguageSelector />}
                {mappedItems}
                {showUserItem && <UserAccountDropdown />}
              </Nav>
            </Collapse>
          </Navbar>
        </Col>
      </Row>
    </Container>
  );
}

DefaultNavbar.propTypes = {
  brand: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  navbarItems: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      path: PropTypes.string,
      collapse: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          path: PropTypes.string,
          collapse: PropTypes.arrayOf(
            PropTypes.shape({
              name: PropTypes.string.isRequired,
              path: PropTypes.string,
            })
          ),
        })
      ),
    })
  ),
};

export default DefaultNavbar;
