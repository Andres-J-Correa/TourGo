import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getStringFromLocalStorage } from "utils/localStorageHelper";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: require("locales/en/translation.json") },
    es: { translation: require("locales/es/translation.json") },
  },
  lng: getStringFromLocalStorage("language") || "es",
  fallbackLng: "es",
  interpolation: { escapeValue: false },
});

export default i18n;
