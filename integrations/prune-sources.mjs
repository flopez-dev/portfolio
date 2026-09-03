import { readdir, readFile, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const IMAGENES = /\.(jpe?g|png|webp|avif|gif)$/i;
const TEXTO = /\.(html|css|js|xml|txt|json)$/i;

/**
 * Deletes emitted images that nothing in the output points at.
 *
 * Astro emits every image imported from src/, referenced or not. The full-page
 * captures under src/assets/previews/ are imported only so crops can be derived
 * from them — no page ever links to an original — so each build was shipping
 * ~1.7 MB of files no visitor could request. That costs nothing to a reader but
 * it is dead weight in the Pages artifact and in the Worker's asset store.
 *
 * Only images are considered: fonts stay regardless of how they are referenced.
 * The site ships no client JavaScript, so there is no way for an image to be
 * requested by a name that does not appear literally in the output.
 */
export default function pruneSources() {
  return {
    name: 'prune-sources',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const out = fileURLToPath(dir);
        const ficheros = await readdir(out, { withFileTypes: true, recursive: true });

        const rutaDe = (entry) => path.join(entry.parentPath ?? entry.path, entry.name);
        const archivos = ficheros.filter((e) => e.isFile());

        const referencias = new Set();
        for (const entry of archivos.filter((e) => TEXTO.test(e.name))) {
          const contenido = await readFile(rutaDe(entry), 'utf8');
          for (const nombre of contenido.matchAll(/[\w.-]+\.(?:jpe?g|png|webp|avif|gif)/gi)) {
            referencias.add(nombre[0]);
          }
        }

        let borrados = 0;
        let bytes = 0;
        for (const entry of archivos.filter((e) => IMAGENES.test(e.name))) {
          if (referencias.has(entry.name)) continue;
          const ruta = rutaDe(entry);
          // Landings are copied in verbatim and own their assets; never touch them.
          if (!path.relative(out, ruta).startsWith('_astro')) continue;

          const { size } = await stat(ruta);
          await rm(ruta);
          borrados += 1;
          bytes += size;
        }

        if (borrados > 0) {
          logger.info(`${borrados} imagen(es) sin referencias eliminadas (${Math.round(bytes / 1024)} KB)`);
        }
      },
    },
  };
}
