import React, { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

import { DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";

import HoverDropDown from "components/commonUI/navbars/HoverDropdown";
import UserSignInModal from "components/client/users/UserSignInModal";
import UserSignUpModal from "components/client/users/UserSignUpModal";
import UserPasswordResetModal from "./UserPasswordResetModal";

import { usersLogout } from "services/userAuthService";

import { useLanguage } from "contexts/LanguageContext";
import { useAppContext } from "contexts/GlobalAppContext";

import PropTypes from "prop-types";

const defaultModals = {
  login: false,
  register: false,
  reset: false,
};
function UserAccountDropdown() {
  const [modals, setModals] = useState({
    ...defaultModals,
  });

  const toggle = (key) => () => {
    setModals((prev) => ({ ...defaultModals, [key]: !prev[key] }));
  };

  const { t } = useLanguage();
  const { user } = useAppContext();

  const truncateString = (str) => {
    if (str.length > 10) {
      return str.slice(0, 10) + "...";
    }
    return str;
  };

  return (
    <React.Fragment>
      <HoverDropDown nav inNavbar className="mx-2">
        <DropdownToggle
          nav
          className="ps-2 d-flex cursor-pointer align-items-center nav-link text-capitalize"
        >
          <FontAwesomeIcon icon={faUserCircle} size="lg" className="icon" />
          {user.current?.isAuthenticated
            ? truncateString(user.current.firstName)
            : t("client.navbar.account")}
          <FontAwesomeIcon
            icon={faChevronDown}
            size="xs"
            className="down-arrow"
          />
        </DropdownToggle>
        <DropdownMenu
          flip
          end={true}
          className="border-0 shadow px-3 border-radius-xl"
          style={{ minWidth: "auto" }}
        >
          <div className="hidden-box">{/* For hover effect */}</div>
          <DropdownItems user={user} toggle={toggle} t={t} />
        </DropdownMenu>
      </HoverDropDown>
      <UserSignInModal
        isOpen={modals.login}
        toggle={toggle("login")}
        onSignUp={toggle("register")}
        onPasswordReset={toggle("reset")}
      />
      <UserSignUpModal
        isOpen={modals.register}
        toggle={toggle("register")}
        onSignIn={toggle("login")}
      />
      <UserPasswordResetModal
        isOpen={modals.reset}
        toggle={toggle("reset")}
        onSignIn={toggle("login")}
      />
    </React.Fragment>
  );
}

function DropdownItems({ user, toggle, t }) {
  const handleLogout = () => {
    const logoutAsync = async () => {
      try {
        const response = await usersLogout();
        if (!Boolean(response?.isSuccessful)) {
          throw new Error("User not found");
        }
        return true;
      } catch (error) {
        Swal.showValidationMessage(`${t("common.requestFailed")} ${error}`);
      }
    };

    Swal.fire({
      title: t("client.navbar.logout"),
      text: t("client.navbar.logoutConfirm"),
      icon: "warning",
      width: "25rem",
      heightAuto: true,
      showCancelButton: true,
      confirmButtonText: t("common.yes"),
      cancelButtonText: t("common.no"),
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      preConfirm: logoutAsync,
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        Swal.fire({
          title: t("common.success"),
          icon: "success",
          showConfirmButton: true,
          confirmButtonText: t("common.ok"),
        });
        user.logout();
      }
    });
  };

  const items = user.current.isAuthenticated
    ? [
        {
          key: "logout",
          label: t("client.navbar.logout"),
          action: handleLogout,
        },
      ]
    : [
        {
          key: "register",
          label: t("client.navbar.register"),
          action: toggle("register"),
        },
        {
          key: "login",
          label: t("client.navbar.login"),
          action: toggle("login"),
        },
      ];

  return items.map((item, index) => (
    <DropdownItem
      key={`dropdown-item-${index}-${item.key}`}
      className="text-center px-1 text-capitalize"
      onClick={item.action}
    >
      {item.label}
    </DropdownItem>
  ));
}

export default UserAccountDropdown;

DropdownItems.proptypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};
