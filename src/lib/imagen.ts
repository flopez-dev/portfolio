import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Intrinsic size of a JPEG in public/, read at build time.
 *
 * The previews are full-page screenshots produced by tools/preview-shots.sh, so
 * every one is a different height and those heights change whenever a landing
 * does. Reading them from the file keeps the width/height attributes honest —
 * and the layout free of shifts — with no number to update by hand.
 */
export function medidas(rutaEnPublic: string): { width: number; height: number } {
  const data = readFileSync(path.join(process.cwd(), 'public', rutaEnPublic));

  let i = 2;
  while (i < data.length) {
    if (data[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = data[i + 1]!;
    // SOF0/1/2/3 carry the frame dimensions.
    if (marker >= 0xc0 && marker <= 0xc3) {
      return { height: data.readUInt16BE(i + 5), width: data.readUInt16BE(i + 7) };
    }
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    i += 2 + data.readUInt16BE(i + 2);
  }

  throw new Error(`No pude leer las dimensiones de public/${rutaEnPublic}`);
}
