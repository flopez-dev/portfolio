import type { APIRoute } from 'astro';

/**
 * Generated rather than static: the sitemap URL differs per deploy target, since
 * GitHub Pages serves this site under /portfolio/ and Cloudflare would serve it
 * at a domain root.
 *
 * On Pages this lands at /portfolio/robots.txt, where crawlers ignore it — only
 * a robots.txt at the domain root counts, and this repo does not control
 * flopez-dev.github.io/robots.txt. The per-page <meta name="robots"> is what
 * actually does the work there; this file matters on a domain of our own.
 */
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL(
    `${import.meta.env.BASE_URL}sitemap-index.xml`.replace(/\/{2,}/g, '/'),
    site,
  );

  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
