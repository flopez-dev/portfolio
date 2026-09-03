import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

/**
 * Landings under projects/ are published flat, at /<slug>/, exactly as they were
 * before the root became an Astro site — those URLs are already indexed, and a
 * landing's own <link rel="canonical"> points at one of them.
 *
 * The slug is the folder name unless it is listed here. This map used to live as
 * a bash array inside deploy-pages.yml; it lives here now so the build and the
 * project pages agree on one source of truth.
 */
export const SLUG_OVERRIDES = {
  chantal_verdugo_house: 'chantal-house',
  magma_consulting: 'magma-consulting',
};

export const slugFor = (folder) => SLUG_OVERRIDES[folder] ?? folder;

/**
 * Every folder under projects/ that has its own public/index.html — the same
 * test the deploy workflow and tools/preview-shots.sh use to decide what counts
 * as a landing. A folder without one is a work in progress with nothing to serve.
 */
export function discoverLandings(projectsDir) {
  if (!existsSync(projectsDir)) return [];

  return readdirSync(projectsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((folder) => existsSync(path.join(projectsDir, folder, 'public', 'index.html')))
    .sort()
    .map((folder) => ({
      folder,
      slug: slugFor(folder),
      dir: path.join(projectsDir, folder, 'public'),
    }));
}
