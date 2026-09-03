const BASE = import.meta.env.BASE_URL;

/**
 * Every internal link goes through this. Astro prefixes `base` onto bundled
 * assets but not onto hrefs written by hand, and the site is served from
 * /portfolio/ on GitHub Pages — so a bare "/proyectos/" is a 404 there.
 *
 * The build fails if one slips through; see integrations/landings.mjs.
 */
export function withBase(pathname = ''): string {
  return `${BASE.replace(/\/$/, '')}/${String(pathname).replace(/^\//, '')}`;
}
