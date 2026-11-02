import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isTooSlow, type Quality } from '../lib/quality';
import { createFieldScene, type FieldScene, type SceneColors } from './field';
import { FORMATION_IDS, type FormationId } from './formations';
import { stateAt, stopsFromSections, type Stop } from './timeline';

const HEX = /^#[0-9a-f]{6}$/i;

export function readSceneColors(style: Pick<CSSStyleDeclaration, 'getPropertyValue'>): SceneColors {
  const pick = (name: string, fallback: string) => {
    const v = style.getPropertyValue(name).trim();
    return HEX.test(v) ? v : fallback;
  };
  return {
    point: pick('--field-point', '#d9dee8'),
    accent: pick('--field-accent', '#7cf0c5'),
    additive: style.getPropertyValue('--field-blend').trim() !== 'normal',
  };
}

export function mountField(canvas: HTMLCanvasElement, q: Quality): FieldScene {
  const root = document.documentElement;
  const field = createFieldScene(canvas, q);
  const paint = () => field.setColors(readSceneColors(getComputedStyle(root)));
  paint();
  new MutationObserver(paint).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', paint);
  field.onContextLost(() => { root.dataset.motion = 'static'; });

  field.setMorph('clusters', 'clusters', 0);
  root.dataset.formation = 'clusters';
  if (q.mode === 'still') return field;

  window.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') field.setPointer({ x: e.clientX, y: e.clientY }); }, { passive: true });
  root.addEventListener('pointerleave', () => field.setPointer(null));
  field.setWander(!window.matchMedia('(hover: hover)').matches);
  // Once the page has fallen back to the still image (context lost, too slow), the scene stays stopped.
  const fellBack = () => root.dataset.motion === 'static';
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) field.stop();
    else if (!fellBack()) field.start();
  });
  field.start();
  // The spec's weak-device fallback: a machine that cannot keep 20 frames a second gets the still image.
  watchFrameRate(() => { field.stop(); root.dataset.motion = 'static'; });

  // Only the page's sections: the scene also writes data-formation on <html>.
  const sections = [...document.querySelectorAll<HTMLElement>('main [data-formation]')];
  const isFormation = (v: string | undefined): v is FormationId => FORMATION_IDS.includes(v as FormationId);
  // Below 1024 px the projects are one column, so the formations stay centred.
  const measure = (): Stop[] => stopsFromSections(
    sections.map((s) => {
      const r = s.getBoundingClientRect();
      const shift = window.innerWidth >= 1024 ? Number(s.dataset.shift ?? 0) : 0;
      return { top: r.top + window.scrollY, height: r.height, formation: isFormation(s.dataset.formation) ? s.dataset.formation : 'clusters', dim: Number(s.dataset.dim ?? 0), shift };
    }),
    window.innerHeight,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  let stops = measure();
  const apply = (y: number) => {
    if (fellBack()) return;
    const s = stateAt(y, stops);
    field.setMorph(s.from, s.to, s.t);
    field.setDim(s.dim);
    field.setShift(s.shift);
    root.dataset.formation = s.t < 0.5 ? s.from : s.to;
  };
  // ScrollTrigger reports the position (never a raw scroll listener: the taste skill bans those).
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => apply(self.scroll()),
    onRefresh: (self) => { stops = measure(); apply(self.scroll()); },
  });
  apply(window.scrollY);
  return field;
}

/** Times 60 frames (the first 15 are warm-up) and calls onSlow when the median is under 20 a second. */
function watchFrameRate(onSlow: () => void): void {
  const frames: number[] = [];
  let last = 0;
  const tick = (now: number) => {
    if (last) frames.push(now - last);
    last = now;
    if (frames.length < 60) requestAnimationFrame(tick);
    else if (isTooSlow(frames.slice(15))) onSlow();
  };
  requestAnimationFrame(tick);
}
