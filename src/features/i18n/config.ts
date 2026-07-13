import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './resources';
import type { Locale } from '../../types/cms';

const storedLanguage = typeof localStorage !== 'undefined' ? localStorage.getItem('salma-locale') : null;
const browserLanguage = typeof navigator !== 'undefined' && navigator.language.startsWith('ar') ? 'ar' : 'en';

void i18n.use(initReactI18next).init({
  resources,
  lng: (storedLanguage as Locale | null) ?? browserLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export function setDocumentLanguage(locale: Locale): void {
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  localStorage.setItem('salma-locale', locale);
}

export default i18n;
