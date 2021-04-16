import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import fi from './fi.json';
import en from './en.json';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    fallbackLng: 'fi',
    interpolation: {
      escapeValue: false,
    },
    lng: 'fi',
    resources: {
      fi: {
        translation: fi,
      },
      en: {
        translation: en,
      },
    },
  });

export default i18n;
