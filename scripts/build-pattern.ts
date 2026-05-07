/**
 * One-shot composer for the public catalog's decorative background pattern.
 *
 * Reads the individual asset PNGs in `public/calzones/`, places them at fixed
 * coordinates inside an 800×800 transparent tile (with mild rotations for an
 * organic non-grid feel), and writes the composite as
 * `public/patterns/calzones.webp` so Tailwind's `bg-calzones-pattern` utility
 * can repeat it.
 *
 * Re-run if the source PNGs change:
 *   npx tsx scripts/build-pattern.ts
 *
 * Pieces stay fully inside the tile bounds so the repeat is seamless — no
 * piece is sliced at the edges.
 */
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import sharp from 'sharp';

// Resolve relative to the repo root regardless of where the script is invoked
// from. tsx in CJS mode doesn't expose `import.meta.dirname` reliably, so use
// process.cwd() — this script is always run from the repo root.
const ROOT = process.cwd();
const SRC_DIR = resolve(ROOT, 'public/calzones');
const OUT_PATH = resolve(ROOT, 'public/patterns/calzones.webp');

const TILE = 800;

type Piece = {
  file: string;
  /** Long-edge target in px. */
  size: number;
  /** Top-left of the piece's bounding box inside the tile. */
  left: number;
  top: number;
  /** Degrees, signed. */
  rotate: number;
};

// Coordinates are tuned by eye — distribute across the tile, no edge collisions.
const PIECES: Piece[] = [
  { file: 'conejo.png',    size: 120, left:  60, top:  50, rotate: -10 },
  { file: 'handcuff.png',  size: 140, left: 560, top:  70, rotate:   8 },
  { file: 'jueguete1.png', size: 150, left: 320, top: 200, rotate:  -5 },
  { file: 'juguete2.png',  size: 170, left:  80, top: 380, rotate:  12 },
  { file: 'juguete3.png',  size: 150, left: 560, top: 360, rotate:  -8 },
  { file: 'juguete4.png',  size: 160, left: 180, top: 580, rotate:   4 },
  { file: 'juguete5.png',  size: 140, left: 500, top: 600, rotate: -12 },
];

async function renderPiece(piece: Piece): Promise<{
  input: Buffer;
  left: number;
  top: number;
}> {
  const buf = await sharp(resolve(SRC_DIR, piece.file))
    .resize({ width: piece.size, height: piece.size, fit: 'inside' })
    .rotate(piece.rotate, {
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  // Round-trip through metadata so we can clamp the final position to the
  // tile without overflow (rotation grows the bbox).
  const meta = await sharp(buf).metadata();
  const w = meta.width ?? piece.size;
  const h = meta.height ?? piece.size;
  return {
    input: buf,
    left: Math.max(0, Math.min(piece.left, TILE - w)),
    top: Math.max(0, Math.min(piece.top, TILE - h)),
  };
}

async function main() {
  await mkdir(dirname(OUT_PATH), { recursive: true });

  const composites = await Promise.all(PIECES.map(renderPiece));

  const tile = await sharp({
    create: {
      width: TILE,
      height: TILE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .webp({ quality: 82 })
    .toBuffer();

  await sharp(tile).toFile(OUT_PATH);

  const sizeKb = (tile.byteLength / 1024).toFixed(1);
  console.log(`✓ Wrote ${OUT_PATH} (${TILE}×${TILE}, ${sizeKb} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
