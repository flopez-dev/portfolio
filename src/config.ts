/**
 * Contact details and profile links, in one place.
 *
 * Two of these are still placeholders. They are written so they fail loudly —
 * a wa.me link with X's in it errors instead of quietly dialling a stranger —
 * and the build prints a warning while either is unset.
 */
export const site = {
  name: 'Francisco López',
  email: 'francisco.lop.nav@gmail.com',

  // TODO: real number, international format, digits only (e.g. 34612345678).
  whatsapp: '34XXXXXXXXX',

  // TODO: real LinkedIn profile URL.
  linkedin: 'https://www.linkedin.com/in/TODO/',

  repo: 'https://github.com/flopez-dev/portfolio',
} as const;

export const whatsappPending = site.whatsapp.includes('X');
export const linkedinPending = site.linkedin.includes('TODO');

if (whatsappPending || linkedinPending) {
  const missing = [whatsappPending && 'WhatsApp', linkedinPending && 'LinkedIn'].filter(Boolean);
  console.warn(`[config] Placeholder todavía sin rellenar: ${missing.join(', ')} — src/config.ts`);
}

/** wa.me link with a pre-filled opening message, different per language. */
export function whatsappUrl(lang: 'es' | 'en'): string {
  const text =
    lang === 'es'
      ? 'Hola Francisco, te escribo por la web de mi negocio.'
      : 'Hi Francisco, I am writing about a site for my business.';
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
}
