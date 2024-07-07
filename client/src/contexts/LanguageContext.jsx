import React, { createContext, useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../locales/i18n";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { t } = useTranslation();
  const [language, setLanguage] = useState("en");

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
  };

  useEffect(() => {
    // Set initial language based on i18n configuration or browser setting
    const initialLanguage = i18n.language || "en";
    setLanguage(initialLanguage);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  return useContext(LanguageContext);
};
