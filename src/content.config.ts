import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

/**
 * Fields that describe the project rather than tell it: the same value in every
 * language. They live only in the Spanish file, which is the source of truth.
 *
 * They used to be repeated in both files — 28 values across four projects, kept
 * in step by nothing but discipline. A drifting `orden` would have ordered the
 * two grids differently, a drifting `destacado` would have featured different
 * projects on each home page, and nothing would have said a word.
 */
const compartido = {
  año: z.number(),
  /** The project's own domain, when it has one. */
  url: z.url().optional(),
  /** Capture base name: src/assets/previews/<portada>.jpg, derived at build time. */
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
};

/** The prose. This is what actually gets translated. */
const traducible = {
  title: z.string(),
  cliente: z.string(),
  sector: z.string(),
  resumen: z.string(),
  servicios: z.array(z.string()),
  stack: z.array(z.string()),
};

/** Spanish: the whole record. One file per project, its filename the slug. */
const proyectos = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects/es' }),
  schema: z.object({ ...traducible, ...compartido }),
});

/**
 * English: the translation and nothing else. `.strict()` on purpose — a shared
 * field left in here would be a second copy of a value that already has an
 * owner, so the build says so instead of silently ignoring it.
 */
const proyectosEn = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects/en' }),
  schema: z.object(traducible).strict(),
});

export const collections = { proyectos, proyectosEn };
