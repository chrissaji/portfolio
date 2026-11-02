import { gsap } from 'gsap';
import type { FieldScene } from '../scene/field';

/** Storytelling: points stream in from a wide scatter and settle into clusters, the index forming.
 *  Only the scene moves; the text is still and readable from the first frame. */
export function playIntro(field: FieldScene): void {
  const state = { p: 0 };
  field.setIntro(0);
  gsap.to(state, { p: 1, duration: 1.4, ease: 'expo.out', onUpdate: () => field.setIntro(state.p) });
}
