import translations from '@/lib/i18n/id.json';

export function t(key: keyof typeof translations): string {
  return translations[key] ?? key;
}
