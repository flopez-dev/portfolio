// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import landings from './integrations/landings.mjs';

// The site is published on GitHub Pages today, under /portfolio/, so that is the
// default here — dev matches production. The Cloudflare workflow overrides both
// once there is a domain of its own: SITE_URL=https://<domain> BASE_PATH=/
const site = process.env.SITE_URL ?? 'https://flopez-dev.github.io';
const base = process.env.BASE_PATH ?? '/portfolio/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },

  // Spanish at the root, English under /en/. Pages are duplicated by hand in
  // src/pages/ and src/pages/en/ — there are five of them, a routing layer would
  // cost more than it saves. This block is here so @astrojs/sitemap can emit the
  // hreflang alternates.
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },

  integrations: [
    sitemap({
      i18n: { defaultLocale: 'es', locales: { es: 'es-ES', en: 'en-US' } },
    }),
    landings(),
  ],

  vite: { plugins: [tailwindcss()] },
});
