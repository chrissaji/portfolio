import { describe, expect, it } from 'vitest';
import { nearest, searchSample } from './knn';

// Points at x = 0, 10, 20, ... 90 on y = 0.
const line = new Float32Array(Array.from({ length: 10 }, (_, i) => [i * 10, 0]).flat());

describe('nearest', () => {
  it('returns the k nearest, nearest first', () => {
    expect(nearest(line, 31, 0, 3, 100)).toEqual([3, 4, 2]);
  });
  it('leaves out points beyond the radius', () => {
    expect(nearest(line, 0, 0, 5, 15)).toEqual([0, 1]);
  });
  it('returns fewer than k when there are fewer points', () => {
    expect(nearest(new Float32Array([0, 0, 5, 5]), 0, 0, 12, 100)).toEqual([0, 1]);
  });
  it('skips points behind the camera (NaN)', () => {
    expect(nearest(new Float32Array([NaN, NaN, 3, 4]), 0, 0, 2, 100)).toEqual([1]);
  });
  it('returns nothing for k = 0', () => {
    expect(nearest(line, 0, 0, 0, 100)).toEqual([]);
  });
});

describe('searchSample', () => {
  it('keeps every point when there are no more than asked for', () => {
    expect(Array.from(searchSample(10, 500))).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('picks the asked number of distinct points, in order, the same on every visit', () => {
    const s = searchSample(15000, 500);
    expect(s.length).toBe(500);
    expect(new Set(s).size).toBe(500);
    expect(Array.from(s).every((v, i, a) => i === 0 || a[i - 1] < v)).toBe(true);
    expect(Array.from(searchSample(15000, 500))).toEqual(Array.from(s));
  });
  // formations.ts places points by index: photo tile i % 40, and every third point a chapter node
  // (node floor(i / 3) % 56). A sample in step with those patterns reaches only a few tiles or nodes.
  it('reaches nearly every photo tile and chapter node, on both quality tiers', () => {
    for (const n of [15000, 5000]) {
      const s = Array.from(searchSample(n, 500));
      expect(new Set(s.map((i) => i % 40)).size).toBeGreaterThanOrEqual(38);
      const nodePoints = s.filter((i) => i % 3 === 0);
      expect(new Set(nodePoints.map((i) => Math.floor(i / 3) % 56)).size).toBeGreaterThanOrEqual(48);
      expect(nodePoints.length / s.length).toBeLessThan(0.5);
    }
  });
});
