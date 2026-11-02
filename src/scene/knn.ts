import { mulberry32 } from '../lib/rng';

/** Indices of the k points nearest (qx, qy) within maxDist, nearest first.
 *  xy holds x, y pairs in screen pixels; NaN marks a point behind the camera.
 *  Brute force on purpose: 15,000 points take well under a millisecond, and the set changes every frame. */
export function nearest(xy: Float32Array, qx: number, qy: number, k: number, maxDist: number): number[] {
  if (k <= 0) return [];
  const best: { i: number; d: number }[] = [];
  const max2 = maxDist * maxDist;
  for (let i = 0; i < xy.length / 2; i++) {
    const dx = xy[i * 2] - qx, dy = xy[i * 2 + 1] - qy;
    const d = dx * dx + dy * dy;
    if (!(d <= max2)) continue; // also rejects NaN
    if (best.length === k && d >= best[k - 1].d) continue;
    if (best.length < k) best.push({ i, d });
    else best[k - 1] = { i, d };
    for (let j = best.length - 1; j > 0 && best[j - 1].d > best[j].d; j--) [best[j - 1], best[j]] = [best[j], best[j - 1]];
  }
  return best.map((b) => b.i);
}

/** A fixed, seeded sample of point indices for the pointer search, in ascending order. Random rather
 *  than every k-th point: the formations place points by index (photo tile i % 40, every third point a
 *  chapter node), and a stride in step with them would only ever reach a few tiles or nodes. */
export function searchSample(n: number, size: number, seed = 17): Uint32Array {
  const pool = Uint32Array.from({ length: n }, (_, i) => i);
  if (n <= size) return pool;
  const rng = mulberry32(seed);
  for (let i = 0; i < size; i++) {
    const j = i + Math.floor(rng() * (n - i));
    const t = pool[i];
    pool[i] = pool[j];
    pool[j] = t;
  }
  return pool.slice(0, size).sort();
}
