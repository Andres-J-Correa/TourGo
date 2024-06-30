import React from "react";
import { Link, NavLink } from "react-router-dom";

import HoverDropdown from "./HoverDropdown";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

import { DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";

function NavbarItem({ route }) {
  const routeInnerItemMapper = (innerItem, innerIndex) => (
    <DropdownItem
      className="text-body-secondary text-capitalize"
      key={`inner-${innerIndex}-${innerItem.name}`}
    >
      <Link to={innerItem.path}>{innerItem.name}</Link>
    </DropdownItem>
  );

  const routeSubItemMapper = (subItem, subIndex) => (
    <React.Fragment key={`sub-${subIndex}-${subItem.name}`}>
      <DropdownItem
        header
        className="font-weight-bolder align-items-center px-1 text-capitalize fs-6"
      >
        {Boolean(subItem.path) ? (
          <Link to={subItem.path}>{subItem.name}</Link>
        ) : (
          subItem.name
        )}
      </DropdownItem>
      {Boolean(subItem.collapse) &&
        !Boolean(subItem.path) &&
        subItem.collapse.map(routeInnerItemMapper)}
    </React.Fragment>
  );

  if (Boolean(route.collapse)) {
    return (
      <HoverDropdown nav inNavbar className="mx-2">
        <DropdownToggle
          nav
          className="ps-2 d-flex cursor-pointer align-items-center nav-link text-capitalize"
        >
          {Boolean(route.icon) && route.icon}
          {route.name}
          <FontAwesomeIcon icon={faChevronDown} size="xs" className="ms-2" />
        </DropdownToggle>
        <DropdownMenu
          flip
          className="border-0 shadow mt-3 px-3 border-radius-xl"
        >
          <div className="hidden-box">{/* For hover effect */}</div>
          {route.collapse.map(routeSubItemMapper)}
        </DropdownMenu>
      </HoverDropdown>
    );
  } else if (Boolean(route.path)) {
    return (
      <NavLink to={route.path} className="nav-link text-capitalize">
        {route.icon && (
          <FontAwesomeIcon icon={route.icon.props.icon} className="me-2 icon" />
        )}
        {route.name}
      </NavLink>
    );
  } else {
    return null;
  }
}

export default NavbarItem;
