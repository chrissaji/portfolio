import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { FieldScene } from '../scene/field';
import { initCounters } from './counters';
import { playIntro } from './intro';
import { initRail, initSectionNav } from './rail';
import { initReveals } from './reveal';
import { initTilt } from './tilt';

export function initMotion({ motionOK, field, capture }: { motionOK: boolean; field: FieldScene | null; capture: boolean }): void {
  initRail();
  initSectionNav();
  if (!motionOK || capture) return;
  if (field) playIntro(field);
  initTilt();
  void document.fonts.ready.then(() => {
    initReveals();
    initCounters();
    ScrollTrigger.refresh();
  });
}
