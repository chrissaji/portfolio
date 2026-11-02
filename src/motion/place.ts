import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type Lenis from 'lenis';

export interface Box { top: number; height: number }
export interface Place { index: number; ratio: number }

/** The section under the viewport's centre line, and how far down it (0 to 1) the line falls. */
export function placeAt(boxes: readonly Box[], y: number, viewport: number): Place | null {
  if (boxes.length === 0) return null;
  const centre = y + viewport / 2;
  let index = 0, best = Infinity;
  boxes.forEach((b, i) => {
    const distance = centre < b.top ? b.top - centre : centre > b.top + b.height ? centre - b.top - b.height : 0;
    if (distance < best) { best = distance; index = i; }
  });
  const b = boxes[index];
  return { index, ratio: Math.min(1, Math.max(0, (centre - b.top) / Math.max(b.height, 1))) };
}

/** The scroll position that puts the same point of the same section back under the centre line. */
export function scrollFor(place: Place, boxes: readonly Box[], viewport: number, maxScroll: number): number | null {
  const b = boxes[place.index];
  if (!b) return null;
  return Math.min(maxScroll, Math.max(0, b.top + place.ratio * b.height - viewport / 2));
}

export interface Size { w: number; h: number }

/** A resize worth putting the visitor back for: the width changed, or the height by more than a quarter.
 *  A phone's toolbar sliding away changes the height a little and is not one (ScrollTrigger's own rule). */
export function isRealResize(before: Size, after: Size): boolean {
  return before.w !== after.w || Math.abs(after.h - before.h) > before.h * 0.25;
}

/** How long after a size change the page keeps putting the visitor back: a rotation can settle in stages
 *  (the width first, the viewport units and the text after), each one a new layout. */
const SETTLE_MS = 1500;

/** A resize or a phone rotation reflows the page; keep the visitor on the same part of the same section.
 *  Also re-measures every scroll trigger when the content's size changes (late fonts, a new layout). */
export function keepPlace(sections: readonly HTMLElement[], lenis: Lenis | null): void {
  const main = document.querySelector('main');
  if (sections.length === 0 || !main) return;
  const measure = (): Box[] => sections.map((s) => {
    const r = s.getBoundingClientRect();
    return { top: r.top + window.scrollY, height: r.height };
  });
  const sizeNow = (): Size => ({ w: window.innerWidth, h: window.innerHeight });
  let size = sizeNow();
  let place = placeAt(measure(), window.scrollY, window.innerHeight);
  let pending: Place | null = null;
  let until = 0;
  const settling = () => pending !== null && performance.now() < until;

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      // While settling, and between a real resize and its refresh, the place is the one from before: keep it.
      if (settling() || isRealResize(size, sizeNow())) return;
      // A phone's toolbar sliding away is not a resize: take the new height and keep recording.
      size = sizeNow();
      pending = null;
      // Measured on each update, not cached: a late web font changes section heights without any resize.
      place = placeAt(measure(), self.scroll(), window.innerHeight);
    },
  });

  // After a refresh, not in refreshInit: ScrollTrigger puts back the scroll position it saved at the
  // start of a refresh, which would undo a jump made earlier. The jump then updates the scene as any scroll does.
  ScrollTrigger.addEventListener('refresh', () => {
    const now = sizeNow();
    const resized = isRealResize(size, now);
    size = now;
    if (resized && place) { pending = place; until = performance.now() + SETTLE_MS; }
    if (!settling() || !pending) return;
    const y = scrollFor(pending, measure(), window.innerHeight, document.documentElement.scrollHeight - window.innerHeight);
    if (y === null) return;
    if (lenis) {
      // Lenis keeps its own scroll limit; refresh it first, or a jump past the old page end is clamped.
      lenis.resize();
      lenis.scrollTo(y, { immediate: true, force: true });
    } else window.scrollTo(0, y);
  });

  // A refresh measures by scrolling to the top and back, which would stop a swipe in its tracks:
  // when the content changes size mid-scroll, wait for the scroll to end.
  let timer = 0;
  let afterScroll = false;
  ScrollTrigger.addEventListener('scrollEnd', () => {
    if (!afterScroll) return;
    afterScroll = false;
    ScrollTrigger.refresh();
  });
  new ResizeObserver(() => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (ScrollTrigger.isScrolling()) afterScroll = true;
      else ScrollTrigger.refresh();
    }, 120);
  }).observe(main);
}
