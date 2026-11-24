import i18next from 'i18next';
import translations from '../i18n/en.json';

export const createEnglishReactI18nextMock = async () => {
  const i18n = i18next.createInstance();
  await i18n.init({
    lng: 'en',
    fallbackLng: 'en',
    resources: { en: { translation: translations } },
    interpolation: { escapeValue: false },
  });

  return {
    useTranslation: () => ({
      t: i18n.t.bind(i18n),
      i18n,
    }),
  };
};
