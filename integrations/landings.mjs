import { cp, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sirv from 'sirv';
import { discoverLandings } from '../src/lib/landings.mjs';

const ROBOTS = /<meta\s+name=["']robots["']\s+content=["'][^"']*["']\s*\/?>/i;
const HEAD_END = /<\/head>/i;
const ROOT_LINK = /(?:href|src)="(\/[^"]*)"/g;
const NOINDEX = '<meta name="robots" content="noindex, nofollow" />';

const joinUrlPath = (...parts) => parts.join('/').replace(/\/{2,}/g, '/');

/**
 * Publishes every projects/<folder>/public/ flat at /<slug>/, byte for byte.
 *
 * The landings are finished, self-contained sites — several of them client work
 * that is live on its own domain — so the source tree is never written to. In
 * dev they are served straight out of projects/; in a build they are copied into
 * the output, which is what both deploy targets (GitHub Pages and the root
 * Cloudflare Worker) publish.
 */
export default function landings({ projectsDir = 'projects' } = {}) {
  let root;
  let base;

  const all = () => discoverLandings(path.join(root, projectsDir));

  return {
    name: 'landings',
    hooks: {
      'astro:config:done': ({ config }) => {
        root = fileURLToPath(config.root);
        base = config.base.endsWith('/') ? config.base : `${config.base}/`;
      },

      // `npm run dev` serves the landings from projects/ directly — no copy, no
      // dist/ — so a link from a project page opens the real thing while you work.
      'astro:server:setup': ({ server, logger }) => {
        for (const landing of all()) {
          const serve = sirv(landing.dir, { dev: true, etag: true, extensions: ['html'] });

          // Vite strips a non-root `base` from req.url before any plugin
          // middleware sees it, so the slug-only mount is the one that actually
          // fires. The prefixed mount is kept for the root-base case and in case
          // that stripping ever moves.
          for (const mount of new Set([`/${landing.slug}`, joinUrlPath(base, landing.slug)])) {
            server.middlewares.use(mount, serve);
          }

          logger.info(`${joinUrlPath(base, landing.slug)}/ -> ${path.relative(root, landing.dir)}`);
        }
      },

      'astro:build:done': async ({ dir, logger }) => {
        const out = fileURLToPath(dir);
        const found = all();

        for (const landing of found) {
          const dest = path.join(out, landing.slug);
          await cp(landing.dir, dest, { recursive: true });
          const yaEstaba = await forzarNoindex(path.join(dest, 'index.html'));
          logger.info(
            `${landing.folder} -> ${landing.slug}/ (noindex${yaEstaba ? ', ya en el origen' : ''})`,
          );
        }

        await assertBasePrefixed(out, base, new Set(found.map((l) => l.slug)));
      },
    },
  };
}

/**
 * Every landing copy published here is an exhibit, so every one of them gets
 * noindex — in the build output only, never in the source.
 *
 * No landing is canonical at this address. chantal_verdugo_house lives on its
 * own domain and magma_consulting will; latiguillos_laguia is a scaffold; and
 * inmica is finished client work that is never going live anywhere, kept purely
 * as a portfolio piece. What this site asks to have indexed is its own writing —
 * the /proyectos/<slug>/ pages — not a second copy of somebody's site.
 *
 * This used to compare each landing's <link rel="canonical"> against the URL it
 * was being published at and derive the answer. That was a moving part with a
 * silent failure mode (a canonical written without its trailing slash flipped a
 * page to noindex with no warning) protecting a case that does not exist.
 *
 * Returns whether the source already said noindex, so the build log can show it.
 */
async function forzarNoindex(file) {
  const html = await readFile(file, 'utf8');

  const rewritten = ROBOTS.test(html)
    ? html.replace(ROBOTS, NOINDEX)
    : html.replace(HEAD_END, `  ${NOINDEX}\n  </head>`);

  if (rewritten === html) return true;

  await writeFile(file, rewritten, 'utf8');
  return false;
}

/**
 * Astro rewrites `base` into bundled assets, but not into an <a href> written by
 * hand. On GitHub Pages, where the site is served from /portfolio/, a forgotten
 * withBase() is a 404 that only shows up in production — so fail the build here
 * instead. Landings are skipped: they are relative-path-only and unmodified.
 */
async function assertBasePrefixed(out, base, landingSlugs) {
  if (base === '/') return;

  const offenders = [];

  for (const file of await htmlFiles(out)) {
    const relative = path.relative(out, file);
    if (landingSlugs.has(relative.split(path.sep)[0])) continue;

    const html = await readFile(file, 'utf8');
    for (const [, href] of html.matchAll(ROOT_LINK)) {
      if (!href.startsWith(base)) offenders.push(`${relative}: ${href}`);
    }
  }

  if (offenders.length > 0) {
    throw new Error(
      `Root-relative links that skip the base path "${base}" — wrap them in withBase():\n  ${offenders.join('\n  ')}`,
    );
  }
}

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => path.join(entry.parentPath ?? entry.path, entry.name));
}
