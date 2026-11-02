import { describe, expect, it } from 'vitest';
import { BOUNDS, FORMATION_IDS, buildFormation, connect } from './formations';

const N = 3000;
const share = (a: Float32Array, test: (v: number) => boolean) => Array.from(a).filter(test).length / a.length;

describe.each(FORMATION_IDS)('%s', (id) => {
  const f = buildFormation(id, N);

  it('has one position, accent and route value per point', () => {
    expect(f.positions).toHaveLength(N * 3);
    expect(f.accents).toHaveLength(N);
    expect(f.route).toHaveLength(N);
  });
  it('keeps every coordinate finite and inside the bounds', () => {
    expect(Array.from(f.positions).filter((v) => !Number.isFinite(v) || Math.abs(v) > BOUNDS)).toEqual([]);
  });
  it('keeps accents in [-1, 1], and route values at -1 or in [0, 1]', () => {
    expect(Array.from(f.accents).filter((v) => v < -1 || v > 1)).toEqual([]);
    expect(Array.from(f.route).filter((v) => v !== -1 && (v < 0 || v > 1))).toEqual([]);
  });
  it('draws the same shape on every visit', () => {
    expect(buildFormation(id, N).positions).toEqual(f.positions);
  });
  it('copes with one point and with none', () => {
    expect(buildFormation(id, 1).positions).toHaveLength(3);
    expect(buildFormation(id, 0).positions).toHaveLength(0);
  });
});

describe('what each formation shows', () => {
  it('constellation lights its nodes', () => {
    expect(share(buildFormation('constellation', N).accents, (v) => v === 1)).toBeGreaterThan(0.25);
  });
  it('page flags a few words, not many', () => {
    const s = share(buildFormation('page', N).accents, (v) => v === 1);
    expect(s).toBeGreaterThan(0);
    expect(s).toBeLessThan(0.15);
  });
  it('photo grid lifts some tiles and fades others', () => {
    const a = buildFormation('photoGrid', N).accents;
    expect(share(a, (v) => v === 1)).toBeGreaterThan(0);
    expect(share(a, (v) => v === -1)).toBeGreaterThan(0);
  });
  it('road network carries a route from its start to its end', () => {
    const r = Array.from(buildFormation('roadNetwork', N).route).filter((v) => v >= 0);
    expect(r.length / N).toBeGreaterThan(0.05);
    expect(Math.min(...r)).toBeLessThan(0.05);
    expect(Math.max(...r)).toBeGreaterThan(0.95);
  });
  it('singularity gathers most points at the centre', () => {
    const p = buildFormation('singularity', N).positions;
    let near = 0;
    for (let i = 0; i < N; i++) if (Math.hypot(p[i * 3], p[i * 3 + 1], p[i * 3 + 2]) < 0.2) near++;
    expect(near / N).toBeGreaterThan(0.85);
  });
});

describe('connect', () => {
  it('joins every node into one graph, without duplicate edges or self-loops', () => {
    const nodes: [number, number, number][] = [[0, 0, 0], [5, 0, 0], [0, 5, 0], [9, 9, 0], [1, 1, 0], [20, 0, 0]];
    const edges = connect(nodes, 1);
    const keys = edges.map(([a, b]) => (a < b ? `${a}-${b}` : `${b}-${a}`));
    expect(new Set(keys).size).toBe(keys.length);
    expect(edges.every(([a, b]) => a !== b)).toBe(true);
    const reached = new Set([0]);
    for (let grew = true; grew; ) {
      grew = false;
      for (const [a, b] of edges) {
        if (reached.has(a) !== reached.has(b)) { reached.add(a); reached.add(b); grew = true; }
      }
    }
    expect(reached.size).toBe(nodes.length);
  });
});
