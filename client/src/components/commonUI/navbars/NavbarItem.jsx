import React from "react";
import { NavLink } from "react-router-dom";
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

// --- Leaf Components ---

/**
 * Renders a simple navigation link.
 */
const NavbarLink = ({ navItem, isInnerItem }) => (
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

NavbarLink.propTypes = {
  navItem: PropTypes.object.isRequired,
  isInnerItem: PropTypes.bool,
};

/**
 * Renders an item with an onClick action.
 */
const NavbarAction = ({ navItem, isInnerItem, toggle }) => (
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

NavbarAction.propTypes = {
  navItem: PropTypes.object.isRequired,
  isInnerItem: PropTypes.bool,
  toggle: PropTypes.func,
};

/**
 * Renders a default item, typically a header or plain text in a dropdown.
 */
const NavbarDefaultItem = ({ navItem, isInnerItem }) => (
  <DropdownItem
    header
    className={classNames("px-1", {
      "text-uppercase": navItem.uppercase,
      "text-capitalize": navItem.capitalize,
      "dropdown-item": isInnerItem,
    })}>
    {navItem.name}
  </DropdownItem>
);

NavbarDefaultItem.propTypes = {
  navItem: PropTypes.object.isRequired,
  isInnerItem: PropTypes.bool,
};

// --- Structural Components ---

/**
 * Determines which Leaf component to render.
 * Used by NavbarFlattenedMenu to render the "Head" of a subsection.
 */
const NavbarLeafItem = ({ navItem, isInnerItem, toggle }) => {
  if (navItem.path && !navItem.action) {
    // For leaf items inside a menu, we treat them as Links
    // Note: The original code for `renderSubItem` treated items with path as Link
    // and others as DropdownItem (Header).
    return <NavbarLink navItem={navItem} isInnerItem={isInnerItem} />;
  } else if (navItem.action) {
    return (
      <NavbarAction
        navItem={navItem}
        isInnerItem={isInnerItem}
        toggle={toggle}
      />
    );
  } else {
    return <NavbarDefaultItem navItem={navItem} isInnerItem={isInnerItem} />;
  }
};

/**
 * Renders a flattened menu structure: The item itself (as header/link) + its children.
 * This corresponds to the `renderSubItem` logic in the original code.
 */
const NavbarFlattenedMenu = ({ navItem, toggle }) => {
  const isHeader = navItem.collapse?.length > 0;

  // We need to mutate/clone the item to pass the 'header' status logic if needed,
  // but `NavbarDefaultItem` uses `header` prop on `DropdownItem` based on context?
  // Original code: `header={isHeader}` prop passed to `DropdownItem`.
  // My `NavbarDefaultItem` currently sets `header` prop to true always?
  // Wait, original: `<DropdownItem header={isHeader} ...>`
  // So I should fix `NavbarDefaultItem` to accept `isHeader`.

  // Actually, checking `NavbarDefaultItem` above -> It has `header` prop hardcoded to true? `header`.
  // Wait, `<DropdownItem header ...>` means it renders as a header.
  // Original logic: `const isHeader = subItem.collapse?.length > 0;`
  // So if it has children, it IS a header.
  // `NavbarFlattenedMenu` is strictly for items WITH children (collapse > 0), so `isHeader` is always true here.

  return (
    <React.Fragment>
      {/* 1. Render the Item itself */}
      <NavbarLeafWrapper navItem={navItem} toggle={toggle} isInnerItem={true} />

      {/* 2. Render Children */}
      {navItem.collapse.map((innerItem, index) => (
        <NavbarItem
          key={`inner-${index}-${innerItem.name}`}
          navItem={innerItem}
          isInnerItem={true}
          toggle={toggle}
        />
      ))}
    </React.Fragment>
  );
};

// Helper for the LeafWrapper to safely apply "Header" styling logic if needed
// Or simply reuse NavbarLeafItem.
// Note: In `NavbarFlattenedMenu`, the `navItem` DOES have `collapse`.
// So avoiding infinite recursion is key. We use `NavbarLeafItem` which checks path/action but ignores collapse.
const NavbarLeafWrapper = ({ navItem, toggle, isInnerItem }) => {
  // If it's a default item (no path/action), it should be a header because it has children.
  // `NavbarDefaultItem` uses `<DropdownItem header ...>`.
  return (
    <NavbarLeafItem
      navItem={navItem}
      isInnerItem={isInnerItem}
      toggle={toggle}
    />
  );
};

/**
 * Renders a Top-Level Dropdown (Popup).
 */
const NavbarDropdown = ({ navItem, toggle }) => {
  const renderItemContent = () => (
    <>
      {navItem.icon && (
        <FontAwesomeIcon icon={navItem.icon} className="me-2 icon" />
      )}
      {navItem.name.length > 25
        ? `${navItem.name.substring(0, 20)}...`
        : navItem.name}
      <FontAwesomeIcon icon={faChevronDown} size="xs" className="down-arrow" />
    </>
  );

  const toggleClasses = classNames(
    "ps-2 d-flex cursor-pointer align-items-center nav-link",
    {
      "text-uppercase": navItem.uppercase,
      "text-capitalize": navItem.capitalize,
    }
  );

  const mapChildren = () =>
    navItem.collapse.map((subItem, index) => (
      <NavbarItem
        key={`sub-${index}-${subItem.name}`}
        navItem={subItem}
        isInnerItem={true} // Inside the menu, everything is "inner"
        toggle={toggle}
      />
    ));

  return (
    <>
      {/* Desktop Dropdown */}
      <UncontrolledDropdown nav inNavbar className="mx-1 d-none d-md-block">
        <DropdownToggle
          nav
          role="button"
          className={toggleClasses}
          title={navItem?.name?.length > 20 ? navItem.name : undefined}>
          {renderItemContent()}
        </DropdownToggle>
        <DropdownMenu
          flip
          end={navItem.end}
          className="navbar-dropdown-menu px-2">
          <div className="hidden-box">{/* For hover effect */}</div>
          {mapChildren()}
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
          className={toggleClasses}
          title={navItem?.name?.length > 20 ? navItem.name : undefined}>
          {renderItemContent()}
        </DropdownToggle>
        <DropdownMenu
          flip
          end={navItem.end}
          className="navbar-dropdown-menu px-2">
          {mapChildren()}
        </DropdownMenu>
      </UncontrolledDropdown>
    </>
  );
};

// --- Main Factory Component ---

const NavbarItem = React.memo(({ navItem, isInnerItem, toggle }) => {
  // 1. Dropdown Strategy (Outer vs Inner)
  if (navItem.collapse?.length > 0) {
    if (isInnerItem) {
      // If we are already inside a menu, a 'collapse' item renders as a Header + SubList
      // (Flattened Menu structure)
      return <NavbarFlattenedMenu navItem={navItem} toggle={toggle} />;
    }
    // Top Level: A real Dropdown Popup
    return <NavbarDropdown navItem={navItem} toggle={toggle} />;
  }

  // 2. Leaf Strategies
  return (
    <NavbarLeafItem
      navItem={navItem}
      isInnerItem={isInnerItem}
      toggle={toggle}
    />
  );
});

NavbarItem.propTypes = {
  navItem: PropTypes.shape({
    name: PropTypes.string.isRequired,
    path: PropTypes.string,
    action: PropTypes.func,
    icon: PropTypes.object,
    uppercase: PropTypes.bool,
    capitalize: PropTypes.bool,
    desktopOnly: PropTypes.bool,
    newTab: PropTypes.bool,
    end: PropTypes.bool,
    collapse: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        // recursive shape validation is tricky in PropTypes, using object for children is acceptable
        collapse: PropTypes.array,
      })
    ),
  }).isRequired,
  isInnerItem: PropTypes.bool,
  toggle: PropTypes.func, // passed down from parent if needed? Original code didn't pass toggle to top level, but used it in recursion.
};

export default NavbarItem;
