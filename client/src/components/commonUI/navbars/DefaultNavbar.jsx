import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar, NavbarToggler, Collapse, Nav } from "reactstrap";
import NavbarItem from "./NavbarItem";
import LanguageSelector from "components/commonUI/languages/LanguageSelector";
import { useAppContext } from "contexts/GlobalAppContext";
import { useLanguage } from "contexts/LanguageContext";
import PropTypes from "prop-types";
import classNames from "classnames";
import "./navbar.css";

const _logger = require("debug")("navbar");

function DefaultNavbar({
  brand = "TourGo",
  isOpen,
  toggle,
  navbarItems,
  showLanguageSelector = true,
  leftCustomComponents,
  rightCustomComponents,
}) {
  _logger("DefaultNavbar rendering");

  const [mappedItems, setMappedItems] = useState({
    right: [],
    left: [],
  });

  const { user, hotel } = useAppContext();
  const { t } = useLanguage();

  useEffect(() => {
    const leftItems = [],
      rightItems = [];

    if (!navbarItems) return;

    for (let i = 0; i < navbarItems?.length; i++) {
      const element = navbarItems[i];

      if (!element.isAnonymous && !user.current?.isAuthenticated) {
        continue;
      } else if (element.position === "left") {
        leftItems.push(
          <NavbarItem
            navItem={element}
            key={`navbar-item-${i}-${element.name}`}
            toggle={toggle}
          />
        );
      } else {
        rightItems.push(
          <NavbarItem
            navItem={element}
            key={`navbar-item-${i}-${element.name}`}
            toggle={toggle}
          />
        );
      }
    }

    const leftCustomComps = leftCustomComponents || [];
    const rightCustomComps = rightCustomComponents || [];

    setMappedItems({
      right: [...rightItems, ...rightCustomComps],
      left: [...leftCustomComps, ...leftItems],
    });
  }, [navbarItems, user, leftCustomComponents, rightCustomComponents, toggle]);

  return (
    <div className="navbar-container no-print">
      <Navbar expand="lg" className="shadow p-2 z-3">
        <div className="font-weight-bolder ms-sm-3 navbar-brand">
          <Link
            to={hotel.current?.id ? `/hotels/${hotel.current?.id}` : "/"}
            className="text-decoration-none text-white">
            {hotel.isLoading
              ? t("commonUI.loadingOverlay.processing")
              : hotel.current?.name || brand}
          </Link>
        </div>
        <NavbarToggler onClick={toggle} className="shadow-none ms-2" />
        <Collapse isOpen={isOpen} navbar className="pt-3 pb-2 py-lg-0 w-100">
          <Nav className="justify-content-end w-100" navbar>
            <div
              className={classNames("left-items", {
                "three-dots-loader mx-auto": hotel.isLoading,
              })}>
              {mappedItems.left}
            </div>
            <div className="right-items">
              {showLanguageSelector && <LanguageSelector toggle={toggle} />}
              {mappedItems.right}
            </div>
          </Nav>
        </Collapse>
      </Navbar>
    </div>
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
