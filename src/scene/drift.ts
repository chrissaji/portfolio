/** Idle drift and the opening scatter. The vertex shader (shaders.ts) computes the same formulas;
 *  drift.test.ts keeps the two in step, because the pointer query reads these CPU positions. */
export const DRIFT_AMP = 0.035;
export const DRIFT_FREQ = [0.6, 0.5, 0.7] as const;
export const INTRO_SPREAD = 9;
const TAU = 6.2831853;

export function driftAt(px: number, py: number, pz: number, time: number, out: Float32Array): void {
  out[0] = DRIFT_AMP * Math.sin(time * DRIFT_FREQ[0] + px * TAU);
  out[1] = DRIFT_AMP * Math.sin(time * DRIFT_FREQ[1] + py * TAU);
  out[2] = DRIFT_AMP * Math.sin(time * DRIFT_FREQ[2] + pz * TAU);
}
