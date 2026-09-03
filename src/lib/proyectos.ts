import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/utils';
import { withBase } from './paths';
import { SLUG_OVERRIDES } from './landings.mjs';

export type Proyecto = CollectionEntry<'proyectos'> & { slug: string };

/** Projects for one language, in the order they should appear. */
export async function proyectosDe(lang: Lang): Promise<Proyecto[]> {
  const entries = await getCollection('proyectos', ({ id }) => id.startsWith(`${lang}/`));

  return entries
    .map((entry) => ({ ...entry, slug: entry.id.slice(lang.length + 1) }))
    .sort((a, b) => a.data.orden - b.data.orden);
}

/**
 * Where "see the site" goes: the project's own domain when it has one, otherwise
 * the copy published here. The published slug is derived, never written down in
 * the content files.
 */
export function urlDelProyecto(proyecto: Proyecto): string | undefined {
  if (proyecto.data.url) return proyecto.data.url;
  if (!proyecto.data.landing) return undefined;

  const folder = proyecto.data.landing;
  const slug = (SLUG_OVERRIDES as Record<string, string>)[folder] ?? folder;
  return withBase(`${slug}/`);
}

/** Path of a project's write-up, in either language. */
export const rutaProyecto = (lang: Lang, slug: string): string =>
  lang === 'es' ? `proyectos/${slug}/` : `en/projects/${slug}/`;
