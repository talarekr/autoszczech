import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  pl: {
    translation: {
      year: "Rok",
      mileage: "Przebieg",
      price: "Cena",
      back: "Powrót",
      adminPanel: "Panel administratora",
      login: "Zaloguj",
      logout: "Wyloguj",
      offers: "Złożone oferty"
    }
  },
  en: {
    translation: {
      year: "Year",
      mileage: "Mileage",
      price: "Price",
      back: "Back",
      adminPanel: "Admin panel",
      login: "Log in",
      logout: "Log out",
      offers: "Submitted offers"
    }
  },
  de: {
    translation: {
      year: "Jahr",
      mileage: "Kilometerstand",
      price: "Preis",
      back: "Zurück",
      adminPanel: "Admin-Panel",
      login: "Anmelden",
      logout: "Abmelden",
      offers: "Abgegebene Angebote"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "pl",
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export default i18n;
