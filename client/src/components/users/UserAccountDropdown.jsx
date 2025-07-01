import React from "react";

import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import NavbarItem from "components/commonUI/navbars/NavbarItem";

import { useLanguage } from "contexts/LanguageContext";
import { useAppContext } from "contexts/GlobalAppContext";

import PropTypes from "prop-types";

function UserAccountDropdown({ toggle }) {
  const { t } = useLanguage();
  const { user, toggleUserSignInModal } = useAppContext();

  const truncateString = (str) => {
    if (str.length > 10) {
      return str.slice(0, 10) + "...";
    }
    return str;
  };

  const userdropdown = {
    name: user.current?.isAuthenticated
      ? truncateString(user.current.firstName)
      : t("client.navbar.account"),
    icon: faUserCircle,
    capitalize: true,
    end: true,
    collapse: user.current.isAuthenticated
      ? [
          {
            name: t("users.accountDropdown.account"),
            collapse: [
              {
                name: t("users.accountDropdown.profile"),
                path: "/profile",
              },
              {
                name: t("users.accountDropdown.settings"),
                path: "/profile/settings?tab=email",
              },
            ],
          },
          {
            name: t("users.accountDropdown.actions"),
            collapse: [
              {
                name: t("client.navbar.logout"),
                action: () => user.logout(),
              },
            ],
          },
        ]
      : [
          {
            name: t("client.navbar.loginRegister"),
            action: () => toggleUserSignInModal(),
          },
        ],
  };

  return <NavbarItem navItem={userdropdown} toggle={toggle} />;
}

export default UserAccountDropdown;

UserAccountDropdown.propTypes = {
  showRegister: PropTypes.bool,
};
