import type { ArabicStatus, Locale, LocaleStatus, LocalizedString } from '../types/cms';

export function effectiveContentLocale(
  locale: Locale,
  value: LocalizedString,
  status?: LocaleStatus,
  allowDraft = false,
): Locale {
  if (locale === 'ar' && value.ar.trim() && (allowDraft || status?.ar === 'approved')) return 'ar';
  return 'en';
}

export function contentDirectionForLocale(contentLocale: Locale): { lang: Locale; dir: 'ltr' | 'rtl' } {
  return contentLocale === 'ar' ? { lang: 'ar', dir: 'rtl' } : { lang: 'en', dir: 'ltr' };
}

export function contentAttrs(
  locale: Locale,
  value: LocalizedString,
  status?: LocaleStatus,
  allowDraft = false,
): { lang: Locale; dir: 'ltr' | 'rtl' } {
  return contentDirectionForLocale(effectiveContentLocale(locale, value, status, allowDraft));
}

export function hasApprovedArabic(status?: LocaleStatus | ArabicStatus): boolean {
  if (!status) return false;
  if (typeof status === 'string') return status === 'approved';
  return status.ar === 'approved';
}
