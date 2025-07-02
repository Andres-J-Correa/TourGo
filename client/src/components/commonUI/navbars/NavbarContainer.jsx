import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DefaultNavbar from "components/commonUI/navbars/DefaultNavbar";
import UserAccountDropdown from "components/users/UserAccountDropdown";
import { useNavbarItems } from "components/commonUI/navbars/useNavbarItems";

const NavbarContainer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const { items } = useNavbarItems();

  const currentItems = useMemo(() => items, [items]);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const rightCustomComponents = useMemo(
    () => [
      <UserAccountDropdown
        toggle={isOpen ? toggle : undefined}
        key="userAccountDropdown"
      />,
    ],
    [toggle, isOpen]
  );

  useEffect(() => {
    // Close the navbar when the route changes
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <DefaultNavbar
      isOpen={isOpen}
      toggle={toggle}
      navbarItems={currentItems}
      rightCustomComponents={rightCustomComponents}
    />
  );
};

export default React.memo(NavbarContainer);
