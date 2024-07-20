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
import LanguageSelector from "components/commonUI/languages/LanguageSelector";

import { useAppContext } from "contexts/GlobalAppContext";

import PropTypes from "prop-types";
import "./navbar.css";

function DefaultNavbar({
  brand = "Tour Go",
  isOpen,
  toggle,
  navbarItems = [],
  showLanguageSelector = true,
  leftCustomComponents = [],
  rightCustomComponents = [],
}) {
  const [mappedItems, setMappedItems] = useState({
    right: [],
    left: [],
  });

  const { user } = useAppContext();

  useEffect(() => {
    const leftItems = [],
      rightItems = [];

    for (let i = 0; i < navbarItems.length; i++) {
      const element = navbarItems[i];

      if (!element.isAnonymous && !user.current?.isAuthenticated) {
        continue;
      } else if (element.position === "left") {
        leftItems.push(
          <NavbarItem
            navItem={element}
            key={`navbar-item-${i}-${element.name}`}
          />
        );
      } else {
        rightItems.push(
          <NavbarItem
            navItem={element}
            key={`navbar-item-${i}-${element.name}`}
          />
        );
      }
    }

    setMappedItems({
      right: [...rightItems, ...rightCustomComponents],
      left: [...leftCustomComponents, ...leftItems],
    });
  }, [navbarItems, user, leftCustomComponents, rightCustomComponents]);

  return (
    <Container className="position-sticky z-index-sticky top-0">
      <Row>
        <Col xs="12">
          <Navbar
            expand="lg"
            className="blur border-radius-xl top-0 z-index-fixed shadow position-absolute my-4 p-2 start-0 end-0 mx-4"
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
              <Nav className="justify-content-end w-100" navbar>
                <div className="left-items">{mappedItems.left}</div>
                <div className="right-items">
                  {showLanguageSelector && <LanguageSelector />}
                  {mappedItems.right}
                </div>
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
  showLanguageSelector: PropTypes.bool,
  leftCustomComponents: PropTypes.arrayOf(PropTypes.node),
  rightCustomComponents: PropTypes.arrayOf(PropTypes.node),
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
