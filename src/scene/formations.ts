import { gaussian, mulberry32, type Rng } from '../lib/rng';

export type FormationId = 'clusters' | 'constellation' | 'page' | 'photoGrid' | 'roadNetwork' | 'singularity';
export const FORMATION_IDS: readonly FormationId[] = ['clusters', 'constellation', 'page', 'photoGrid', 'roadNetwork', 'singularity'];

/** Every coordinate of every formation lies within [-BOUNDS, BOUNDS]. */
export const BOUNDS = 2.2;

export interface Formation {
  /** x, y, z for each point. */
  positions: Float32Array;
  /** Per point: -1 faded, 0 plain, 1 lit in the accent colour. */
  accents: Float32Array;
  /** Per point: where it sits along the highlighted route (0 to 1), or -1 when it is off the route. */
  route: Float32Array;
}

type Vec3 = [number, number, number];

function blank(n: number): Formation {
  return { positions: new Float32Array(n * 3), accents: new Float32Array(n), route: new Float32Array(n).fill(-1) };
}

const clamp = (v: number) => Math.max(-BOUNDS, Math.min(BOUNDS, v));
const spread = (rng: Rng, half: number) => (rng() * 2 - 1) * half;

function put(f: Formation, i: number, x: number, y: number, z: number): void {
  f.positions[i * 3] = clamp(x);
  f.positions[i * 3 + 1] = clamp(y);
  f.positions[i * 3 + 2] = clamp(z);
}

/** Rotate about the x axis: lays a flat formation back like a page or a street plan seen at an angle. */
function lean(y: number, z: number, angle: number): [number, number] {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [y * c - z * s, y * s + z * c];
}

/** A minimum spanning tree (so the graph is connected) plus each node's k nearest neighbours. */
export function connect(nodes: readonly Vec3[], k: number): [number, number][] {
  const seen = new Set<string>();
  const edges: [number, number][] = [];
  const add = (a: number, b: number) => {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (a !== b && !seen.has(key)) { seen.add(key); edges.push([a, b]); }
  };
  const d2 = (a: number, b: number) => {
    const p = nodes[a], q = nodes[b];
    return (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2;
  };
  if (nodes.length === 0) return edges;
  const inTree = new Set<number>([0]);
  while (inTree.size < nodes.length) {
    let best: [number, number] | null = null;
    let bestD = Infinity;
    for (const a of inTree) {
      for (let b = 0; b < nodes.length; b++) {
        if (inTree.has(b)) continue;
        const d = d2(a, b);
        if (d < bestD) { bestD = d; best = [a, b]; }
      }
    }
    if (!best) break;
    add(best[0], best[1]);
    inTree.add(best[1]);
  }
  for (let a = 0; a < nodes.length; a++) {
    const near = nodes.map((_, b) => b).filter((b) => b !== a).sort((x, y) => d2(a, x) - d2(a, y)).slice(0, k);
    for (const b of near) add(a, b);
  }
  return edges;
}

/** Faces in a vector index: soft clusters with a few strays. */
function clusters(n: number, rng: Rng): Formation {
  const f = blank(n);
  const centres: Vec3[] = Array.from({ length: 9 }, () => [spread(rng, 1.6), spread(rng, 0.95), spread(rng, 0.8)]);
  const sizes = centres.map(() => 0.1 + rng() * 0.18);
  for (let i = 0; i < n; i++) {
    if (rng() < 0.1) { put(f, i, spread(rng, 2), spread(rng, 1.25), spread(rng, 1.2)); continue; }
    const c = Math.floor(rng() * centres.length);
    const [x, y, z] = centres[c];
    const s = sizes[c];
    put(f, i, x + gaussian(rng) * s, y + gaussian(rng) * s, z + gaussian(rng) * s);
  }
  return f;
}

/** FlowPrep's knowledge map: lit chapter nodes joined by links. */
function constellation(n: number, rng: Rng): Formation {
  const f = blank(n);
  const nodes: Vec3[] = Array.from({ length: 56 }, () => {
    const x = spread(rng, 1.9);
    return [x, spread(rng, 1.1), Math.sin(x * 1.3) * 0.35 + spread(rng, 0.15)];
  });
  const edges = connect(nodes, 2);
  for (let i = 0; i < n; i++) {
    if (i % 3 === 0) {
      const [x, y, z] = nodes[Math.floor(i / 3) % nodes.length];
      put(f, i, x + gaussian(rng) * 0.025, y + gaussian(rng) * 0.025, z + gaussian(rng) * 0.025);
      f.accents[i] = 1;
      continue;
    }
    const [a, b] = edges[Math.floor(rng() * edges.length)];
    const p = nodes[a], q = nodes[b], t = rng();
    put(
      f, i,
      p[0] + (q[0] - p[0]) * t + gaussian(rng) * 0.008,
      p[1] + (q[1] - p[1]) * t + gaussian(rng) * 0.008,
      p[2] + (q[2] - p[2]) * t + gaussian(rng) * 0.008,
    );
  }
  return f;
}

/** ProofML: rows of a printed page, a few words flagged. */
function page(n: number, rng: Rng): Formation {
  const f = blank(n);
  const words: { x0: number; x1: number; y: number; flagged: boolean }[] = [];
  const left = -1.6, right = 1.6, top = 1.2, gap = 0.112;
  for (let r = 0; r < 22; r++) {
    const y = top - r * gap;
    const end = r % 6 === 5 ? left + (right - left) * (0.3 + rng() * 0.4) : right;
    for (let x = left; x < end - 0.08; ) {
      const w = Math.min(0.08 + rng() * 0.3, end - x);
      words.push({ x0: x, x1: x + w, y, flagged: false });
      x += w + 0.05;
    }
  }
  for (let k = 0; k < 7; k++) words[Math.floor(rng() * words.length)].flagged = true;
  const cumulative: number[] = [];
  let total = 0;
  for (const w of words) { total += w.x1 - w.x0; cumulative.push(total); }
  for (let i = 0; i < n; i++) {
    const pick = rng() * total;
    let lo = 0, hi = cumulative.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (cumulative[mid] < pick) lo = mid + 1; else hi = mid; }
    const w = words[lo];
    const [y, z] = lean(w.y + (rng() - 0.5) * 0.035, (rng() - 0.5) * 0.02, -0.45);
    put(f, i, w.x0 + rng() * (w.x1 - w.x0), y, z);
    if (w.flagged) f.accents[i] = 1;
  }
  return f;
}

