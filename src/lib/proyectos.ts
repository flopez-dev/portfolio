import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/utils';
import { withBase } from './paths';
import { slugFor } from './landings.mjs';

type Base = CollectionEntry<'proyectos'>;
type Traduccion = CollectionEntry<'proyectosEn'>;

export type Proyecto = {
  slug: string;
  data: Base['data'];
  /** The entry to render(): the Spanish file, or its English translation. */
  entrada: Base | Traduccion;
};

/**
 * Projects for one language, in the order they should appear.
 *
 * The Spanish file owns everything that is not prose; the English one carries
 * only the translation and inherits the rest. That way `orden`, `destacado`,
 * `portada` and the others cannot disagree between the two languages, because
 * there is only ever one of each.
 */
export async function proyectosDe(lang: Lang): Promise<Proyecto[]> {
  const base = await getCollection('proyectos');

  if (lang === 'es') {
    return base
      .map((entrada) => ({ slug: entrada.id, data: entrada.data, entrada }))
      .sort(porOrden);
  }

  const traducciones = await getCollection('proyectosEn');
  const porSlug = new Map(base.map((entrada) => [entrada.id, entrada]));

  const faltan = base
    .map((entrada) => entrada.id)
    .filter((slug) => !traducciones.some((t) => t.id === slug));
  if (faltan.length > 0) {
    throw new Error(
      `Sin traducir: falta src/content/projects/en/${faltan.join('.md, ')}.md. ` +
        'El selector de idioma llevaría a un 404.',
    );
  }

  return traducciones
    .map((traduccion) => {
      const original = porSlug.get(traduccion.id);
      if (!original) {
        throw new Error(
          `src/content/projects/en/${traduccion.id}.md no tiene original en es/. ` +
            'El fichero español es el que define orden, portada y estado.',
        );
      }
      return {
        slug: traduccion.id,
        data: { ...original.data, ...traduccion.data },
        entrada: traduccion,
      };
    })
    .sort(porOrden);
}

const porOrden = (a: Proyecto, b: Proyecto) => a.data.orden - b.data.orden;

/**
 * Where "see the site" goes: the project's own domain when it has one, otherwise
 * the copy published here. The published slug is derived, never written down in
 * the content files.
 */
export function urlDelProyecto(proyecto: Proyecto): string | undefined {
  if (proyecto.data.url) return proyecto.data.url;
  if (!proyecto.data.landing) return undefined;
  return withBase(`${slugFor(proyecto.data.landing)}/`);
}

/** Path of a project's write-up, in either language. */
export const rutaProyecto = (lang: Lang, slug: string): string =>
  lang === 'es' ? `proyectos/${slug}/` : `en/projects/${slug}/`;
