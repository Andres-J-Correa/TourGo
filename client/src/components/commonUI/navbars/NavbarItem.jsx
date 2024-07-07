import React from "react";
import { Link, NavLink } from "react-router-dom";

import HoverDropdown from "./HoverDropdown";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

import { DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";

import Proptypes from "prop-types";

function NavbarItem({ navItem }) {
  const innerItemMapper = (innerItem, innerIndex) => (
    <Link
      className="text-capitalize dropdown-item"
      key={`inner-${innerIndex}-${innerItem.name}`}
      to={innerItem.path}
    >
      {innerItem.name}
    </Link>
  );

  const subItemMapper = (subItem, subIndex) => (
    <React.Fragment key={`sub-${subIndex}-${subItem.name}`}>
      {Boolean(subItem.path) ? (
        <Link to={subItem.path} className="text-capitalize dropdown-item">
          {subItem.name}
        </Link>
      ) : (
        <DropdownItem
          header
          className="font-weight-bolder align-items-center px-1 text-capitalize"
        >
          {subItem.name}
        </DropdownItem>
      )}
      {Boolean(subItem.collapse) &&
        !Boolean(subItem.path) &&
        subItem.collapse.map(innerItemMapper)}
    </React.Fragment>
  );

  if (Boolean(navItem.collapse)) {
    return (
      <HoverDropdown nav inNavbar className="mx-2">
        <DropdownToggle
          nav
          role="button"
          className="ps-2 d-flex cursor-pointer align-items-center nav-link text-capitalize"
        >
          {Boolean(navItem.icon) && navItem.icon}
          {navItem.name}
          <FontAwesomeIcon
            icon={faChevronDown}
            size="xs"
            className="down-arrow"
          />
        </DropdownToggle>
        <DropdownMenu flip className="border-0 shadow px-3 border-radius-xl">
          <div className="hidden-box">{/* For hover effect */}</div>
          {navItem.collapse.map(subItemMapper)}
        </DropdownMenu>
      </HoverDropdown>
    );
  } else if (Boolean(navItem.path)) {
    return (
      <NavLink to={navItem.path} className="nav-link text-capitalize">
        {navItem.icon && (
          <FontAwesomeIcon
            icon={navItem.icon.props.icon}
            className="me-2 icon"
          />
        )}
        {navItem.name}
      </NavLink>
    );
  } else {
    return null;
  }
}

export default NavbarItem;

NavbarItem.propTypes = {
  navItem: Proptypes.shape({
    name: Proptypes.string.isRequired,
    path: Proptypes.string,
    icon: Proptypes.any.isRequired,
    collapse: Proptypes.arrayOf(
      Proptypes.shape({
        name: Proptypes.string.isRequired,
        path: Proptypes.string,
        collapse: Proptypes.arrayOf(
          Proptypes.shape({
            name: Proptypes.string.isRequired,
            path: Proptypes.string,
          })
        ),
      })
    ),
  }),
};