/** ClickMomentz culling: a grid of photo frames, the best lifted and lit, the weakest sunk and faded. */
function photoGrid(n: number, rng: Rng): Formation {
  const f = blank(n);
  const cols = 8, rows = 5, w = 0.42, h = 0.3, gap = 0.08;
  const width = cols * w + (cols - 1) * gap, height = rows * h + (rows - 1) * gap;
  const tiles = Array.from({ length: cols * rows }, (_, k) => ({
    x0: -width / 2 + (k % cols) * (w + gap),
    y0: height / 2 - Math.floor(k / cols) * (h + gap) - h,
    score: rng(),
  }));
  const ranked = [...tiles].sort((a, b) => b.score - a.score);
  const kept = new Set(ranked.slice(0, 10));
  const dropped = new Set(ranked.slice(-10));
  for (let i = 0; i < n; i++) {
    const tile = tiles[i % tiles.length];
    let x = tile.x0 + rng() * w;
    let y = tile.y0 + rng() * h;
    // Two points in five trace the tile's edge, so each tile reads as a frame.
    if (rng() < 0.4) {
      if (rng() < 0.5) x = rng() < 0.5 ? tile.x0 : tile.x0 + w;
      else y = rng() < 0.5 ? tile.y0 : tile.y0 + h;
    }
    const z = kept.has(tile) ? 0.45 : dropped.has(tile) ? -0.6 : 0;
    put(f, i, x, y, z + (rng() - 0.5) * 0.02);
    f.accents[i] = kept.has(tile) ? 1 : dropped.has(tile) ? -1 : 0;
  }
  return f;
}

function argBest<T>(items: readonly T[], score: (t: T) => number): number {
  let best = 0;
  items.forEach((item, i) => { if (score(item) < score(items[best])) best = i; });
  return best;
}

