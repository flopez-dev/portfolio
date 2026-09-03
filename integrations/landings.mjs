import { cp, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sirv from 'sirv';
import { discoverLandings } from '../src/lib/landings.mjs';

const CANONICAL = /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i;
const ROBOTS = /<meta\s+name=["']robots["']\s+content=["'][^"']*["']\s*\/?>/i;
const ROOT_LINK = /(?:href|src)="(\/[^"]*)"/g;

const joinUrlPath = (...parts) => parts.join('/').replace(/\/{2,}/g, '/');
const sameUrl = (a, b) => a.replace(/\/+$/, '/').toLowerCase() === b.replace(/\/+$/, '/').toLowerCase();

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
  let site;
  let base;

  const all = () => discoverLandings(path.join(root, projectsDir));

  return {
    name: 'landings',
    hooks: {
      'astro:config:done': ({ config }) => {
        root = fileURLToPath(config.root);
        site = config.site;
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
          await reconcileRobots(
            path.join(dest, 'index.html'),
            new URL(joinUrlPath(base, landing.slug, '/'), site).href,
            logger,
          );
          logger.info(`${landing.folder} -> ${landing.slug}/`);
        }

        await assertBasePrefixed(out, base, new Set(found.map((l) => l.slug)));
      },
    },
  };
}

/**
 * A copy published somewhere other than its own declared canonical URL is a
 * duplicate, so it gets noindex — in the build output only, never in the source.
 *
 * Deriving this from each landing's own <link rel="canonical"> means there is no
 * per-landing list to keep in sync, and the answer changes correctly with the
 * deploy target: chantal_verdugo_house is canonical on its own domain and so is
 * noindex everywhere here, while inmica's canonical *is* its GitHub Pages URL,
 * so that copy stays indexable on Pages and would flip to noindex the day this
 * site is served from a domain of its own.
 */
async function reconcileRobots(file, publishedUrl, logger) {
  const html = await readFile(file, 'utf8');
  const canonical = html.match(CANONICAL)?.[1];
  if (!canonical || sameUrl(canonical, publishedUrl)) return;

  const rewritten = html.replace(ROBOTS, '<meta name="robots" content="noindex, nofollow" />');
  if (rewritten === html) return;

  await writeFile(file, rewritten, 'utf8');
  logger.info(`  noindex (canonical is ${canonical})`);
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
