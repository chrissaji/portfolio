import 'lenis/dist/lenis.css';
import './styles/index.css';
import moon from '@phosphor-icons/core/assets/regular/moon.svg?raw';
import sun from '@phosphor-icons/core/assets/regular/sun.svg?raw';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { initCopyButtons } from './lib/copy';
import { detectDevice, pickQuality } from './lib/quality';
import { initThemeToggle } from './lib/theme';
import { initMotion } from './motion';
import { initAnchors } from './motion/anchors';
import { playIntro } from './motion/intro';
import { keepPlace } from './motion/place';

gsap.registerPlugin(ScrollTrigger, SplitText);
// A phone's address bar showing or hiding changes only the height: no need to re-measure for that.
ScrollTrigger.config({ ignoreMobileResize: true });

const root = document.documentElement;
const device = detectDevice(window);
const quality = pickQuality(device);
const motionOK = !device.reducedMotion;
root.dataset.motion = quality.mode;
const capture = new URLSearchParams(window.location.search).get('capture');
if (capture === 'field' || capture === 'og') root.dataset.capture = capture;

const toggle = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
if (toggle) {
  // CSS shows the icon of the theme a click switches to; the button needs JavaScript, so it starts hidden.
  toggle.innerHTML = `<span class="icon icon--sun">${sun}</span><span class="icon icon--moon">${moon}</span>`;
  toggle.hidden = false;
  initThemeToggle(toggle);
}
initCopyButtons(navigator.clipboard);

let lenis: Lenis | null = null;
if (motionOK && !capture) {
  lenis = new Lenis();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}
initAnchors(lenis);
keepPlace([...document.querySelectorAll<HTMLElement>('main [data-formation]')], lenis);

// The text's motion starts now; three.js loads after the page's own code, so the text and fonts come first.
initMotion({ motionOK, field: null, capture: capture !== null });
const canvas = document.querySelector<HTMLCanvasElement>('.field canvas');
const field = canvas && quality.mode !== 'static' ? (await import('./scene/mount')).mountField(canvas, quality) : null;
if (field && motionOK && !capture) playIntro(field);
