import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ar from "../locales/ar/translation.json";
import fr from "../locales/fr/translation.json";
import en from "../locales/en/translation.json";

const savedLang = localStorage.getItem("ncg-lang") || "ar";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      fr: { translation: fr },
      en: { translation: en },
    },
    lng: savedLang,
    fallbackLng: "ar",
    defaultNS: "translation",
    interpolation: { escapeValue: false },
  });

export default i18n;
