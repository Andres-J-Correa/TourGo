import React from "react";
import { useLanguage } from "contexts/LanguageContext";
import { languages } from "./constants";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

import HoverDropDown from "components/commonUI/navbars/HoverDropdown";
import { DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";

const LanguageSelector = () => {
  const { changeLanguage, language } = useLanguage();

  return (
    <HoverDropDown nav inNavbar className="mx-2">
      <DropdownToggle
        nav
        className="ps-2 d-flex cursor-pointer align-items-center text-uppercase"
      >
        <FontAwesomeIcon
          icon={faGlobe}
          className="
        icon"
        />
        {language}
      </DropdownToggle>
      <DropdownMenu
        flip
        className="border-0 shadow px-3 border-radius-xl"
        style={{ minWidth: "auto" }}
      >
        <div className="hidden-box">{/* For hover effect */}</div>
        {Object.keys(languages).map((key, index) => (
          <DropdownItem
            key={`language-${key}-${index}`}
            onClick={() => changeLanguage(key)}
            className="text-center px-1 text-capitalize"
          >
            {languages[key]}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </HoverDropDown>
  );
};

export default LanguageSelector;
