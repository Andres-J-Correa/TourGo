import React, { useState, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import DefaultNavbar from "components/commonUI/navbars/DefaultNavbar";
import UserAccountDropdown from "components/users/UserAccountDropdown";
import { useNavbarItems } from "components/commonUI/navbars/useNavbarItems";
import { useAppContext } from "contexts/GlobalAppContext";

const NavbarContainer = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { pathname } = useLocation();
  const { user } = useAppContext();
  const { clientItems, providerItems } = useNavbarItems();

  const isProvider = useMemo(
    () =>
      user.current.roles.includes("provider") ||
      pathname.startsWith("/provider"),
    [user, pathname]
  );

  const currentItems = useMemo(
    () => (isProvider ? providerItems : clientItems),
    [isProvider, providerItems, clientItems]
  );

  const rightCustomComponents = useMemo(
    () => [<UserAccountDropdown showRegister={!isProvider} />],
    [isProvider]
  );

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

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
