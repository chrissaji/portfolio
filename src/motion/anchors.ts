import type Lenis from 'lenis';

/** In-page links scroll smoothly when allowed, and always move focus to the section they name. */
export function initAnchors(lenis: Lenis | null): void {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.hash.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      event.preventDefault();
      // Focus first, not when the scroll ends: a Tab pressed during the smooth scroll then starts inside
      // the section, and focus is never pulled back after the visitor has moved on.
      target.focus({ preventScroll: true });
      history.replaceState(null, '', `#${id}`);
      if (lenis) lenis.scrollTo(target);
      else target.scrollIntoView();
    });
  });
}
