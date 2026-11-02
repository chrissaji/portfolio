import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Position on the page: kept for reduced motion too, because it reports where you are rather than decorating. */
export function initRail(): void {
  const fill = document.querySelector<HTMLElement>('.rail__fill');
  if (!fill) return;
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => { fill.style.transform = `scaleY(${self.progress})`; } });
}

export function initSectionNav(): void {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('.nav a[href^="#"]')];
  for (const link of links) {
    const section = document.getElementById(link.hash.slice(1));
    if (!section) continue;
    ScrollTrigger.create({
      trigger: section, start: 'top center', end: 'bottom center',
      onToggle: (self) => {
        if (!self.isActive) return;
        links.forEach((l) => l.removeAttribute('aria-current'));
        link.setAttribute('aria-current', 'location');
      },
    });
  }
}
