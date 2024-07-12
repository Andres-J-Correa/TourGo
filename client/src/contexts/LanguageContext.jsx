import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";
import { setStringInLocalStorage } from "utils/localStorageHelper";
import i18n from "../locales/i18n";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { t } = useTranslation();
  const [language, setLanguage] = useState("");

  const getTranslatedErrorMessage = useCallback(
    (error) => {
      if (Boolean(error?.response?.data?.code)) {
        return `${t(`errors.http.${error?.response?.status ?? 500}`)}:\n${t(
          `errors.custom.${error.response.data.code}`
        )}`;
      } else {
        return `${t(`errors.http.${error?.response?.status ?? 500}`)}:\n${t(
          `errors.custom.1000`
        )}`;
      }
    },
    [t]
  );

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setStringInLocalStorage("language", lng);
    setLanguage(lng);
  };

  useEffect(() => {
    const initialLanguage = i18n.language;
    setLanguage(initialLanguage);
  }, []);

  return (
    <LanguageContext.Provider
      value={{ language, changeLanguage, t, getTranslatedErrorMessage }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  return useContext(LanguageContext);
};
