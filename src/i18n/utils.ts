import es from './es.json';
import en from './en.json';

export const defaultLang = 'es' as const;
export type Lang = 'es' | 'en';

const dictionaries = { es, en } as const;

export type UIKey = keyof typeof es;

/** t('es')('nav.perfil') — interface strings only; page prose lives in the pages. */
export function t(lang: Lang) {
  return (key: UIKey): string => dictionaries[lang][key] ?? es[key];
}

export const otherLang = (lang: Lang): Lang => (lang === 'es' ? 'en' : 'es');
