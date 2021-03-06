import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import fi from './fi.json';
import sv from './sv.json';

i18n.use(initReactI18next).init({
  fallbackLng: 'fi',
  interpolation: {
    escapeValue: false,
  },
  lng: 'fi',
  resources: {
    fi: {
      translation: fi,
    },
    sv: {
      translation: sv,
    },
    en: {
      translation: en,
    },
  },
});

export default i18n;
