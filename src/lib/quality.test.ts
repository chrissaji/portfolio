import { describe, expect, it } from 'vitest';
import { POINTS, isSoftwareRenderer, isTooSlow, pickQuality, type Device } from './quality';

const laptop: Device = { webgl: true, reducedMotion: false, saveData: false, width: 1440, cores: 8, memoryGb: 8, pixelRatio: 2 };

describe('pickQuality', () => {
  it('runs the full field on a capable laptop', () => {
    expect(pickQuality(laptop)).toEqual({ mode: 'full', points: POINTS.full, dpr: 2 });
  });
  it('caps the pixel ratio at 2', () => {
    expect(pickQuality({ ...laptop, pixelRatio: 3 }).dpr).toBe(2);
  });
  it('runs a lighter field on a phone', () => {
    expect(pickQuality({ ...laptop, width: 375, pixelRatio: 3 })).toEqual({ mode: 'lite', points: POINTS.lite, dpr: 1.5 });
  });
  it('runs a lighter field on a weak machine', () => {
    expect(pickQuality({ ...laptop, cores: 4 }).mode).toBe('lite');
    expect(pickQuality({ ...laptop, memoryGb: 4 }).mode).toBe('lite');
  });
  it('draws one still frame for reduced motion', () => {
    expect(pickQuality({ ...laptop, reducedMotion: true }).mode).toBe('still');
  });
  it('falls back to the static image without WebGL or on data saver', () => {
    expect(pickQuality({ ...laptop, webgl: false })).toEqual({ mode: 'static', points: 0, dpr: 1 });
    expect(pickQuality({ ...laptop, saveData: true }).mode).toBe('static');
  });
  it('treats unknown cores and memory as capable', () => {
    expect(pickQuality({ ...laptop, cores: undefined, memoryGb: undefined }).mode).toBe('full');
  });
});

describe('isSoftwareRenderer', () => {
  it('spots WebGL drawn on the CPU', () => {
    expect(isSoftwareRenderer('ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)')).toBe(true);
    expect(isSoftwareRenderer('llvmpipe (LLVM 15.0.7, 256 bits)')).toBe(true);
    expect(isSoftwareRenderer('ANGLE (Microsoft, Microsoft Basic Render Driver Direct3D11 vs_5_0 ps_5_0, D3D11)')).toBe(true);
  });
  it('passes a real GPU, and an unknown name', () => {
    expect(isSoftwareRenderer('ANGLE (Intel, Intel(R) Iris(R) Xe Graphics (0x000046A6) Direct3D11 vs_5_0 ps_5_0, D3D11)')).toBe(false);
    expect(isSoftwareRenderer('Apple GPU')).toBe(false);
    expect(isSoftwareRenderer('')).toBe(false);
  });
});

describe('isTooSlow', () => {
  it('flags a scene that cannot hold 20 frames a second', () => {
    expect(isTooSlow(Array.from({ length: 60 }, () => 70))).toBe(true);
  });
  it('passes a smooth scene, even with a few long frames', () => {
    const frames = Array.from({ length: 60 }, (_, i) => (i % 10 === 0 ? 400 : 16.7));
    expect(isTooSlow(frames)).toBe(false);
  });
  it('needs enough frames to judge', () => {
    expect(isTooSlow([200, 200])).toBe(false);
  });
});
