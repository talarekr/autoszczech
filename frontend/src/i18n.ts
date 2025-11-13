import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  pl: { translation: { title: 'AutoSzczech', login: 'Zaloguj', logout: 'Wyloguj', bid: 'Złóż ofertę', details: 'Szczegóły', price: 'Cena', mileage: 'Przebieg', year: 'Rok' }},
  en: { translation: { title: 'AutoSzczech', login: 'Login', logout: 'Logout', bid: 'Place bid', details: 'Details', price: 'Price', mileage: 'Mileage', year: 'Year' }},
  de: { translation: { title: 'AutoSzczech', login: 'Anmelden', logout: 'Abmelden', bid: 'Gebot abgeben', details: 'Details', price: 'Preis', mileage: 'Kilometer', year: 'Jahr' }},
}

const lng = navigator.language.startsWith('pl') ? 'pl' : navigator.language.startsWith('de') ? 'de' : 'en'

i18n.use(initReactI18next).init({ resources, lng, fallbackLng: 'en', interpolation: { escapeValue: false } })
export default i18n
