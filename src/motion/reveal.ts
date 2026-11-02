import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

/** Line-by-line reveals for headings and summaries; a rise-and-fade for blocks.
 *  Called after document.fonts.ready, so lines break where the real font breaks them. */
export function initReveals(): void {
  document.querySelectorAll<HTMLElement>('[data-reveal="lines"]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'line',
      // Lines keep whole words in the page, so screen readers read the text as it is. The default
      // ('auto') puts an aria-label on the element, which is not allowed on a <p>.
      aria: 'none',
      autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, {
        yPercent: 110, duration: 0.9, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      }),
    });
  });
  // opacity, not autoAlpha: autoAlpha also sets visibility: hidden, which takes the block away from
  // screen readers until it scrolls into view.
  document.querySelectorAll<HTMLElement>('[data-reveal="fade"]').forEach((el) => {
    gsap.from(el, { opacity: 0, y: 24, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
}
