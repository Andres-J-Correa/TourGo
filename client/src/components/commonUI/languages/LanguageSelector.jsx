import React from "react";
import { useLanguage } from "contexts/LanguageContext";
import { languages } from "./constants";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

import NavbarItem from "components/commonUI/navbars/NavbarItem";

const LanguageSelector = () => {
  const { changeLanguage, language } = useLanguage();

  const menuItems = Object.keys(languages).map((key) => {
    const subItem = {
      name: languages[key],
      action: () => changeLanguage(key),
    };

    return subItem;
  });

  const languageItem = {
    name: language,
    uppercase: true,
    icon: <FontAwesomeIcon icon={faGlobe} className="icon" />,
    collapse: [...menuItems],
  };

  return <NavbarItem navItem={languageItem} />;
};

export default LanguageSelector;
