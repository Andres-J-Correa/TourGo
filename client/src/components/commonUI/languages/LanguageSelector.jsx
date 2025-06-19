import React from "react";
import { useLanguage } from "contexts/LanguageContext";
import { languages } from "./constants";

import { faGlobe } from "@fortawesome/free-solid-svg-icons";

import NavbarItem from "components/commonUI/navbars/NavbarItem";

const LanguageSelector = () => {
  const { changeLanguage, language, t } = useLanguage();

  const menuItems = languages.map((lang) => {
    const subItem = {
      name: t(`languages.${lang}`),
      action: () => changeLanguage(lang),
    };

    return subItem;
  });

  const languageItem = {
    name: language,
    uppercase: true,
    icon: faGlobe,
    collapse: [
      {
        name: t("language"),
        capitalize: true,
        collapse: menuItems,
      },
    ],
  };

  return <NavbarItem navItem={languageItem} />;
};

export default LanguageSelector;
