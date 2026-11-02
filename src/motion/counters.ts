import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { formatCount, readCountFormat } from './format';

/** Numbers count up once when they come into view. The HTML already holds the final value, and a
 *  screen-reader copy sits beside each (the animated span is aria-hidden). */
export function initCounters(): void {
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const spec = readCountFormat(el.dataset);
    if (!spec) return;
    // The digits are mono: reserve the final width in ch, so counting up never pushes the next stat over.
    el.style.display = 'inline-block';
    el.style.minWidth = `${el.textContent?.length ?? 0}ch`;
    el.textContent = formatCount(0, spec.format);
    const state = { v: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.fromTo(state, { v: 0 }, {
          v: spec.target, duration: 1.4, ease: 'power2.out',
          onUpdate: () => { el.textContent = formatCount(state.v, spec.format); },
        });
      },
    });
  });
}
