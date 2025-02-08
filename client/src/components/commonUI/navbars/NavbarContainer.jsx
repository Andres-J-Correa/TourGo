import React, { useState, useMemo, useCallback } from "react";
import DefaultNavbar from "components/commonUI/navbars/DefaultNavbar";
import UserAccountDropdown from "components/users/UserAccountDropdown";
import { useNavbarItems } from "components/commonUI/navbars/useNavbarItems";

const NavbarContainer = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { adminItems } = useNavbarItems();

  const currentItems = useMemo(() => adminItems, [adminItems]);

  const rightCustomComponents = useMemo(
    () => [<UserAccountDropdown key="userAccountDropdown" />],
    []
  );

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <DefaultNavbar
      isOpen={isOpen}
      toggle={toggle}
      navbarItems={currentItems}
      rightCustomComponents={rightCustomComponents}
      showLanguageSelector={false}
    />
  );
};

export default React.memo(NavbarContainer);
