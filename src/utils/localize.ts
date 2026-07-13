import type { ArabicStatus, Locale, LocaleStatus, LocalizedString, LocalizedStringArray } from '../types/cms';

export function pickLocalized(value: LocalizedString, locale: Locale, status?: LocaleStatus, allowDraft = false): string {
  if (locale === 'ar' && value.ar.trim() && (allowDraft || status?.ar === 'approved')) return value.ar;
  return value.en;
}

export function pickLocalizedArray(value: LocalizedStringArray, locale: Locale, status?: LocaleStatus, allowDraft = false): string[] {
  if (locale === 'ar' && value.ar.length > 0 && (allowDraft || status?.ar === 'approved')) return value.ar.filter(Boolean);
  return value.en;
}

export function statusLabel(status?: ArabicStatus): string {
  return status === 'approved' ? 'Approved' : 'Draft';
}

export function formatPhone(phone: string): string {
  return phone.startsWith('+') ? phone : `+20 ${phone.replace(/^0/, '')}`;
}
