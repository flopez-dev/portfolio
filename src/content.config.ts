import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

/**
 * One markdown file per project and language, sharing a slug:
 * src/content/projects/es/inmica.md and .../en/inmica.md -> ids "es/inmica", "en/inmica".
 */
const proyectos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    cliente: z.string(),
    sector: z.string(),
    año: z.number(),
    /** The project's own domain, when it has one. */
    url: z.string().url().optional(),
    resumen: z.string(),
    servicios: z.array(z.string()),
    stack: z.array(z.string()),
    /** Screenshot base path under public/, without extension — .webp and .jpg both exist. */
    portada: z.string(),
    galeria: z.array(z.string()).default([]),
    destacado: z.boolean().default(false),
    orden: z.number(),

    /**
     * Folder under projects/ whose landing is published on this site. The public
     * URL is derived from it (see src/lib/landings.mjs), never written by hand,
     * so renaming a slug can't leave a dead link behind.
     */
    landing: z.string().optional(),

    /**
     * Two of these projects are still scaffolds with placeholder content. Showing
     * them to a prospective client as finished work would be a lie, so they carry
     * their state and are labelled wherever they appear.
     */
    estado: z.enum(['entregado', 'live', 'en_curso']),
  }),
});

export const collections = { proyectos };