function pathBetween(count: number, edges: readonly [number, number][], from: number, to: number): number[] {
  const next: number[][] = Array.from({ length: count }, () => []);
  for (const [a, b] of edges) { next[a].push(b); next[b].push(a); }
  const prev = new Array<number>(count).fill(-1);
  prev[from] = from;
  const queue = [from];
  while (queue.length > 0) {
    const a = queue.shift()!;
    if (a === to) break;
    for (const b of next[a]) if (prev[b] === -1) { prev[b] = a; queue.push(b); }
  }
  if (prev[to] === -1) return [from];
  const path = [to];
  while (path[0] !== from) path.unshift(prev[path[0]]);
  return path;
}

/** The thesis: cameras on a road network, one vehicle's route lit, impossible candidates floating and faded. */
function roadNetwork(n: number, rng: Rng): Formation {
  const f = blank(n);
  const cams: Vec3[] = Array.from({ length: 14 }, () => [spread(rng, 1.9), spread(rng, 1.1), 0]);
  const edges = connect(cams, 1);
  const route = pathBetween(cams.length, edges, argBest(cams, (c) => c[0]), argBest(cams, (c) => -c[0]));
  const lengths = route.slice(1).map((b, s) => Math.hypot(cams[b][0] - cams[route[s]][0], cams[b][1] - cams[route[s]][1]));
  const total = lengths.reduce((a, b) => a + b, 0) || 1;
  const onRoute = new Map<string, { start: number; length: number; from: number }>();
  let run = 0;
  route.slice(1).forEach((b, s) => {
    const a = route[s];
    onRoute.set(a < b ? `${a}-${b}` : `${b}-${a}`, { start: run / total, length: lengths[s] / total, from: a });
    run += lengths[s];
  });
  const tilt = -0.9;
  for (let i = 0; i < n; i++) {
    const roll = rng();
    if (roll < 0.12) {
      const [x, y] = cams[i % cams.length];
      const [ly, lz] = lean(y + gaussian(rng) * 0.03, gaussian(rng) * 0.03, tilt);
      put(f, i, x + gaussian(rng) * 0.03, ly, lz);
      f.accents[i] = 1;
      continue;
    }
    if (roll < 0.22) {
      const [ly, lz] = lean(spread(rng, 1.2), 0.2 + rng() * 0.6, tilt);
      put(f, i, spread(rng, 2), ly, lz);
      f.accents[i] = -1;
      continue;
    }
    const [a, b] = edges[Math.floor(rng() * edges.length)];
    const t = rng();
    const p = cams[a], q = cams[b];
    const [ly, lz] = lean(p[1] + (q[1] - p[1]) * t + gaussian(rng) * 0.01, gaussian(rng) * 0.01, tilt);
    put(f, i, p[0] + (q[0] - p[0]) * t + gaussian(rng) * 0.01, ly, lz);
    const seg = onRoute.get(a < b ? `${a}-${b}` : `${b}-${a}`);
    if (seg) f.route[i] = seg.start + seg.length * (seg.from === a ? t : 1 - t);
  }
  return f;
}

/** Contact: everything collapses into one bright point, with a thin shell around it. */
function singularity(n: number, rng: Rng): Formation {
  const f = blank(n);
  for (let i = 0; i < n; i++) {
    if (i % 10 === 0) {
      const theta = rng() * Math.PI * 2, phi = Math.acos(rng() * 2 - 1), r = 0.55 + rng() * 0.25;
      put(f, i, r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
      continue;
    }
    put(f, i, gaussian(rng) * 0.045, gaussian(rng) * 0.045, gaussian(rng) * 0.045);
    f.accents[i] = 1;
  }
  return f;
}

const BUILDERS: Record<FormationId, (n: number, rng: Rng) => Formation> = {
  clusters, constellation, page, photoGrid, roadNetwork, singularity,
};

export function buildFormation(id: FormationId, n: number, seed = 7): Formation {
  return BUILDERS[id](n, mulberry32(seed * 1009 + FORMATION_IDS.indexOf(id) * 101));
}
