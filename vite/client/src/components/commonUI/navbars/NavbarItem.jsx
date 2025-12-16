import React from "react";
import { Link, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import {
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
} from "reactstrap";
import PropTypes from "prop-types";
import classNames from "classnames";
import "./navbaritem.css";

// Helper function to render inner items in a dropdown
const renderInnerItem = (toggle) => (innerItem, innerIndex) => {
  return (
    <NavbarItem
      navItem={innerItem}
      key={`inner-${innerIndex}-${innerItem.name}`}
      isInnerItem={true}
      toggle={toggle}
    />
  );
};

// Main NavbarItem component
const NavbarItem = React.memo(({ navItem, isInnerItem, toggle }) => {
  // Render dropdown menu if the nav item has a collapse property

  // Helper function to render sub-items in a dropdown
  const renderSubItem = (subItem, subIndex) => {
    const isHeader = subItem.collapse?.length > 0;
    return (
      <React.Fragment key={`sub-${subIndex}-${subItem.name}`}>
        {subItem.path ? (
          <Link
            to={subItem.path}
            className={classNames("dropdown-item", {
              "text-uppercase": subItem.uppercase,
              "text-capitalize": subItem.capitalize,
              "item-long-text": subItem?.name?.length > 25,
            })}>
            {subItem.name}
          </Link>
        ) : (
          <DropdownItem
            header={isHeader}
            className={classNames(
              {
                "font-weight-bolder": isHeader,
                "text-uppercase": subItem.uppercase,
                "text-capitalize": subItem.capitalize,
                "item-long-text": subItem?.name?.length > 25,
              },
              "align-items-center px-1"
            )}
            onClick={() => {
              if (subItem.action) {
                subItem.action();
                toggle && toggle();
              }
            }}>
            {subItem.name}
          </DropdownItem>
        )}
        {subItem.collapse && subItem.collapse.map(renderInnerItem(toggle))}
      </React.Fragment>
    );
  };

  const renderDropdownMenu = () => (
    <>
      <UncontrolledDropdown nav inNavbar className="mx-1 d-none d-md-block">
        <DropdownToggle
          nav
          role="button"
          className={classNames(
            "ps-2 d-flex cursor-pointer align-items-center nav-link",
            {
              "text-uppercase": navItem.uppercase,
              "text-capitalize": navItem.capitalize,
            }
          )}
          title={navItem?.name?.length > 20 ? navItem.name : undefined}>
          {navItem.icon && (
            <FontAwesomeIcon icon={navItem.icon} className="me-2 icon" />
          )}
          {navItem.name.length > 25
            ? `${navItem.name.substring(0, 20)}...`
            : navItem.name}
          <FontAwesomeIcon
            icon={faChevronDown}
            size="xs"
            className="down-arrow"
          />
        </DropdownToggle>
        <DropdownMenu
          flip
          end={navItem.end}
          className="navbar-dropdown-menu px-2">
          <div className="hidden-box">{/* For hover effect */}</div>
          {navItem.collapse.map(renderSubItem)}
        </DropdownMenu>
      </UncontrolledDropdown>
      {/* Mobile Dropdown */}
      <UncontrolledDropdown
        nav
        inNavbar
        className={classNames("mx-1 d-md-none position-relative", {
          "d-none": navItem.desktopOnly,
        })}>
        <DropdownToggle
          nav
          role="button"
          className={classNames(
            "ps-2 d-flex cursor-pointer align-items-center nav-link",
            {
              "text-uppercase": navItem.uppercase,
              "text-capitalize": navItem.capitalize,
            }
          )}
          title={navItem?.name?.length > 20 ? navItem.name : undefined}>
          {navItem.icon && (
            <FontAwesomeIcon icon={navItem.icon} className="me-2 icon" />
          )}
          {navItem.name.length > 25
            ? `${navItem.name.substring(0, 20)}...`
            : navItem.name}
          <FontAwesomeIcon
            icon={faChevronDown}
            size="xs"
            className="down-arrow"
          />
        </DropdownToggle>
        <DropdownMenu
          flip
          end={navItem.end}
          className="navbar-dropdown-menu px-2">
          {navItem.collapse.map(renderSubItem)}
        </DropdownMenu>
      </UncontrolledDropdown>
    </>
  );

  // Render a link if the nav item has a path property
  const renderNavLink = () => {
    return (
      <NavLink
        end
        to={navItem.path}
        target={navItem.newTab ? "_blank" : undefined}
        className={classNames("mx-1 px-2", {
          "text-uppercase": navItem.uppercase,
          "text-capitalize": navItem.capitalize,
          "dropdown-item": isInnerItem,
          "nav-link": !isInnerItem,
          "d-none d-md-block": navItem.desktopOnly,
        })}>
        <div>
          {" "}
          {navItem.icon && (
            <FontAwesomeIcon icon={navItem.icon} className="me-2 icon" />
          )}
          {navItem.name}
        </div>
      </NavLink>
    );
  };

  // Render a dropdown item with an action if the nav item has an action property
  const renderActionItem = () => (
    <div
      className={classNames("px-1", {
        "text-uppercase": navItem?.uppercase,
        "text-capitalize": navItem?.capitalize,
        "dropdown-item": isInnerItem,
        "d-none d-md-block": navItem.desktopOnly,
      })}
      onClick={() => {
        navItem.action();
        toggle && toggle();
      }}
      role="button">
      {navItem.name}
    </div>
  );

  // Render a default dropdown item if none of the above properties are present
  const renderDefaultItem = () => (
    <DropdownItem
      header
      className={classNames("text-center px-1", {
        "text-uppercase": navItem.uppercase,
        "text-capitalize": navItem.capitalize,
        "dropdown-item": isInnerItem,
      })}>
      {navItem.name}
    </DropdownItem>
  );

  // Determine which rendering function to use based on the nav item's properties
  if (navItem.collapse?.length > 0) {
    return renderDropdownMenu();
  } else if (navItem.path && !navItem.action) {
    return renderNavLink();
  } else if (navItem.action) {
    return renderActionItem();
  } else {
    return renderDefaultItem();
  }
});

export default NavbarItem;

NavbarItem.propTypes = {
  navItem: PropTypes.shape({
    name: PropTypes.string.isRequired,
    path: PropTypes.string, // path is not required if action is present
    action: PropTypes.func, // action is not required if path is present
    icon: PropTypes.object,
    uppercase: PropTypes.bool,
    capitalize: PropTypes.bool,
    collapse: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        path: PropTypes.string,
        action: PropTypes.func,
        uppercase: PropTypes.bool,
        capitalize: PropTypes.bool,
        collapse: PropTypes.arrayOf(
          PropTypes.shape({
            name: PropTypes.string.isRequired,
            path: PropTypes.string,
            action: PropTypes.func,
            uppercase: PropTypes.bool,
            capitalize: PropTypes.bool,
          })
        ),
      })
    ),
  }).isRequired,
};
