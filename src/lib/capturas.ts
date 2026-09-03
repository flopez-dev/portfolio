import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

/**
 * The full-page captures under src/assets/previews/ are the only committed
 * images: one JPEG per landing, produced by tools/preview-shots.sh. Every image
 * the site serves — card crops, the full-length view, sharing cards — is derived
 * from them at build time, so there is never a second file to keep in sync.
 */
const ficheros = import.meta.glob<{ default: ImageMetadata }>('/src/assets/previews/*.jpg');

/** Sharing card for pages that are not about one project. */
export const CAPTURA_POR_DEFECTO = 'inmica';

/** What Facebook, LinkedIn, WhatsApp and X all crop a sharing card to. */
const RATIO_SOCIAL = 1200 / 630;

export async function captura(nombre: string): Promise<ImageMetadata> {
  const cargar = ficheros[`/src/assets/previews/${nombre}.jpg`];
  if (!cargar) {
    throw new Error(
      `Falta src/assets/previews/${nombre}.jpg — genéralo con: tools/preview-shots.sh ${nombre}`,
    );
  }
  return (await cargar()).default;
}

/**
 * 1200x630 crop of the top of a capture: the frame every social platform crops
 * to, and the reason this exists — sharing the full-page capture meant offering
 * a 900x5071 image that came out as an unrecognisable sliver, or was dropped.
 *
 * JPEG rather than webp: sharing cards are fetched by scrapers, not browsers,
 * and some of them still only handle JPEG and PNG.
 */
export async function imagenSocial(nombre: string): Promise<string> {
  const origen = await captura(nombre);

  // 1200x630 is the recommended size, but the captures are 900px wide and Astro
  // will not upscale — asking for 1200 silently returned a 900x630 card at the
  // wrong ratio. Take the widest 1.91:1 frame the source can actually give.
  const ancho = Math.min(1200, origen.width);

  const generada = await getImage({
    src: origen,
    width: ancho,
    height: Math.round(ancho / RATIO_SOCIAL),
    fit: 'cover',
    position: 'top',
    format: 'jpeg',
    quality: 80,
  });
  return generada.src;
}
