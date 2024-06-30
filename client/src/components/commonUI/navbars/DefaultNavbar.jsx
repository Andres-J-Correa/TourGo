import React from "react";

import NavbarItem from "./NavbarItem";

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

import { publicRoutes } from "routes/publicRoutes";

import Proptypes from "prop-types";

import "./navbar.css";

function DefaultNavbar({ brand = "TourGo" }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const mapNavbarItems = (routes) => {
    return routes
      .filter((route) => route.isNavbar)
      .map((route, index) => (
        <NavbarItem route={route} key={`nav-item-${index}-${route.name}`} />
      ));
  };

  const toggle = () => setIsOpen(!isOpen);

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
            <NavbarToggler
              onClick={toggle}
              className="shadow-none ms-2"
            ></NavbarToggler>
            <Collapse
              isOpen={isOpen}
              navbar
              className="pt-3 pb-2 py-lg-0 w-100"
            >
              <Nav className="ms-auto" navbar>
                {mapNavbarItems(publicRoutes)}
              </Nav>
            </Collapse>
          </Navbar>
        </Col>
      </Row>
    </Container>
  );
}

export default DefaultNavbar;

DefaultNavbar.propTypes = {
  brand: Proptypes.string,
};
