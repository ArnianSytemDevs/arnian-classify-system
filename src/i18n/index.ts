import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en/translation.json";
import es from "./locales/es/translation.json";

i18n
    .use(LanguageDetector) // detecta idioma del navegador
    .use(initReactI18next) // integra con react-i18next
    .init({
        resources: {
            en: { translation: en },
            es: { translation: es },
        },
        fallbackLng: "en", // idioma por defecto
        interpolation: {
        escapeValue: false, // react ya protege contra XSS
        },
    });

export default i18n;
