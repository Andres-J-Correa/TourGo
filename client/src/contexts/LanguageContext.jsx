import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";
import { setStringInLocalStorage } from "utils/localStorageHelper";
import { setDefaultLocale } from "react-datepicker";
import i18n from "../locales/i18n";

const LanguageContext = createContext();

function getCultureFromLanguage(language) {
  switch (language) {
    case "en":
      return "en-US";
    case "es":
      return "es-ES";
    default:
      return "es-ES";
  }
}

export const LanguageProvider = ({ children }) => {
  const { t } = useTranslation();
  const [language, setLanguage] = useState("");
  const [culture, setCulture] = useState(getCultureFromLanguage(language));

  setDefaultLocale(language);

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
    const newCulture = getCultureFromLanguage(lng);
    setCulture(newCulture);
  };

  useEffect(() => {
    const initialLanguage = i18n.language;
    setLanguage(initialLanguage);
    setCulture(getCultureFromLanguage(initialLanguage));
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t,
        getTranslatedErrorMessage,
        culture,
      }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  return useContext(LanguageContext);
};
