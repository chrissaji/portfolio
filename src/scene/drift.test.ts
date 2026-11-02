import { describe, expect, it } from 'vitest';
import { DRIFT_AMP, DRIFT_FREQ, INTRO_SPREAD, driftAt } from './drift';
import { POINT_VERTEX } from './shaders';

describe('driftAt', () => {
  it('is zero at time zero for phase zero', () => {
    const out = new Float32Array(3);
    driftAt(0, 0, 0, 0, out);
    expect(Array.from(out)).toEqual([0, 0, 0]);
  });
  it('peaks at the amplitude a quarter-turn in', () => {
    const out = new Float32Array(3);
    driftAt(0.25, 0, 0, 0, out);
    expect(out[0]).toBeCloseTo(DRIFT_AMP, 6);
  });
});

describe('the shader matches the CPU copy', () => {
  // The pointer query computes positions on the CPU; if these drift apart, the links point at empty space.
  it('uses the same drift frequencies, the same phase scale and the intro uniform', () => {
    expect(POINT_VERTEX).toContain(`vec3(${DRIFT_FREQ.join(', ')})`);
    expect(POINT_VERTEX).toContain('aPhase * 6.2831853');
    expect(POINT_VERTEX).toContain('(aPhase - 0.5) * uIntroSpread');
    expect(INTRO_SPREAD).toBe(9);
  });
});
