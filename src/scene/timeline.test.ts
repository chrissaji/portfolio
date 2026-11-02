import { describe, expect, it } from 'vitest';
import { stateAt, stopsFromSections, type Stop } from './timeline';

const stops: Stop[] = [
  { at: 0, formation: 'clusters', dim: 0 },
  { at: 1000, formation: 'constellation', dim: 0.2 },
  { at: 2000, formation: 'page', dim: 0.2 },
];

describe('stateAt', () => {
  it('holds the first formation before the first stop', () => {
    expect(stateAt(-50, stops)).toEqual({ from: 'clusters', to: 'clusters', t: 0, dim: 0, shift: 0 });
  });
  it('holds the last formation after the last stop', () => {
    expect(stateAt(5000, stops)).toEqual({ from: 'page', to: 'page', t: 0, dim: 0.2, shift: 0 });
  });
  it('blends half-way at the midpoint', () => {
    expect(stateAt(500, stops)).toMatchObject({ from: 'clusters', to: 'constellation', t: 0.5, dim: 0.1 });
  });
  it('eases in and out (smoothstep)', () => {
    expect(stateAt(250, stops).t).toBeCloseTo(0.15625, 6);
  });
  it('is exactly the stop formation when sitting on a stop', () => {
    expect(stateAt(1000, stops)).toMatchObject({ from: 'constellation', to: 'page', t: 0 });
  });
  it('copes with two stops at the same place', () => {
    const s = stateAt(10, [{ at: 0, formation: 'clusters', dim: 0 }, { at: 10, formation: 'page', dim: 0 }, { at: 10, formation: 'singularity', dim: 0 }]);
    expect(Number.isNaN(s.t)).toBe(false);
  });
  it('works with a single stop', () => {
    expect(stateAt(300, [stops[0]])).toEqual({ from: 'clusters', to: 'clusters', t: 0, dim: 0, shift: 0 });
  });
  it('blends the sideways shift with the morph, and treats a missing shift as 0', () => {
    const shifted: Stop[] = [{ at: 0, formation: 'clusters', dim: 0, shift: 0.2 }, { at: 1000, formation: 'photoGrid', dim: 0, shift: -0.2 }, { at: 2000, formation: 'page', dim: 0 }];
    expect(stateAt(500, shifted).shift).toBeCloseTo(0, 6);
    expect(stateAt(0, shifted).shift).toBe(0.2);
    expect(stateAt(1500, shifted).shift).toBeCloseTo(-0.1, 6);
    expect(stateAt(3000, shifted).shift).toBe(0);
  });
  it('rejects an empty list', () => {
    expect(() => stateAt(0, [])).toThrow();
  });
});

describe('stopsFromSections', () => {
  it('puts each stop where its section is centred on screen', () => {
    const s = stopsFromSections([
      { top: 0, height: 800, formation: 'clusters', dim: 0 },
      { top: 1000, height: 800, formation: 'page', dim: 0.2 },
    ], 800, 5000);
    expect(s.map((x) => x.at)).toEqual([0, 1000]);
  });
  it('never puts a stop past the end of the page', () => {
    const s = stopsFromSections([{ top: 4800, height: 600, formation: 'singularity', dim: 0 }], 800, 4600);
    expect(s[0].at).toBe(4600);
  });
  it('carries each section shift, 0 when it has none', () => {
    const s = stopsFromSections([
      { top: 0, height: 800, formation: 'clusters', dim: 0, shift: 0.2 },
      { top: 1000, height: 800, formation: 'page', dim: 0 },
    ], 800, 5000);
    expect(s.map((x) => x.shift ?? 0)).toEqual([0.2, 0]);
  });
  it('sorts by position', () => {
    const s = stopsFromSections([
      { top: 2000, height: 800, formation: 'page', dim: 0 },
      { top: 0, height: 800, formation: 'clusters', dim: 0 },
    ], 800, 5000);
    expect(s.map((x) => x.formation)).toEqual(['clusters', 'page']);
  });
});
