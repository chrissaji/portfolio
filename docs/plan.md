# Portfolio site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A one-page portfolio for Chris Thomas Saji: every word in plain HTML, behind it a real-time three.js "embedding space" that re-forms for each project as the visitor scrolls, with rich motion that never costs readability or speed.

**Architecture:** Vite builds a static site from `index.html` (all copy) plus a TypeScript bundle. Pure, unit-tested modules hold the logic: seeded random numbers, the six point formations, the scroll-to-formation timeline, the nearest-neighbour query, quality tiers, the number formatter and the theme. Thin DOM and WebGL modules wire them up: the point field (`three`), smooth scrolling (`lenis`) and scroll-driven motion (`gsap` with ScrollTrigger and SplitText). A pre-deploy check guards the copy, the phone number, links and the JavaScript budget.

**Tech Stack:** Node 22, npm, Vite 8.3.5, TypeScript 7.0.2, three 0.187.0, GSAP 3.15.0, Lenis 1.3.27, Vitest 5.0.5, Python with PyMuPDF (the resume PDF only).

**Phone numbers** in this plan are written as `<phone number>`: the real one is never stored in the repo. The shipped scripts find it by its shape (`scripts/redact-resume.py`, `scripts/check-lib.mjs`), and `npm run check` fails if one appears in any tracked file.

**Spec:** `docs/spec.md` (approved by Chris, 2026-11-02). Read it before any task.

## Global Constraints

- Node 22 (`v22.23.4` on this machine); npm; versions pinned exactly as in Tech Stack (checked on npm 2026-11-02). If TypeScript 7 rejects the config, fall back to the newest TypeScript 6 and note it in the README.
- GSAP is used under its Standard No Charge License (Webflow, 2025-04-30), which covers any website; ScrollTrigger and SplitText ship in the public `gsap` package (checked on gsap.com 2026-11-02).
- Every word on the page is real HTML. The canvas is decoration: `aria-hidden="true"`, never the only carrier of meaning.
- No em dash (U+2014) in anything a visitor reads, including `alt`, `aria-label`, `title` and meta content. An en dash (U+2013) only between digits. Write "Aug 2025 to now", not a dashed range.
- No phone number anywhere served: HTML, JavaScript, CSS or the resume PDF.
- FlowPrep copy names JEE and NEET together. It claims no user counts, results or outcomes, and names no competitor. It describes the whole product (lessons with interactive diagrams, the AI tutor, adaptive practice, revision with the mistake notebook, the weekly report). It never says NEET practice is open (FlowPrep `docs/marketing.md` §3.2, CLAUDE.md §21).
- ClickMomentz: no more detail than the resume. Nothing is read from `C:\D Drive\GitHub\clickmomentz`.
- Budgets: JavaScript at most 250 KB gzipped in total; largest contentful paint at most 2.5 s on a mid-range phone over 4G (Lighthouse mobile simulation); steady 60 fps on a laptop.
- No third-party request at runtime: fonts, images and scripts are all served by the site itself.
- Reduced motion (system setting): no smooth scroll, no morphs, no count-ups, no reveals, a still frame of the cloud. No WebGL, or `?webgl=0`: a static image of the cloud. Phones: 5,000 points, pixel ratio at most 1.5.
- Light and dark themes, following the system, with a toggle remembered in `localStorage` (wrapped in try/catch).
- The scene's colours are hex tokens in CSS (`--field-point`, `--field-accent`) because `THREE.Color` cannot parse `oklch()`. `--field-blend` is `additive` (dark) or `normal` (light).
- Asset paths are relative (`base: './'`), so the same build runs on Cloudflare and as a claude.ai preview.
- No commit without Chris's yes (his global rule). Every "Checkpoint" step below commits only once he has said yes to checkpoint commits in this repo. Until then, stage and move on. No deploy, and no public URL, without his yes.
- On Chris's laptop, one heavy job at a time (a build, Lighthouse, a long test run).
- **The taste skill (`design-taste-frontend`) binds the design** (Chris: "use taste skill aswell"). The design read: a developer portfolio for recruiters and hiring engineers, in a dark-tech kinetic language, built with native CSS, GSAP and three.js. The dials are **VARIANCE 7, MOTION 8, DENSITY 4**: the developer preset (6, 5, 4), raised for "no need to hold back". Its rules, as they apply here:
  - Sans display only: no Inter, no serif. One accent colour, no AI purple, no pure black or white. One radius system.
  - Hero: at most 4 text elements (eyebrow, name, subtext of at most 20 words, CTAs). One primary and one secondary CTA. No tagline under the CTAs, no scroll cue, no locale strip.
  - At most 3 eyebrows on the page, the hero's included. No two project sections share a layout family, and at most 2 image-and-text splits in a row.
  - One label per CTA intent ("Email me", "Download resume", "LinkedIn").
  - Icons from Phosphor (`@phosphor-icons/core` 2.1.1) only, never hand-drawn.
  - Animate only `transform` and `opacity`, and name properties in transitions (never `transition: all`). Every animation has a one-sentence reason.
  - Hero `min-height: 100dvh`. A tactile `:active` press on buttons.
  - Lighthouse before calling it done.

## Review Focus

1. **A keyboard-only or screen-reader visitor uses the nav.** Smooth scrolling must not swallow anchor jumps. Activating "Work" lands on the section and moves focus there, and SplitText leaves headings readable (its default `aria: "auto"`). Test: Task 7, Step 7.
2. **The window is resized or a phone is rotated mid-page.** Stops are re-measured, the canvas re-sized, and the formation on screen still matches the section. Test: Task 7, Step 8.
3. **The GPU drops the WebGL context** (driver reset, too many tabs). The page falls back to the static image instead of freezing on a black or stale canvas. Test: Task 6, Step 9.
4. **Web fonts arrive late.** Lines are split only after `document.fonts.ready` and re-split on resize (`autoSplit`), and layout shift stays under 0.1. Test: Task 9, Step 8, and Task 11, Step 4.
5. **The light theme.** Additive blending on a pale page makes points vanish. Light mode must switch to normal blending with ink-coloured points, and body text must keep at least 4.5:1 contrast. Test: Task 6, Step 10, and Task 2, Step 9.

---

## File map

| File | Responsibility |
| --- | --- |
| `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `.gitignore`, `README.md` | Tooling and commands |
| `index.html` | All copy and page structure |
| `public/theme-init.js` | Applies a stored theme before first paint (classic script, no bundle) |
| `public/img/*`, `public/fonts` (via Fontsource imports), `public/favicon.svg`, `public/apple-touch-icon.png`, `public/og.jpg`, `public/field-dark.jpg`, `public/field-light.jpg`, `public/404.html`, `public/_headers`, `public/Chris_Thomas_Saji_Resume.pdf` | Static assets |
| `src/main.ts` | Boot: theme, device and quality, smooth scroll, field, motion |
| `src/styles/{tokens,base,layout,sections}.css`, `src/styles/index.css` | Design system and layout |
| `src/lib/rng.ts` | Seeded random numbers |
| `src/lib/quality.ts` | Device detection and the quality tier |
| `src/lib/theme.ts` | Theme resolution and the toggle |
| `src/scene/formations.ts` | The six point formations |
| `src/scene/drift.ts` | Idle drift and intro constants shared by CPU and GPU |
| `src/scene/shaders.ts` | GLSL for the points |
| `src/scene/knn.ts` | Nearest points to the pointer, in screen space |
| `src/scene/timeline.ts` | Scroll position to formation blend |
| `src/scene/field.ts` | The three.js scene (`createFieldScene`) |
| `src/scene/mount.ts` | Wires the scene to the page (`mountField`, `readSceneColors`) |
| `src/motion/{format,counters,reveal,tilt,rail,anchors,intro,index}.ts` | Motion layer |
| `scripts/check-lib.mjs`, `scripts/check.mjs`, `scripts/pdf-text.py` | Pre-deploy check |
| `scripts/redact-resume.py` | Phone-free resume |
| `wrangler.jsonc` | Cloudflare static assets (deploy later, on Chris's yes) |

Tests sit beside their code: `src/**/*.test.ts`, `scripts/*.test.mjs`.

Run every command from `C:\D Drive\GitHub\portfolio`.

---

### Task 1: Scaffold and seeded random numbers

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `.gitignore`, `README.md`, `src/lib/rng.ts`, `src/main.ts` (stub), `index.html` (stub)
- Test: `src/lib/rng.test.ts`

**Interfaces:**
- Produces: `type Rng = () => number`, `mulberry32(seed: number): Rng`, `gaussian(rng: Rng): number`

- [ ] **Step 1: Write the tooling files**

`package.json`:
```json
{
  "name": "chris-portfolio",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22" },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "typecheck": "tsc --noEmit",
    "check": "npm run typecheck && npm run test && npm run build && node scripts/check.mjs"
  }
}
```
Then install, pinned exactly:
```bash
npm install --save-exact three@0.187.0 gsap@3.15.0 lenis@1.3.27
npm install --save-exact --save-dev vite@8.3.5 typescript@7.0.2 vitest@5.0.5 @types/three@0.187.0
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client"],
    "strict": true,
    "noEmit": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  },
  "include": ["src", "vite.config.ts", "vitest.config.ts"]
}
```

`vite.config.ts`:
```ts
import { defineConfig, type Plugin } from 'vite';

/** Absolute URLs for link previews exist only once the address is known: SITE_URL=https://… npm run build. */
function siteMeta(): Plugin {
  return {
    name: 'site-meta',
    transformIndexHtml(html) {
      const url = process.env.SITE_URL?.replace(/\/$/, '');
      if (!url) return html;
      const tags = [
        `<link rel="canonical" href="${url}/">`,
        `<meta property="og:url" content="${url}/">`,
        `<meta property="og:image" content="${url}/og.jpg">`,
        `<meta name="twitter:image" content="${url}/og.jpg">`,
      ].join('\n    ');
      return html.replace('</head>', `    ${tags}\n  </head>`);
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [siteMeta()],
  build: { target: 'es2022', assetsInlineLimit: 0 },
});
```

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['src/**/*.test.ts', 'scripts/**/*.test.mjs'], environment: 'node' },
});
```

`.gitignore`:
```
node_modules/
dist/
.wrangler/
*.local
```

`index.html` stub (replaced in Task 2):
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Chris Thomas Saji</title>
    <script type="module" src="/src/main.ts"></script>
  </head>
  <body><h1>Chris Thomas Saji</h1></body>
</html>
```
`src/main.ts` stub: `export {};`

`README.md`: what the site is, where the spec and plan are, and the commands in Windows PowerShell 5.1 form (no `&&`; one command per line): `npm install`, `npm run dev`, `npm test`, `npm run check`.

- [ ] **Step 2: Write the failing test**

`src/lib/rng.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { gaussian, mulberry32 } from './rng';

describe('mulberry32', () => {
  it('gives the same sequence for the same seed', () => {
    const a = mulberry32(42), b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
  it('gives a different sequence for a different seed', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });
  it('stays in [0, 1)', () => {
    const r = mulberry32(7);
    for (let i = 0; i < 10_000; i++) {
      const v = r();
      expect(v >= 0 && v < 1).toBe(true);
    }
  });
});

describe('gaussian', () => {
  it('has mean near 0 and spread near 1', () => {
    const r = mulberry32(3);
    const xs = Array.from({ length: 20_000 }, () => gaussian(r));
    const mean = xs.reduce((s, x) => s + x, 0) / xs.length;
    const sd = Math.sqrt(xs.reduce((s, x) => s + (x - mean) ** 2, 0) / xs.length);
    expect(Math.abs(mean)).toBeLessThan(0.03);
    expect(Math.abs(sd - 1)).toBeLessThan(0.03);
  });
});
```

- [ ] **Step 3: Run it to see it fail**

Run: `npx vitest run src/lib/rng.test.ts`
Expected: FAIL, cannot resolve `./rng`.

- [ ] **Step 4: Implement**

`src/lib/rng.ts`:
```ts
/** A seeded random-number source: the same seed draws the same formations on every visit. */
export type Rng = () => number;

/** mulberry32: small, fast, and good enough for placing points. Returns values in [0, 1). */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A standard normal draw (Box-Muller). */
export function gaussian(rng: Rng): number {
  let u = 0;
  while (u === 0) u = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
}
```

- [ ] **Step 5: Run the tests, the type check and the build**

Run: `npx vitest run src/lib/rng.test.ts`, then `npm run typecheck`, then `npm run build`
Expected: 4 tests pass; no type errors; `dist/index.html` exists with relative `./assets/` paths.

- [ ] **Step 6: Checkpoint** (commit only with Chris's yes)

```bash
git add -A
git commit -m "Scaffold: Vite, TypeScript, Vitest; seeded random numbers"
```

---

### Task 2: The page: copy, design system, layout, themes

This task is specified by structure, exact copy and acceptance checks rather than finished CSS. The visual design is decided and refined in the browser with the design skill, and CSS written in advance would only be rewritten.

**Files:**
- Create: `index.html` (replaces stub), `src/styles/tokens.css`, `src/styles/base.css`, `src/styles/layout.css`, `src/styles/sections.css`, `src/styles/index.css`, `public/theme-init.js`, `src/lib/theme.ts`, `docs/design.md`, `public/img/*`
- Modify: `src/main.ts`
- Test: `src/lib/theme.test.ts`

**Interfaces:**
- Produces (the contract the JavaScript tasks rely on):
  - `.field > canvas` (fixed, full viewport, behind content); `html[data-motion="static"] .field` shows the still image instead of the canvas
  - Sections carry `id`, `tabindex="-1"`, `data-formation` (a `FormationId`) and `data-dim` (0 to 1)
  - `.rail > .rail__fill` (progress rail; JS sets `transform: scaleY(p)`)
  - `.nav a[href^="#"]` (JS sets `aria-current="location"`)
  - `[data-reveal="lines"]`, `[data-reveal="fade"]`, `[data-tilt]`, `[data-count]` with `data-prefix`, `data-suffix`, `data-decimals`
  - `[data-theme-toggle]` button (starts `hidden`; `main.ts` inserts the Phosphor sun and moon icons and un-hides it, since it does nothing without JavaScript)
  - CSS custom properties `--field-point`, `--field-accent` (hex), `--field-blend` (`additive` | `normal`), defined for both themes
  - `html[data-capture="field"]` hides everything but the canvas; `html[data-capture="og"]` hides everything but the hero's eyebrow and name
  - `.sr-only`
- Produces (TS): `type Theme = 'light' | 'dark'`, `currentTheme(attr: string | undefined, systemDark: boolean): Theme`, `nextTheme(attr: string | undefined, systemDark: boolean): Theme`, `initThemeToggle(button: HTMLButtonElement): void`

- [ ] **Step 1: Run the taste skill and record the decisions**

Invoke `design-taste-frontend` (Skill tool). Using it and the spec's §3 ("embedding space", dark as the showcase, light as paper and ink), write `docs/design.md` with these:

- **The design read and the dials**, copied from Global Constraints.
- **Type.** Geist Variable for display and text, and Geist Mono Variable for numbers, stats and tags (`@fontsource-variable/geist` and `@fontsource-variable/geist-mono` 5.3.0, self-hosted by Vite). Change the pairing only for a sans display on Fontsource that suits the brief better, and say why.
- **Palettes.** Dark and light, as tokens on off-black and off-white neutrals (no `#000`, no `#fff`), with one accent that is not purple and is used identically everywhere. Give the hex values for `--field-point` and `--field-accent` in each theme.
- **Scales.** The type scale, the spacing scale, one radius system, the z-index scale (field, content, header, skip link), and the motion easing and duration tokens.
- **Each section's layout family, at 375 px and 1440 px.** No two projects alike:
  - **FlowPrep:** an asymmetric split, with the text at 5 columns and the screenshot at 7.
  - **ProofML:** a wide screenshot band first, with the text stacked below it in two columns (summary, then points).
  - **ClickMomentz:** no screenshot, because the photo-grid formation is the image. A narrow text column on a scrim at one edge, and the stats as large mono numbers.
  - **Thesis:** number-led. "338×" set huge as the anchor, with the text beside it and the road network behind.
  - **Experience and education:** a timeline.
  - **Skills:** a grouped grid of the eight groups (not a long list).
  - **Contact:** large and spare over the single point.

  Every multi-column layout collapses to one column below 768 px.

Install the fonts and the icons:
```bash
npm install --save-exact @fontsource-variable/geist@5.3.0 @fontsource-variable/geist-mono@5.3.0 @phosphor-icons/core@2.1.1
```

- [ ] **Step 2: Check the facts the copy states**

In `C:\D Drive\GitHub\FlowPrep`, confirm "99 chapters" and "300+ interactive diagrams" from `content/`: a chapter is a lesson directory, and an interactive diagram is a `.fpi` file per `docs/interactive-spec/fpi-1.md`. Confirm "about 15,000 automated tests" from the dated baselines in `docs/COMMANDS.md`, Tests. Use the verified numbers in Step 4. If a number is lower than the resume says, use the true one and tell Chris.

Look at `C:\D Drive\GitHub\streamforge-site\public\img\{flowprep,proofml}-{800,1600}.webp`: copy them to `public/img/`, note their pixel sizes for `width`/`height`, and write alt text that says what each screenshot actually shows.

- [ ] **Step 3: Write the failing theme test**

`src/lib/theme.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { currentTheme, nextTheme } from './theme';

describe('currentTheme', () => {
  it('uses a stored choice first', () => {
    expect(currentTheme('light', true)).toBe('light');
    expect(currentTheme('dark', false)).toBe('dark');
  });
  it('falls back to the system setting', () => {
    expect(currentTheme(undefined, true)).toBe('dark');
    expect(currentTheme(undefined, false)).toBe('light');
  });
  it('ignores a value that is not a theme', () => {
    expect(currentTheme('sepia', true)).toBe('dark');
  });
});

describe('nextTheme', () => {
  it('flips the theme the visitor sees', () => {
    expect(nextTheme(undefined, true)).toBe('light');
    expect(nextTheme('light', true)).toBe('dark');
  });
});
```
Run: `npx vitest run src/lib/theme.test.ts`. Expected: FAIL, cannot resolve `./theme`.

- [ ] **Step 4: Implement the theme module and the init script**

`src/lib/theme.ts`:
```ts
export type Theme = 'light' | 'dark';

export function currentTheme(attr: string | undefined, systemDark: boolean): Theme {
  if (attr === 'light' || attr === 'dark') return attr;
  return systemDark ? 'dark' : 'light';
}

export function nextTheme(attr: string | undefined, systemDark: boolean): Theme {
  return currentTheme(attr, systemDark) === 'dark' ? 'light' : 'dark';
}

export function initThemeToggle(button: HTMLButtonElement): void {
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const label = () => {
    button.setAttribute('aria-label', `Switch to ${nextTheme(root.dataset.theme, system.matches)} theme`);
  };
  button.addEventListener('click', () => {
    const next = nextTheme(root.dataset.theme, system.matches);
    root.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      // Storage blocked (private window): the choice lasts for this visit only.
    }
    label();
  });
  system.addEventListener('change', label);
  label();
}
```

`public/theme-init.js` (runs before first paint; plain script so the CSP can allow it as `'self'`):
```js
try {
  var t = localStorage.getItem('theme');
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
} catch (e) {}
```
Run: `npx vitest run src/lib/theme.test.ts`. Expected: 4 tests pass.

- [ ] **Step 5: Write `index.html` with the final copy**

Use this structure and copy exactly. The design pass may add wrapper elements and classes, but not change the words without Chris's say. Fill `width`, `height` and `alt` from Step 2.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Chris Thomas Saji · AI / Software Engineer</title>
    <meta name="description" content="AI and software engineer in Kochi, building computer vision that runs in production, backend services that scale, and products on large language models.">
    <meta name="color-scheme" content="dark light">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Chris Thomas Saji · AI / Software Engineer">
    <meta property="og:description" content="Computer vision in production, backend services that scale, and products on large language models.">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="icon" href="./favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="./apple-touch-icon.png">
    <script src="./theme-init.js"></script>
    <script type="module" src="/src/main.ts"></script>
  </head>
  <body>
    <a class="skip" href="#work">Skip to work</a>
    <div class="field" aria-hidden="true"><canvas></canvas></div>
    <div class="rail" aria-hidden="true"><span class="rail__fill"></span></div>

    <header class="site-header">
      <a class="mark" href="#top" aria-label="Chris Thomas Saji, back to top">CTS</a>
      <nav class="nav" aria-label="Sections">
        <a href="#work">Work</a>
        <a href="#experience">Experience</a>
        <a href="#skills">Skills</a>
        <a href="#contact">Contact</a>
      </nav>
      <a class="icon-link" href="https://www.linkedin.com/in/chris-thomas-saji" rel="noopener" aria-label="LinkedIn"><!-- paste node_modules/@phosphor-icons/core/assets/regular/linkedin-logo.svg here, with aria-hidden="true" --></a>
      <button class="theme-toggle" type="button" data-theme-toggle aria-label="Switch theme" hidden></button>
    </header>

    <main id="main">
      <section id="top" class="hero" data-formation="clusters" data-dim="0" tabindex="-1" aria-labelledby="hero-name">
        <p class="hero__eyebrow">AI / Software Engineer</p>
        <h1 id="hero-name" class="hero__name">Chris Thomas Saji</h1>
        <p class="hero__lede">I build computer vision that runs in production, backend services that scale, and products on large language models.</p>
        <div class="hero__actions">
          <a class="button button--primary" href="mailto:chris.saji001@gmail.com">Email me</a>
          <a class="button" href="./Chris_Thomas_Saji_Resume.pdf" download>Download resume</a>
        </div>
      </section>

      <section id="work" class="work" tabindex="-1" aria-labelledby="work-title">
        <h2 id="work-title" class="section-title" data-reveal="lines">Selected work</h2>

        <article id="flowprep" class="project" data-formation="constellation" data-dim="0.15" tabindex="-1" aria-labelledby="flowprep-title">
          <h3 id="flowprep-title" class="project__title">FlowPrep</h3>
          <p class="project__meta">An AI tutor for JEE and NEET. Co-lead of a team of two.</p>
          <p class="project__summary" data-reveal="lines">Short lessons with interactive diagrams, an AI tutor inside the lessons and practice, adaptive practice, revision with a mistake notebook, and a weekly progress report.</p>
          <figure class="project__shot" data-tilt data-reveal="fade">
            <img src="./img/flowprep-800.webp" srcset="./img/flowprep-800.webp 800w, ./img/flowprep-1600.webp 1600w" sizes="(min-width: 960px) 46vw, 92vw" width="W" height="H" alt="ALT FROM STEP 2" loading="lazy" decoding="async">
          </figure>
          <dl class="stats">
            <div><dt>Chapters</dt><dd><span data-count="99" aria-hidden="true">99</span><span class="sr-only">99</span></dd></div>
            <div><dt>Interactive diagrams</dt><dd><span data-count="300" data-suffix="+" aria-hidden="true">300+</span><span class="sr-only">300+</span></dd></div>
            <div><dt>Automated tests</dt><dd><span data-count="15000" data-prefix="~" aria-hidden="true">~15,000</span><span class="sr-only">about 15,000</span></dd></div>
          </dl>
          <ul class="project__points">
            <li>I co-lead a team of two and own the platform, the product screens and payments: dashboard, reports, settings, onboarding with parental consent for minors, Razorpay billing, the installable web app and the CI pipelines.</li>
            <li>Built entirely with Claude Code: parallel agent sessions in git worktrees, custom skills, hooks and subagent workflows, steered by architecture docs and project rules, and gated by about 15,000 automated tests.</li>
            <li>An AI gateway with Claude first and OpenAI as the fallback, a LangGraph tutor that keeps its checkpoints in Postgres, and background jobs that keep model calls off the request path.</li>
          </ul>
          <ul class="tags" aria-label="Stack"><li>Next.js 16</li><li>TypeScript</li><li>PostgreSQL (Supabase)</li><li>Drizzle</li><li>Inngest</li><li>LangGraph</li><li>Claude and OpenAI APIs</li></ul>
          <p class="project__link"><a href="https://flowprep.in" rel="noopener">flowprep.in</a> <span>Pre-launch, with a private beta sign-up.</span></p>
        </article>

        <article id="proofml" class="project" data-formation="page" data-dim="0.15" tabindex="-1" aria-labelledby="proofml-title">
          <h3 id="proofml-title" class="project__title">ProofML</h3>
          <p class="project__meta">AI proofreading for Malayalam publishers. I led the frontend and the cloud platform.</p>
          <p class="project__summary" data-reveal="lines">A live proofreading platform for Malayalam print publishers, with English and Hindi too. Editors upload a PDF or Word file, review the errors the AI flags, fix them in the browser and download the corrected file. A leading educational publisher uses it, along with individual writers.</p>
          <figure class="project__shot" data-tilt data-reveal="fade">
            <img src="./img/proofml-800.webp" srcset="./img/proofml-800.webp 800w, ./img/proofml-1600.webp 1600w" sizes="(min-width: 960px) 46vw, 92vw" width="W" height="H" alt="ALT FROM STEP 2" loading="lazy" decoding="async">
          </figure>
          <dl class="stats">
            <div><dt>Recall on the evaluation set</dt><dd><span data-count="100" data-suffix="%" aria-hidden="true">100%</span><span class="sr-only">100%</span></dd></div>
            <div><dt>Languages</dt><dd><span data-count="3" aria-hidden="true">3</span><span class="sr-only">3</span></dd></div>
            <div><dt>AI providers with failover</dt><dd><span data-count="3" aria-hidden="true">3</span><span class="sr-only">3</span></dd></div>
          </dl>
          <ul class="project__points">
            <li>Two-track detection: rule-based morphology and spell checking, plus an LLM scan that fails over across Gemini, OpenAI and Claude. It holds 100% recall on a curated evaluation set.</li>
            <li>Decodes legacy non-Unicode Malayalam fonts into Unicode, then writes each correction back into the PDF in the publication's own embedded font. Every fix can be undone.</li>
            <li>Multi-tenant SaaS with Clerk sign-in, organisation isolation, metered monthly plans and a per-call LLM cost ledger. The cloud runs on Terraform for GCP and GitHub Actions, with Docker Compose behind a Cloudflare Tunnel.</li>
          </ul>
          <ul class="tags" aria-label="Stack"><li>Python</li><li>FastAPI</li><li>Celery</li><li>PostgreSQL</li><li>Redis</li><li>React</li><li>PyMuPDF</li><li>Docker</li></ul>
          <p class="project__link"><a href="https://proofml.streamforge.co.in" rel="noopener">proofml.streamforge.co.in</a></p>
        </article>

        <article id="clickmomentz" class="project" data-formation="photoGrid" data-dim="0.15" tabindex="-1" aria-labelledby="clickmomentz-title">
          <h3 id="clickmomentz-title" class="project__title">ClickMomentz</h3>
          <p class="project__meta">A live AI photo platform for large events, at Mastermine Technologies.</p>
          <p class="project__summary" data-reveal="lines">Guests at a large event take one selfie and find every photo they appear in. In a team of six engineers, I build the face-recognition pipeline and the engine that culls thousands of shots down to the best ones.</p>
          <dl class="stats">
            <div><dt>Matching accuracy from one selfie</dt><dd><span data-count="95" data-prefix="~" data-suffix="%" aria-hidden="true">~95%</span><span class="sr-only">about 95%</span></dd></div>
            <div><dt>Photos per event</dt><dd><span data-count="10000" data-prefix="up to " aria-hidden="true">up to 10,000</span><span class="sr-only">up to 10,000</span></dd></div>
            <div><dt>To index a typical event</dt><dd><span aria-hidden="true">&lt; 1 hour</span><span class="sr-only">under an hour</span></dd></div>
          </dl>
          <ul class="project__points">
            <li>Face recognition with InsightFace: SCRFD detection and 512-number ArcFace embeddings on ONNX Runtime, searched by cosine similarity in FAISS. About 95% matching accuracy from a single selfie, with near-instant search.</li>
            <li>A multi-stage culling engine that scores blur, exposure, open eyes, pose and aesthetics, uses CLIP for scene understanding, clusters faces with ArcFace and HDBSCAN, and catches bursts and duplicates. Photographers choose how many to keep and get back a ranked set, saving hours per event.</li>
            <li>Four Spring Boot 3.5 and Java 21 microservices on a DCI and CQRS design, and 8+ RabbitMQ queues for resumable async work across parallel workers. Multi-tenant security with JWT and OAuth2, a subscription service, and S3 and GCS storage with presigned URLs. I also contribute to the Electron and React desktop app that bundles the Python AI worker for offline processing.</li>
          </ul>
          <ul class="tags" aria-label="Stack"><li>InsightFace</li><li>ONNX Runtime</li><li>FAISS</li><li>CLIP</li><li>HDBSCAN</li><li>Spring Boot</li><li>RabbitMQ</li><li>PostgreSQL</li><li>Electron</li></ul>
        </article>

        <article id="thesis" class="project" data-formation="roadNetwork" data-dim="0.15" tabindex="-1" aria-labelledby="thesis-title">
          <h3 id="thesis-title" class="project__title">Vehicle re-identification across cameras</h3>
          <p class="project__meta">My M.Tech thesis, with a paper accepted at IJITCS.</p>
          <p class="project__summary" data-reveal="lines">Finding the same vehicle across a city's cameras usually means comparing it with every candidate. I added a physics-aware Temporal Consistency Module to the TransReID transformer. It uses the camera network's layout and realistic travel times to rule out matches that could not physically happen, before any visual comparison.</p>
          <dl class="stats">
            <div><dt>Faster search</dt><dd><span data-count="338" data-suffix="×" aria-hidden="true">338×</span><span class="sr-only">338 times</span></dd></div>
            <div><dt>Impossible pairs removed</dt><dd><span data-count="99.7" data-decimals="1" data-suffix="%" aria-hidden="true">99.7%</span><span class="sr-only">99.7%</span></dd></div>
            <div><dt>Retraining needed</dt><dd><span aria-hidden="true">None</span><span class="sr-only">none</span></dd></div>
          </dl>
          <ul class="project__points">
            <li>On VeRi-776 it removes 99.7% of impossible candidate pairs (373 of 126,063 survive), so search runs 338 times faster, with no retraining.</li>
            <li>Accuracy holds: mAP rises from 82.1% to 82.5%, and Rank-1 stays at 97.4%.</li>
            <li>Paper: "Physics-Aware Rule-Based Temporal Filtering for Scalable Vehicle Re-Identification", with Jithin Mathews. Accepted at IJITCS (MECS Press).</li>
          </ul>
          <ul class="tags" aria-label="Stack"><li>Python</li><li>PyTorch</li><li>TransReID</li></ul>
        </article>
      </section>

      <section id="experience" class="about" data-formation="clusters" data-dim="0.65" tabindex="-1" aria-labelledby="experience-title">
        <h2 id="experience-title" class="section-title" data-reveal="lines">Experience</h2>
        <ol class="timeline">
          <li data-reveal="fade">
            <p class="timeline__when">Aug 2025 to now</p>
            <h3>AI/Software Engineer, Mastermine Technologies</h3>
            <p class="timeline__where">Kochi, Kerala</p>
            <p>Face recognition, AI photo culling and the microservices behind ClickMomentz, a live AI photo platform for large events.</p>
          </li>
          <li data-reveal="fade">
            <p class="timeline__when">Aug 2023 to Feb 2024</p>
            <h3>DevOps Intern, OpenText</h3>
            <p class="timeline__where">Bengaluru</p>
            <p>Manual and Selenium-automated testing: built and maintained test cases and automation frameworks, and worked with developers to fix issues.</p>
          </li>
        </ol>
      </section>

      <section id="skills" class="about" data-formation="clusters" data-dim="0.65" tabindex="-1" aria-labelledby="skills-title">
        <h2 id="skills-title" class="section-title" data-reveal="lines">Skills</h2>
        <dl class="skills">
          <div data-reveal="fade"><dt>Languages</dt><dd>Python, Java, C++, SQL, TypeScript</dd></div>
          <div data-reveal="fade"><dt>Generative AI</dt><dd>LLM apps and AI agents (Claude, OpenAI and Gemini APIs, LangGraph), structured outputs, multi-model failover, evals, LLM cost tracking</dd></div>
          <div data-reveal="fade"><dt>Claude Code</dt><dd>Agentic development with subagents, custom skills, hooks, MCP servers and parallel sessions in git worktrees, gated by automated tests</dd></div>
          <div data-reveal="fade"><dt>AI and ML</dt><dd>Computer vision, NLP, deep learning, InsightFace (SCRFD, ArcFace), FAISS, CLIP, ONNX Runtime, PyTorch, TensorFlow, OpenCV</dd></div>
          <div data-reveal="fade"><dt>Backend</dt><dd>Spring Boot, Spring Cloud Gateway, FastAPI, Celery, microservices (CQRS, DCI), RabbitMQ, PostgreSQL, Redis, REST, JWT, OAuth2</dd></div>
          <div data-reveal="fade"><dt>Frontend and desktop</dt><dd>Next.js, React, Electron, Redux, Vite</dd></div>
          <div data-reveal="fade"><dt>Cloud and DevOps</dt><dd>Docker, GitHub Actions, Terraform (GCP), Cloudflare Tunnel, Sentry</dd></div>
          <div data-reveal="fade"><dt>Tools</dt><dd>Git, GitHub, Maven, VS Code, Jupyter, Google Colab</dd></div>
        </dl>
      </section>

      <section id="education" class="about" data-formation="clusters" data-dim="0.65" tabindex="-1" aria-labelledby="education-title">
        <h2 id="education-title" class="section-title" data-reveal="lines">Education</h2>
        <ol class="timeline">
          <li data-reveal="fade">
            <p class="timeline__when">May 2026</p>
            <h3>M.Tech in Artificial Intelligence and Machine Learning</h3>
            <p class="timeline__where">Rajagiri School of Engineering and Technology, Kochi · CGPA 8.41</p>
          </li>
          <li data-reveal="fade">
            <p class="timeline__when">June 2023</p>
            <h3>B.Tech in Computer Science and Technology (AI specialisation)</h3>
            <p class="timeline__where">Jain University, Bengaluru (NIRF rank 65) · CGPA 8.02</p>
          </li>
        </ol>
      </section>

      <section id="contact" class="contact" data-formation="singularity" data-dim="0" tabindex="-1" aria-labelledby="contact-title">
        <h2 id="contact-title" class="section-title" data-reveal="lines">Contact</h2>
        <p class="contact__lede">Email is the quickest way to reach me. I'm based in Kochi, Kerala.</p>
        <p class="contact__address">chris.saji001@gmail.com</p>
        <div class="contact__actions">
          <a class="button button--primary" href="mailto:chris.saji001@gmail.com">Email me</a>
          <a class="button" href="./Chris_Thomas_Saji_Resume.pdf" download>Download resume</a>
          <a class="button" href="https://www.linkedin.com/in/chris-thomas-saji" rel="noopener">LinkedIn</a>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <p>© 2026 Chris Thomas Saji. Built with three.js, GSAP and Claude Code.</p>
    </footer>
  </body>
</html>
```

Then run `no-ai-slop` (Skill tool) over the visible copy in detect mode. Raise any wording it would change with Chris rather than changing it silently.

- [ ] **Step 6: Write the CSS from `docs/design.md`**

- `tokens.css`: both themes. The dark defaults sit under `@media (prefers-color-scheme: dark)` and `:root[data-theme="dark"]`, the light ones under `@media (prefers-color-scheme: light)` and `:root[data-theme="light"]`. Each defines `--field-point`, `--field-accent` (hex) and `--field-blend`.
- `base.css`: font imports (`@import '@fontsource-variable/…'`), reset, body background and colour, `:focus-visible`, `.sr-only`, `.skip`, and `prefers-reduced-motion` turning off CSS transitions.
- `layout.css`:
  - `.field` fixed with `inset: 0`, at the bottom of the z-index scale
  - `html[data-motion="static"] .field` as a background image of `./field-dark.jpg` or `./field-light.jpg` by theme, with a radial-gradient fallback until Task 10 adds them
  - the header: one line, at most 72 px tall
  - the rail
  - section sizes: the hero `min-height: 100dvh` with top padding at most 6rem, and each `.project` `min-height: 100svh`
  - the two `data-capture` modes
- `sections.css`:
  - the hero, the four project layouts from `docs/design.md`, the stats (mono), tags, timeline, the skills grid, contact and footer
  - buttons get a tactile `:active` press (`transform: translateY(1px)`)
  - transitions name their properties, never `all`

Text that sits over the scene gets a panel or scrim so it stays at 4.5:1 or better. `src/styles/index.css` imports the four files in order.

`src/main.ts`:
```ts
import './styles/index.css';
import moon from '@phosphor-icons/core/assets/regular/moon.svg?raw';
import sun from '@phosphor-icons/core/assets/regular/sun.svg?raw';
import { initThemeToggle } from './lib/theme';

const toggle = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
if (toggle) {
  // CSS shows the icon of the theme a click switches to; the button needs JavaScript, so it starts hidden.
  toggle.innerHTML = `<span class="icon icon--sun">${sun}</span><span class="icon icon--moon">${moon}</span>`;
  toggle.hidden = false;
  initThemeToggle(toggle);
}
```

- [ ] **Step 7: Look at it with JavaScript off, then on**

Start `npm run dev` in a terminal tab whose working directory is this repo, then open `http://localhost:5173` in the browser pane. Check, at 375 px and 1440 px and in both themes:
- every section and every word is present and readable
- no horizontal scroll at 375 px
- focus rings are visible when tabbing
- the skip link works

Then turn JavaScript off (Playwright `browser_run_code_unsafe` is not needed: load the built `dist/index.html` with scripts blocked, or read the HTML). The copy must not depend on the module running.

- [ ] **Step 8: Run the taste skill's Final Pre-Flight Check** (its §14) box by box. Fix every failing box, and record each box's result in `docs/design.md`.

These boxes are mechanical here, so check them by counting:
- eyebrows: at most 3
- the hero: 4 text elements, a lede of at most 20 words, 2 CTAs
- one label per CTA intent
- no two project layouts alike
- no em or en dash

- [ ] **Step 9: Contrast check (Review Focus 5, text half)**

In the browser pane, run in each theme:
```js
(() => {
  const lum = (c) => { const [r, g, b] = c.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const bg = (el) => { for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (!/rgba\(.*, 0\)$/.test(c) && c !== 'transparent') return c; } return getComputedStyle(document.body).backgroundColor; };
  return [...document.querySelectorAll('p, li, dd, dt, a, h1, h2, h3')].map((el) => ({ text: el.textContent.trim().slice(0, 40), r: ratio(getComputedStyle(el).color, bg(el)) })).filter((x) => x.r < 4.5);
})()
```
Expected: an empty list. This reads the panel colour under the text, so text that sits directly on the canvas must have a panel or scrim.

- [ ] **Step 10: Checkpoint** (commit only with Chris's yes): `git add -A` then `git commit -m "Page: copy, design system, layout, themes"`

---

### Task 3: The resume PDF without the phone number

**Files:**
- Create: `scripts/redact-resume.py`, `public/Chris_Thomas_Saji_Resume.pdf`

**Interfaces:**
- Produces: `public/Chris_Thomas_Saji_Resume.pdf` (the download), the same resume with the contact line re-set as `chris.saji001@gmail.com | www.linkedin.com/in/chris-thomas-saji`, centred, with both links still clickable

Facts measured on 2026-11-02: the contact line is centred on a 612 pt page, set in the embedded Type 1 font `CharterBT-Roman` at 8.97 pt, and the email and LinkedIn are link annotations over the text.

- [ ] **Step 1: Write the script**

`scripts/redact-resume.py`:
```python
"""Write the resume without the phone number.

    python -I scripts/redact-resume.py "<source.pdf>" public/Chris_Thomas_Saji_Resume.pdf

The contact line is removed with true redaction (its text is deleted from the
file, not covered) and set again, centred, without the phone, in the resume's
own embedded font. The email and LinkedIn links are moved onto the new text.
Stops with a message, writing nothing, if any step cannot be done faithfully.
"""
import sys

import fitz  # PyMuPDF

PHONE = "<phone number>"


def contact_line(page):
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            if PHONE in "".join(span["text"] for span in line["spans"]):
                return line
    sys.exit("No line with the phone number on page 1: nothing to do.")


def main(src, dst):
    doc = fitz.open(src)
    page = doc[0]
    line = contact_line(page)
    spans = line["spans"]
    first_kept = next(i for i, s in enumerate(spans) if "@" in s["text"])
    kept = spans[first_kept:]
    text = "".join(s["text"] for s in kept)
    size, color = kept[0]["size"], fitz.sRGB_to_pdf(kept[0]["color"])
    baseline = kept[0]["origin"][1]

    font_name = kept[0]["font"]
    xref = next(f[0] for f in page.get_fonts() if f[3].split("+")[-1] == font_name)
    _, _, _, buffer = doc.extract_font(xref)
    font = fitz.Font(fontbuffer=buffer)
    missing = sorted({c for c in text if not font.has_glyph(ord(c))})
    if missing:
        sys.exit(f"The embedded font lacks {missing!r}. Export a phone-free PDF from the resume source instead.")

    old_links = [l for l in page.get_links() if l.get("uri")]

    page.add_redact_annot(fitz.Rect(line["bbox"]))
    page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)

    width = font.text_length(text, fontsize=size)
    x0 = (page.rect.width - width) / 2
    page.insert_font(fontname="charter", fontbuffer=buffer)
    page.insert_text((x0, baseline), text, fontname="charter", fontsize=size, color=color)

    for link in page.get_links():
        page.delete_link(link)
    for link in old_links:
        label = link["uri"].replace("mailto:", "").replace("https://", "")
        start = text.find(label)
        if start < 0:
            sys.exit(f"Could not place the link for {link['uri']}.")
        left = x0 + font.text_length(text[:start], fontsize=size)
        right = left + font.text_length(label, fontsize=size)
        rect = fitz.Rect(left, link["from"].y0, right, link["from"].y1)
        page.insert_link({"kind": fitz.LINK_URI, "from": rect, "uri": link["uri"]})

    for p in doc:
        if "<phone number>" in p.get_text().replace(" ", ""):
            sys.exit("The phone number is still in the text: not writing the file.")
    for value in (doc.metadata or {}).values():
        if value and "<phone number>" in value.replace(" ", ""):
            sys.exit("The phone number is in the PDF metadata: not writing the file.")

    doc.save(dst, garbage=4, deflate=True)
    print(f"Wrote {dst}: contact line re-set at x={x0:.1f}, width {width:.1f} pt.")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
```

- [ ] **Step 2: Run it**

```bash
python -I scripts/redact-resume.py "<the original resume PDF>" public/Chris_Thomas_Saji_Resume.pdf
```
Expected: "Wrote public/Chris_Thomas_Saji_Resume.pdf …". If it stops on the font, ask Chris for a phone-free export from the resume's source, and do not ship the original.

- [ ] **Step 3: Verify what a reader and a parser see**

```bash
python -I -c "import fitz,sys; d=fitz.open(sys.argv[1]); t='\n'.join(p.get_text() for p in d); print('phone' if '<phone number>' in t.replace(' ','') else 'no phone'); print([l.get('uri') for l in d[0].get_links()]); print(t[:200])" public/Chris_Thomas_Saji_Resume.pdf
```
Expected: `no phone`; both links listed; the text starts with the name, then the email and LinkedIn line, then the summary. Both pages still extract in full, which is what applicant-tracking systems read.

Render the header to look at it:
```bash
python -I -c "import fitz,sys; p=fitz.open(sys.argv[1])[0]; p.get_pixmap(dpi=200, clip=fitz.Rect(0,30,612,110)).save(sys.argv[2])" public/Chris_Thomas_Saji_Resume.pdf "C:/Users/chris/AppData/Local/Temp/claude/C--D-Drive-GitHub-FlowPrep/6aa7f70f-863d-41d4-aff7-e7462e070a64/scratchpad/resume-header.png"
```
Open the PNG with the Read tool. Expected: the line matches the original's font, size and colour, and is centred under the name.

- [ ] **Step 4: Checkpoint** (commit only with Chris's yes): `git add scripts/redact-resume.py public/Chris_Thomas_Saji_Resume.pdf` then `git commit -m "Resume download without the phone number"`

---

### Task 4: The pre-deploy check

**Files:**
- Create: `scripts/check-lib.mjs`, `scripts/check.mjs`, `scripts/pdf-text.py`
- Test: `scripts/check-lib.test.mjs`

**Interfaces:**
- Produces: `userText(html: string): string`, `dashProblems(text: string): string[]`, `phoneProblems(text: string): string[]`, `localRefs(html: string): string[]`, `jsGzipBytes(dir: string): number`, `JS_BUDGET_BYTES = 256000`, `RESUME_FILE = 'Chris_Thomas_Saji_Resume.pdf'`

- [ ] **Step 1: Write the failing tests**

`scripts/check-lib.test.mjs`:
```js
import { describe, expect, it } from 'vitest';
import { dashProblems, localRefs, phoneProblems, userText } from './check-lib.mjs';

describe('userText', () => {
  it('keeps visible text and visitor-facing attributes, and drops scripts and styles', () => {
    const t = userText('<style>p{}</style><p>Hi <b>there</b></p><img alt="A photo"><script>const x = "\u2014";</script>');
    expect(t).toContain('Hi');
    expect(t).toContain('there');
    expect(t).toContain('A photo');
    expect(t).not.toContain('\u2014');
  });
  it('decodes dash entities', () => {
    expect(userText('<p>a &mdash; b &#8211; c</p>')).toContain('\u2014');
    expect(userText('<p>a &mdash; b &#8211; c</p>')).toContain('\u2013');
  });
  it('reads meta content and aria-labels', () => {
    expect(userText('<meta name="description" content="Fast \u2014 sites"><a aria-label="Back \u2014 top">x</a>')).toMatch(/Fast \u2014 sites[\s\S]*Back \u2014 top/);
  });
});

describe('dashProblems', () => {
  it('flags every em dash', () => {
    expect(dashProblems('one \u2014 two \u2014 three')).toHaveLength(2);
  });
  it('allows an en dash between digits', () => {
    expect(dashProblems('2,000\u201310,000 photos')).toEqual([]);
  });
  it('flags an en dash anywhere else', () => {
    expect(dashProblems('Aug 2025 \u2013 now')).toHaveLength(1);
  });
});

describe('phoneProblems', () => {
  it('finds the resume number however it is spaced', () => {
    expect(phoneProblems('call <phone number> today')).not.toEqual([]);
  });
  it('finds any Indian mobile number', () => {
    expect(phoneProblems('ring <phone number>')).not.toEqual([]);
  });
  it('ignores the figures on the page', () => {
    expect(phoneProblems('373 of 126,063 pairs, 338x faster, 2,000 to 10,000 photos, CGPA 8.41')).toEqual([]);
  });
});

describe('localRefs', () => {
  it('lists local src, href and srcset targets once each, skipping web, mail and in-page links', () => {
    const html = '<link href="./assets/a.css"><a href="#work">w</a><a href="mailto:x@y.z">m</a><a href="https://flowprep.in">f</a>'
      + '<img src="./img/p-800.webp" srcset="./img/p-800.webp 800w, ./img/p-1600.webp 1600w">'
      + '<meta property="og:image" content="https://site/og.jpg">';
    expect(localRefs(html).sort()).toEqual(['./assets/a.css', './img/p-1600.webp', './img/p-800.webp']);
  });
});
```
Run: `npx vitest run scripts/check-lib.test.mjs`. Expected: FAIL, cannot resolve `./check-lib.mjs`.

- [ ] **Step 2: Implement the library**

`scripts/check-lib.mjs`:
```js
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

export const JS_BUDGET_BYTES = 250 * 1024;
export const RESUME_FILE = 'Chris_Thomas_Saji_Resume.pdf';
const PHONE_DIGITS = '<phone number>';
const VISIBLE_ATTRS = /\b(?:alt|title|aria-label|placeholder|content)="([^"]*)"/g;

/** Everything a visitor can read: text nodes plus the attributes browsers and link previews show. */
export function userText(html) {
  const attrs = [...html.matchAll(VISIBLE_ATTRS)].map((m) => m[1]);
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  return [body, ...attrs].join('\n')
    .replace(/&mdash;|&#8212;|&#x2014;/gi, '\u2014')
    .replace(/&ndash;|&#8211;|&#x2013;/gi, '\u2013');
}

function around(text, at) {
  return text.slice(Math.max(0, at - 30), at + 30).replace(/\s+/g, ' ');
}

export function dashProblems(text) {
  const out = [];
  for (const m of text.matchAll(/\u2014/g)) out.push(`em dash: "${around(text, m.index)}"`);
  for (const m of text.matchAll(/\u2013/g)) {
    const before = text[m.index - 1] ?? '';
    const after = text[m.index + 1] ?? '';
    if (!(/\d/.test(before) && /\d/.test(after))) out.push(`en dash outside a number range: "${around(text, m.index)}"`);
  }
  return out;
}

export function phoneProblems(text) {
  const out = [];
  if (text.replace(/[\s\-().+]/g, '').includes(PHONE_DIGITS)) out.push("the resume's phone number");
  for (const m of text.matchAll(/(?<![\d,.])(?:\+?91[\s-]?)?[6-9]\d{9}(?![\d,.])/g)) out.push(`a mobile number: ${m[0]}`);
  return out;
}

export function localRefs(html) {
  const refs = new Set();
  for (const m of html.matchAll(/\b(src|href|srcset)="([^"]+)"/g)) {
    for (const part of m[2].split(',')) {
      const url = part.trim().split(/\s+/)[0];
      if (!url || /^(?:[a-z]+:|#|\/\/)/i.test(url)) continue;
      refs.add(url);
    }
  }
  return [...refs];
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

export function filesIn(dir) {
  return walk(dir);
}

export function jsGzipBytes(dir) {
  return walk(dir).filter((f) => f.endsWith('.js')).reduce((sum, f) => sum + gzipSync(readFileSync(f)).length, 0);
}
```
Run: `npx vitest run scripts/check-lib.test.mjs`. Expected: all pass.

- [ ] **Step 3: Write the runner**

`scripts/pdf-text.py`:
```python
"""Print the text of a PDF, for the pre-deploy check."""
import sys

import fitz  # PyMuPDF

sys.stdout.reconfigure(encoding="utf-8")
doc = fitz.open(sys.argv[1])
print("\n".join(page.get_text() for page in doc))
print("\n".join(v for v in (doc.metadata or {}).values() if v))
```

`scripts/check.mjs`:
```js
// The pre-deploy check. `npm run check` builds first, then runs this; deploy refuses to ship if it fails.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { JS_BUDGET_BYTES, RESUME_FILE, dashProblems, filesIn, jsGzipBytes, localRefs, phoneProblems, userText } from './check-lib.mjs';

const dist = resolve('dist');
const problems = [];
const html = readFileSync(join(dist, 'index.html'), 'utf8');

for (const p of dashProblems(userText(html))) problems.push(`index.html: ${p}`);
for (const p of phoneProblems(userText(html))) problems.push(`index.html: ${p}`);
for (const file of filesIn(dist).filter((f) => /\.(html|js|css|svg|txt|json|webmanifest)$/.test(f))) {
  if (readFileSync(file, 'utf8').replace(/[\s\-().+]/g, '').includes('<phone number>')) problems.push(`${file}: the resume's phone number`);
}

const pdf = join(dist, RESUME_FILE);
if (!existsSync(pdf)) problems.push(`${RESUME_FILE} is missing from the build`);
else {
  const text = execFileSync('python', ['-I', resolve('scripts/pdf-text.py'), pdf], { encoding: 'utf8' });
  for (const p of phoneProblems(text)) problems.push(`${RESUME_FILE}: ${p}`);
}

for (const ref of localRefs(html)) {
  const path = join(dist, decodeURIComponent(ref.replace(/^\.?\//, '').split(/[?#]/)[0]));
  if (!existsSync(path)) problems.push(`index.html links to a missing file: ${ref}`);
}

const js = jsGzipBytes(dist);
if (js > JS_BUDGET_BYTES) problems.push(`JavaScript is ${(js / 1024).toFixed(1)} KB gzipped, over the ${JS_BUDGET_BYTES / 1024} KB budget`);

if (problems.length) {
  console.error(`Check failed:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`Check passed. JavaScript ${(js / 1024).toFixed(1)} KB gzipped of ${JS_BUDGET_BYTES / 1024} KB.`);
```

- [ ] **Step 4: Prove the check bites**

Run `npm run check`. Expected: it passes (the page from Task 2, the PDF from Task 3). Then put a temporary em dash in an `alt` attribute in `index.html` and run it again. Expected: it fails, naming the em dash. Revert the em dash.

- [ ] **Step 5: Checkpoint** (commit only with Chris's yes): `git add scripts package.json` then `git commit -m "Pre-deploy check: dashes, phone, links, JS budget"`

---

### Task 5: The six formations

**Files:**
- Create: `src/scene/formations.ts`
- Test: `src/scene/formations.test.ts`

**Interfaces:**
- Consumes: `mulberry32`, `gaussian`, `Rng` (Task 1)
- Produces: `type FormationId = 'clusters' | 'constellation' | 'page' | 'photoGrid' | 'roadNetwork' | 'singularity'`, `FORMATION_IDS: readonly FormationId[]`, `BOUNDS = 2.2`, `interface Formation { positions: Float32Array; accents: Float32Array; route: Float32Array }`, `buildFormation(id: FormationId, n: number, seed?: number): Formation`, `connect(nodes: readonly [number, number, number][], k: number): [number, number][]`

- [ ] **Step 1: Write the failing tests**

`src/scene/formations.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { BOUNDS, FORMATION_IDS, buildFormation, connect } from './formations';

const N = 3000;
const share = (a: Float32Array, test: (v: number) => boolean) => Array.from(a).filter(test).length / a.length;

describe.each(FORMATION_IDS)('%s', (id) => {
  const f = buildFormation(id, N);

  it('has one position, accent and route value per point', () => {
    expect(f.positions).toHaveLength(N * 3);
    expect(f.accents).toHaveLength(N);
    expect(f.route).toHaveLength(N);
  });
  it('keeps every coordinate finite and inside the bounds', () => {
    expect(Array.from(f.positions).filter((v) => !Number.isFinite(v) || Math.abs(v) > BOUNDS)).toEqual([]);
  });
  it('keeps accents in [-1, 1], and route values at -1 or in [0, 1]', () => {
    expect(Array.from(f.accents).filter((v) => v < -1 || v > 1)).toEqual([]);
    expect(Array.from(f.route).filter((v) => v !== -1 && (v < 0 || v > 1))).toEqual([]);
  });
  it('draws the same shape on every visit', () => {
    expect(buildFormation(id, N).positions).toEqual(f.positions);
  });
  it('copes with one point and with none', () => {
    expect(buildFormation(id, 1).positions).toHaveLength(3);
    expect(buildFormation(id, 0).positions).toHaveLength(0);
  });
});

describe('what each formation shows', () => {
  it('constellation lights its nodes', () => {
    expect(share(buildFormation('constellation', N).accents, (v) => v === 1)).toBeGreaterThan(0.25);
  });
  it('page flags a few words, not many', () => {
    const s = share(buildFormation('page', N).accents, (v) => v === 1);
    expect(s).toBeGreaterThan(0);
    expect(s).toBeLessThan(0.15);
  });
  it('photo grid lifts some tiles and fades others', () => {
    const a = buildFormation('photoGrid', N).accents;
    expect(share(a, (v) => v === 1)).toBeGreaterThan(0);
    expect(share(a, (v) => v === -1)).toBeGreaterThan(0);
  });
  it('road network carries a route from its start to its end', () => {
    const r = Array.from(buildFormation('roadNetwork', N).route).filter((v) => v >= 0);
    expect(r.length / N).toBeGreaterThan(0.05);
    expect(Math.min(...r)).toBeLessThan(0.05);
    expect(Math.max(...r)).toBeGreaterThan(0.95);
  });
  it('singularity gathers most points at the centre', () => {
    const p = buildFormation('singularity', N).positions;
    let near = 0;
    for (let i = 0; i < N; i++) if (Math.hypot(p[i * 3], p[i * 3 + 1], p[i * 3 + 2]) < 0.2) near++;
    expect(near / N).toBeGreaterThan(0.85);
  });
});

describe('connect', () => {
  it('joins every node into one graph, without duplicate edges or self-loops', () => {
    const nodes: [number, number, number][] = [[0, 0, 0], [5, 0, 0], [0, 5, 0], [9, 9, 0], [1, 1, 0], [20, 0, 0]];
    const edges = connect(nodes, 1);
    const keys = edges.map(([a, b]) => (a < b ? `${a}-${b}` : `${b}-${a}`));
    expect(new Set(keys).size).toBe(keys.length);
    expect(edges.every(([a, b]) => a !== b)).toBe(true);
    const reached = new Set([0]);
    for (let grew = true; grew; ) {
      grew = false;
      for (const [a, b] of edges) {
        if (reached.has(a) !== reached.has(b)) { reached.add(a); reached.add(b); grew = true; }
      }
    }
    expect(reached.size).toBe(nodes.length);
  });
});
```
Run: `npx vitest run src/scene/formations.test.ts`. Expected: FAIL, cannot resolve `./formations`.

- [ ] **Step 2: Implement**

`src/scene/formations.ts`:
```ts
import { gaussian, mulberry32, type Rng } from '../lib/rng';

export type FormationId = 'clusters' | 'constellation' | 'page' | 'photoGrid' | 'roadNetwork' | 'singularity';
export const FORMATION_IDS: readonly FormationId[] = ['clusters', 'constellation', 'page', 'photoGrid', 'roadNetwork', 'singularity'];

/** Every coordinate of every formation lies within [-BOUNDS, BOUNDS]. */
export const BOUNDS = 2.2;

export interface Formation {
  /** x, y, z for each point. */
  positions: Float32Array;
  /** Per point: -1 faded, 0 plain, 1 lit in the accent colour. */
  accents: Float32Array;
  /** Per point: where it sits along the highlighted route (0 to 1), or -1 when it is off the route. */
  route: Float32Array;
}

type Vec3 = [number, number, number];

function blank(n: number): Formation {
  return { positions: new Float32Array(n * 3), accents: new Float32Array(n), route: new Float32Array(n).fill(-1) };
}

const clamp = (v: number) => Math.max(-BOUNDS, Math.min(BOUNDS, v));
const spread = (rng: Rng, half: number) => (rng() * 2 - 1) * half;

function put(f: Formation, i: number, x: number, y: number, z: number): void {
  f.positions[i * 3] = clamp(x);
  f.positions[i * 3 + 1] = clamp(y);
  f.positions[i * 3 + 2] = clamp(z);
}

/** Rotate about the x axis: lays a flat formation back like a page or a street plan seen at an angle. */
function lean(y: number, z: number, angle: number): [number, number] {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [y * c - z * s, y * s + z * c];
}

/** A minimum spanning tree (so the graph is connected) plus each node's k nearest neighbours. */
export function connect(nodes: readonly Vec3[], k: number): [number, number][] {
  const seen = new Set<string>();
  const edges: [number, number][] = [];
  const add = (a: number, b: number) => {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (a !== b && !seen.has(key)) { seen.add(key); edges.push([a, b]); }
  };
  const d2 = (a: number, b: number) => {
    const p = nodes[a], q = nodes[b];
    return (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2;
  };
  if (nodes.length === 0) return edges;
  const inTree = new Set<number>([0]);
  while (inTree.size < nodes.length) {
    let best: [number, number] | null = null;
    let bestD = Infinity;
    for (const a of inTree) {
      for (let b = 0; b < nodes.length; b++) {
        if (inTree.has(b)) continue;
        const d = d2(a, b);
        if (d < bestD) { bestD = d; best = [a, b]; }
      }
    }
    if (!best) break;
    add(best[0], best[1]);
    inTree.add(best[1]);
  }
  for (let a = 0; a < nodes.length; a++) {
    const near = nodes.map((_, b) => b).filter((b) => b !== a).sort((x, y) => d2(a, x) - d2(a, y)).slice(0, k);
    for (const b of near) add(a, b);
  }
  return edges;
}

/** Faces in a vector index: soft clusters with a few strays. */
function clusters(n: number, rng: Rng): Formation {
  const f = blank(n);
  const centres: Vec3[] = Array.from({ length: 9 }, () => [spread(rng, 1.6), spread(rng, 0.95), spread(rng, 0.8)]);
  const sizes = centres.map(() => 0.1 + rng() * 0.18);
  for (let i = 0; i < n; i++) {
    if (rng() < 0.1) { put(f, i, spread(rng, 2), spread(rng, 1.25), spread(rng, 1.2)); continue; }
    const c = Math.floor(rng() * centres.length);
    const [x, y, z] = centres[c];
    const s = sizes[c];
    put(f, i, x + gaussian(rng) * s, y + gaussian(rng) * s, z + gaussian(rng) * s);
  }
  return f;
}

/** FlowPrep's knowledge map: lit chapter nodes joined by links. */
function constellation(n: number, rng: Rng): Formation {
  const f = blank(n);
  const nodes: Vec3[] = Array.from({ length: 56 }, () => {
    const x = spread(rng, 1.9);
    return [x, spread(rng, 1.1), Math.sin(x * 1.3) * 0.35 + spread(rng, 0.15)];
  });
  const edges = connect(nodes, 2);
  for (let i = 0; i < n; i++) {
    if (i % 3 === 0) {
      const [x, y, z] = nodes[Math.floor(i / 3) % nodes.length];
      put(f, i, x + gaussian(rng) * 0.025, y + gaussian(rng) * 0.025, z + gaussian(rng) * 0.025);
      f.accents[i] = 1;
      continue;
    }
    const [a, b] = edges[Math.floor(rng() * edges.length)];
    const p = nodes[a], q = nodes[b], t = rng();
    put(
      f, i,
      p[0] + (q[0] - p[0]) * t + gaussian(rng) * 0.008,
      p[1] + (q[1] - p[1]) * t + gaussian(rng) * 0.008,
      p[2] + (q[2] - p[2]) * t + gaussian(rng) * 0.008,
    );
  }
  return f;
}

/** ProofML: rows of a printed page, a few words flagged. */
function page(n: number, rng: Rng): Formation {
  const f = blank(n);
  const words: { x0: number; x1: number; y: number; flagged: boolean }[] = [];
  const left = -1.6, right = 1.6, top = 1.2, gap = 0.112;
  for (let r = 0; r < 22; r++) {
    const y = top - r * gap;
    const end = r % 6 === 5 ? left + (right - left) * (0.3 + rng() * 0.4) : right;
    for (let x = left; x < end - 0.08; ) {
      const w = Math.min(0.08 + rng() * 0.3, end - x);
      words.push({ x0: x, x1: x + w, y, flagged: false });
      x += w + 0.05;
    }
  }
  for (let k = 0; k < 7; k++) words[Math.floor(rng() * words.length)].flagged = true;
  const cumulative: number[] = [];
  let total = 0;
  for (const w of words) { total += w.x1 - w.x0; cumulative.push(total); }
  for (let i = 0; i < n; i++) {
    const pick = rng() * total;
    let lo = 0, hi = cumulative.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (cumulative[mid] < pick) lo = mid + 1; else hi = mid; }
    const w = words[lo];
    const [y, z] = lean(w.y + (rng() - 0.5) * 0.035, (rng() - 0.5) * 0.02, -0.45);
    put(f, i, w.x0 + rng() * (w.x1 - w.x0), y, z);
    if (w.flagged) f.accents[i] = 1;
  }
  return f;
}

/** ClickMomentz culling: a grid of photo frames, the best lifted and lit, the weakest sunk and faded. */
function photoGrid(n: number, rng: Rng): Formation {
  const f = blank(n);
  const cols = 8, rows = 5, w = 0.42, h = 0.3, gap = 0.08;
  const width = cols * w + (cols - 1) * gap, height = rows * h + (rows - 1) * gap;
  const tiles = Array.from({ length: cols * rows }, (_, k) => ({
    x0: -width / 2 + (k % cols) * (w + gap),
    y0: height / 2 - Math.floor(k / cols) * (h + gap) - h,
    score: rng(),
  }));
  const ranked = [...tiles].sort((a, b) => b.score - a.score);
  const kept = new Set(ranked.slice(0, 10));
  const dropped = new Set(ranked.slice(-10));
  for (let i = 0; i < n; i++) {
    const tile = tiles[i % tiles.length];
    let x = tile.x0 + rng() * w;
    let y = tile.y0 + rng() * h;
    // Two points in five trace the tile's edge, so each tile reads as a frame.
    if (rng() < 0.4) {
      if (rng() < 0.5) x = rng() < 0.5 ? tile.x0 : tile.x0 + w;
      else y = rng() < 0.5 ? tile.y0 : tile.y0 + h;
    }
    const z = kept.has(tile) ? 0.45 : dropped.has(tile) ? -0.6 : 0;
    put(f, i, x, y, z + (rng() - 0.5) * 0.02);
    f.accents[i] = kept.has(tile) ? 1 : dropped.has(tile) ? -1 : 0;
  }
  return f;
}

function argBest<T>(items: readonly T[], score: (t: T) => number): number {
  let best = 0;
  items.forEach((item, i) => { if (score(item) < score(items[best])) best = i; });
  return best;
}

function pathBetween(count: number, edges: readonly [number, number][], from: number, to: number): number[] {
  const next: number[][] = Array.from({ length: count }, () => []);
  for (const [a, b] of edges) { next[a].push(b); next[b].push(a); }
  const prev = new Array<number>(count).fill(-1);
  prev[from] = from;
  const queue = [from];
  while (queue.length > 0) {
    const a = queue.shift()!;
    if (a === to) break;
    for (const b of next[a]) if (prev[b] === -1) { prev[b] = a; queue.push(b); }
  }
  if (prev[to] === -1) return [from];
  const path = [to];
  while (path[0] !== from) path.unshift(prev[path[0]]);
  return path;
}

/** The thesis: cameras on a road network, one vehicle's route lit, impossible candidates floating and faded. */
function roadNetwork(n: number, rng: Rng): Formation {
  const f = blank(n);
  const cams: Vec3[] = Array.from({ length: 14 }, () => [spread(rng, 1.9), spread(rng, 1.1), 0]);
  const edges = connect(cams, 1);
  const route = pathBetween(cams.length, edges, argBest(cams, (c) => c[0]), argBest(cams, (c) => -c[0]));
  const lengths = route.slice(1).map((b, s) => Math.hypot(cams[b][0] - cams[route[s]][0], cams[b][1] - cams[route[s]][1]));
  const total = lengths.reduce((a, b) => a + b, 0) || 1;
  const onRoute = new Map<string, { start: number; length: number; from: number }>();
  let run = 0;
  route.slice(1).forEach((b, s) => {
    const a = route[s];
    onRoute.set(a < b ? `${a}-${b}` : `${b}-${a}`, { start: run / total, length: lengths[s] / total, from: a });
    run += lengths[s];
  });
  const tilt = -0.9;
  for (let i = 0; i < n; i++) {
    const roll = rng();
    if (roll < 0.12) {
      const [x, y] = cams[i % cams.length];
      const [ly, lz] = lean(y + gaussian(rng) * 0.03, gaussian(rng) * 0.03, tilt);
      put(f, i, x + gaussian(rng) * 0.03, ly, lz);
      f.accents[i] = 1;
      continue;
    }
    if (roll < 0.22) {
      const [ly, lz] = lean(spread(rng, 1.2), 0.2 + rng() * 0.6, tilt);
      put(f, i, spread(rng, 2), ly, lz);
      f.accents[i] = -1;
      continue;
    }
    const [a, b] = edges[Math.floor(rng() * edges.length)];
    const t = rng();
    const p = cams[a], q = cams[b];
    const [ly, lz] = lean(p[1] + (q[1] - p[1]) * t + gaussian(rng) * 0.01, gaussian(rng) * 0.01, tilt);
    put(f, i, p[0] + (q[0] - p[0]) * t + gaussian(rng) * 0.01, ly, lz);
    const seg = onRoute.get(a < b ? `${a}-${b}` : `${b}-${a}`);
    if (seg) f.route[i] = seg.start + seg.length * (seg.from === a ? t : 1 - t);
  }
  return f;
}

/** Contact: everything collapses into one bright point, with a thin shell around it. */
function singularity(n: number, rng: Rng): Formation {
  const f = blank(n);
  for (let i = 0; i < n; i++) {
    if (i % 10 === 0) {
      const theta = rng() * Math.PI * 2, phi = Math.acos(rng() * 2 - 1), r = 0.55 + rng() * 0.25;
      put(f, i, r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
      continue;
    }
    put(f, i, gaussian(rng) * 0.045, gaussian(rng) * 0.045, gaussian(rng) * 0.045);
    f.accents[i] = 1;
  }
  return f;
}

const BUILDERS: Record<FormationId, (n: number, rng: Rng) => Formation> = {
  clusters, constellation, page, photoGrid, roadNetwork, singularity,
};

export function buildFormation(id: FormationId, n: number, seed = 7): Formation {
  return BUILDERS[id](n, mulberry32(seed * 1009 + FORMATION_IDS.indexOf(id) * 101));
}
```

- [ ] **Step 3: Run the tests**

Run: `npx vitest run src/scene/formations.test.ts`. Expected: all pass. If the route test fails on its range, check `lengths` against `route` indices before loosening any number.

- [ ] **Step 4: Checkpoint** (commit only with Chris's yes): `git add src/scene/formations.*` then `git commit -m "Scene: six seeded point formations"`

---

### Task 6: Quality tiers and the point field

**Files:**
- Create: `src/lib/quality.ts`, `src/scene/drift.ts`, `src/scene/shaders.ts`, `src/scene/knn.ts` (stub export only; filled in Task 8), `src/scene/field.ts`, `src/scene/mount.ts`
- Modify: `src/main.ts`
- Test: `src/lib/quality.test.ts`, `src/scene/drift.test.ts`, `src/scene/mount.test.ts`

**Interfaces:**
- Consumes: `buildFormation`, `FormationId`, `FORMATION_IDS` (Task 5); `mulberry32` (Task 1); the HTML/CSS contract (Task 2)
- Produces:
  - `type Mode = 'full' | 'lite' | 'still' | 'static'`, `interface Device { webgl: boolean; reducedMotion: boolean; saveData: boolean; width: number; cores?: number; memoryGb?: number; pixelRatio: number }`, `interface Quality { mode: Mode; points: number; dpr: number }`, `POINTS = { full: 15000, lite: 5000 }`, `pickQuality(d: Device): Quality`, `detectDevice(win: Window): Device`
  - `DRIFT_AMP = 0.035`, `DRIFT_FREQ = [0.6, 0.5, 0.7]`, `INTRO_SPREAD = 9`, `driftAt(px, py, pz, time, out: Float32Array): void`
  - `POINT_VERTEX: string`, `POINT_FRAGMENT: string`
  - `interface SceneColors { point: string; accent: string; additive: boolean }`, `interface FieldScene { setMorph(from: FormationId, to: FormationId, t: number): void; setDim(dim: number): void; setIntro(progress: number): void; setPointer(p: { x: number; y: number } | null): void; setWander(on: boolean): void; setColors(c: SceneColors): void; start(): void; stop(): void; onContextLost(cb: () => void): void }`, `createFieldScene(canvas: HTMLCanvasElement, q: Quality): FieldScene`
  - `readSceneColors(style: Pick<CSSStyleDeclaration, 'getPropertyValue'>): SceneColors`, `mountField(canvas: HTMLCanvasElement, q: Quality): FieldScene`

- [ ] **Step 1: Write the failing tests**

`src/lib/quality.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { POINTS, pickQuality, type Device } from './quality';

const laptop: Device = { webgl: true, reducedMotion: false, saveData: false, width: 1440, cores: 8, memoryGb: 8, pixelRatio: 2 };

describe('pickQuality', () => {
  it('runs the full field on a capable laptop', () => {
    expect(pickQuality(laptop)).toEqual({ mode: 'full', points: POINTS.full, dpr: 2 });
  });
  it('caps the pixel ratio at 2', () => {
    expect(pickQuality({ ...laptop, pixelRatio: 3 }).dpr).toBe(2);
  });
  it('runs a lighter field on a phone', () => {
    expect(pickQuality({ ...laptop, width: 375, pixelRatio: 3 })).toEqual({ mode: 'lite', points: POINTS.lite, dpr: 1.5 });
  });
  it('runs a lighter field on a weak machine', () => {
    expect(pickQuality({ ...laptop, cores: 4 }).mode).toBe('lite');
    expect(pickQuality({ ...laptop, memoryGb: 4 }).mode).toBe('lite');
  });
  it('draws one still frame for reduced motion', () => {
    expect(pickQuality({ ...laptop, reducedMotion: true }).mode).toBe('still');
  });
  it('falls back to the static image without WebGL or on data saver', () => {
    expect(pickQuality({ ...laptop, webgl: false })).toEqual({ mode: 'static', points: 0, dpr: 1 });
    expect(pickQuality({ ...laptop, saveData: true }).mode).toBe('static');
  });
  it('treats unknown cores and memory as capable', () => {
    expect(pickQuality({ ...laptop, cores: undefined, memoryGb: undefined }).mode).toBe('full');
  });
});
```

`src/scene/drift.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { DRIFT_AMP, DRIFT_FREQ, INTRO_SPREAD, driftAt } from './drift';
import { POINT_VERTEX } from './shaders';

describe('driftAt', () => {
  it('is zero at time zero for phase zero', () => {
    const out = new Float32Array(3);
    driftAt(0, 0, 0, 0, out);
    expect(Array.from(out)).toEqual([0, 0, 0]);
  });
  it('peaks at the amplitude a quarter-turn in', () => {
    const out = new Float32Array(3);
    driftAt(0.25, 0, 0, 0, out);
    expect(out[0]).toBeCloseTo(DRIFT_AMP, 6);
  });
});

describe('the shader matches the CPU copy', () => {
  // The pointer query computes positions on the CPU; if these drift apart, the links point at empty space.
  it('uses the same drift frequencies, the same phase scale and the intro uniform', () => {
    expect(POINT_VERTEX).toContain(`vec3(${DRIFT_FREQ.join(', ')})`);
    expect(POINT_VERTEX).toContain('aPhase * 6.2831853');
    expect(POINT_VERTEX).toContain('(aPhase - 0.5) * uIntroSpread');
    expect(INTRO_SPREAD).toBe(9);
  });
});
```

`src/scene/mount.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { readSceneColors } from './mount';

const style = (values: Record<string, string>) => ({ getPropertyValue: (name: string) => values[name] ?? '' });

describe('readSceneColors', () => {
  it('reads hex tokens and the blend mode', () => {
    expect(readSceneColors(style({ '--field-point': ' #d8dee9', '--field-accent': '#7cf0c5', '--field-blend': 'normal' })))
      .toEqual({ point: '#d8dee9', accent: '#7cf0c5', additive: false });
  });
  it('falls back when a token is missing or not hex', () => {
    const c = readSceneColors(style({ '--field-point': 'oklch(0.9 0 0)' }));
    expect(c.point).toMatch(/^#[0-9a-f]{6}$/i);
    expect(c.additive).toBe(true);
  });
});
```
Run: `npx vitest run src/lib/quality.test.ts src/scene/drift.test.ts src/scene/mount.test.ts`. Expected: FAIL, modules missing.

- [ ] **Step 2: Implement quality, drift and shaders**

`src/lib/quality.ts`:
```ts
export type Mode = 'full' | 'lite' | 'still' | 'static';

export interface Device {
  webgl: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  width: number;
  cores?: number;
  memoryGb?: number;
  pixelRatio: number;
}

export interface Quality {
  mode: Mode;
  points: number;
  dpr: number;
}

export const POINTS = { full: 15000, lite: 5000 } as const;

export function pickQuality(d: Device): Quality {
  if (!d.webgl || d.saveData) return { mode: 'static', points: 0, dpr: 1 };
  const weak = d.width < 768 || (d.cores !== undefined && d.cores <= 4) || (d.memoryGb !== undefined && d.memoryGb <= 4);
  return {
    mode: d.reducedMotion ? 'still' : weak ? 'lite' : 'full',
    points: weak ? POINTS.lite : POINTS.full,
    dpr: Math.min(d.pixelRatio, weak ? 1.5 : 2),
  };
}

function hasWebGL2(doc: Document): boolean {
  try {
    const gl = doc.createElement('canvas').getContext('webgl2');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return gl !== null;
  } catch {
    return false;
  }
}

/** `?webgl=0` forces the static fallback, so it can be checked on any machine. */
export function detectDevice(win: Window): Device {
  const nav = win.navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return {
    webgl: new URLSearchParams(win.location.search).get('webgl') !== '0' && hasWebGL2(win.document),
    reducedMotion: win.matchMedia('(prefers-reduced-motion: reduce)').matches,
    saveData: nav.connection?.saveData === true,
    width: win.innerWidth,
    cores: nav.hardwareConcurrency || undefined,
    memoryGb: nav.deviceMemory,
    pixelRatio: win.devicePixelRatio || 1,
  };
}
```

`src/scene/drift.ts`:
```ts
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
```

`src/scene/shaders.ts`:
```ts
export const POINT_VERTEX = /* glsl */ `
uniform float uMix;
uniform float uTime;
uniform float uIntro;
uniform float uIntroSpread;
uniform float uSize;
uniform float uDriftAmp;
attribute vec3 aTo;
attribute vec3 aPhase;
attribute float aAccentFrom;
attribute float aAccentTo;
attribute float aRouteFrom;
attribute float aRouteTo;
attribute float aHighlight;
varying float vAccent;
varying float vHighlight;
varying float vRoute;
varying float vDepth;

void main() {
  vec3 settled = mix(position, aTo, uMix) + uDriftAmp * sin(uTime * vec3(0.6, 0.5, 0.7) + aPhase * 6.2831853);
  vec3 p = mix((aPhase - 0.5) * uIntroSpread, settled, uIntro);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  vAccent = mix(aAccentFrom, aAccentTo, uMix);
  vHighlight = aHighlight;
  vRoute = uMix < 0.5 ? aRouteFrom : aRouteTo;
  vDepth = clamp((-mv.z - 3.0) / 6.0, 0.0, 1.0);
  gl_PointSize = uSize * (1.0 + 0.6 * max(vAccent, 0.0) + 1.4 * aHighlight) * (6.0 / -mv.z);
}
`;

export const POINT_FRAGMENT = /* glsl */ `
uniform vec3 uPoint;
uniform vec3 uAccent;
uniform float uDim;
uniform float uTime;
varying float vAccent;
varying float vHighlight;
varying float vRoute;
varying float vDepth;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float soft = smoothstep(0.5, 0.0, d);
  float pulse = vRoute >= 0.0 ? smoothstep(0.06, 0.0, abs(fract(uTime * 0.12) - vRoute)) : 0.0;
  float glow = clamp(max(vAccent, 0.0) + vHighlight + pulse, 0.0, 1.0);
  vec3 color = mix(uPoint, uAccent, glow);
  float alpha = soft * (0.55 + 0.45 * glow) * (1.0 - 0.6 * vDepth);
  alpha *= 1.0 + 0.75 * min(vAccent, 0.0);
  alpha *= 1.0 - 0.7 * uDim;
  gl_FragColor = vec4(color, alpha);
}
`;
```

`src/scene/knn.ts` (filled in Task 8):
```ts
export function nearest(_xy: Float32Array, _qx: number, _qy: number, _k: number, _maxDist: number): number[] {
  return [];
}
```

- [ ] **Step 3: Implement the field**

`src/scene/field.ts`:
```ts
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, Color, DynamicDrawUsage, LineBasicMaterial, LineSegments,
  Matrix4, NormalBlending, PerspectiveCamera, Points, Scene, ShaderMaterial, Vector3, WebGLRenderer,
} from 'three';
import type { Quality } from '../lib/quality';
import { mulberry32 } from '../lib/rng';
import { DRIFT_AMP, INTRO_SPREAD, driftAt } from './drift';
import { buildFormation, type Formation, type FormationId } from './formations';
import { nearest } from './knn';
import { POINT_FRAGMENT, POINT_VERTEX } from './shaders';

export interface SceneColors {
  point: string;
  accent: string;
  additive: boolean;
}

export interface FieldScene {
  setMorph(from: FormationId, to: FormationId, t: number): void;
  setDim(dim: number): void;
  setIntro(progress: number): void;
  setPointer(p: { x: number; y: number } | null): void;
  setWander(on: boolean): void;
  setColors(c: SceneColors): void;
  start(): void;
  stop(): void;
  onContextLost(cb: () => void): void;
}

const NEIGHBOURS = 12;
const LINK_RADIUS_PX = 150;
const BASE_SIZE = 2.4;

export function createFieldScene(canvas: HTMLCanvasElement, q: Quality): FieldScene {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(q.dpr);
  renderer.setClearColor(0x000000, 0);
  const scene = new Scene();
  const camera = new PerspectiveCamera(45, 1, 0.1, 50);
  camera.position.set(0, 0, 6);

  const n = q.points;
  const cache = new Map<FormationId, Formation>();
  const formation = (id: FormationId): Formation => {
    let f = cache.get(id);
    if (!f) { f = buildFormation(id, n); cache.set(id, f); }
    return f;
  };

  const attr = (items: number, size: number) => new BufferAttribute(new Float32Array(items * size), size);
  const from = attr(n, 3), to = attr(n, 3);
  const accentFrom = attr(n, 1), accentTo = attr(n, 1);
  const routeFrom = attr(n, 1), routeTo = attr(n, 1);
  const phase = attr(n, 3);
  const highlight = attr(n, 1).setUsage(DynamicDrawUsage);
  const rng = mulberry32(2026);
  const phases = phase.array as Float32Array;
  for (let i = 0; i < phases.length; i++) phases[i] = rng();

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', from);
  geometry.setAttribute('aTo', to);
  geometry.setAttribute('aAccentFrom', accentFrom);
  geometry.setAttribute('aAccentTo', accentTo);
  geometry.setAttribute('aRouteFrom', routeFrom);
  geometry.setAttribute('aRouteTo', routeTo);
  geometry.setAttribute('aPhase', phase);
  geometry.setAttribute('aHighlight', highlight);

  const uniforms = {
    uMix: { value: 0 }, uTime: { value: 0 }, uDim: { value: 0 }, uIntro: { value: 1 },
    uIntroSpread: { value: INTRO_SPREAD }, uSize: { value: BASE_SIZE * q.dpr }, uDriftAmp: { value: DRIFT_AMP },
    uPoint: { value: new Color('#ffffff') }, uAccent: { value: new Color('#ffffff') },
  };
  const material = new ShaderMaterial({
    uniforms, vertexShader: POINT_VERTEX, fragmentShader: POINT_FRAGMENT,
    transparent: true, depthWrite: false, blending: AdditiveBlending,
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  const linkArray = new Float32Array(NEIGHBOURS * 6);
  const linkAttr = new BufferAttribute(linkArray, 3).setUsage(DynamicDrawUsage);
  const linkGeometry = new BufferGeometry();
  linkGeometry.setAttribute('position', linkAttr);
  linkGeometry.setDrawRange(0, 0);
  const linkMaterial = new LineBasicMaterial({ transparent: true, opacity: 0.45, depthWrite: false });
  const links = new LineSegments(linkGeometry, linkMaterial);
  links.frustumCulled = false;
  scene.add(links);

  let fromId: FormationId | null = null;
  let toId: FormationId | null = null;
  let pointer: { x: number; y: number } | null = null;
  let wander = false;
  let running = false;
  let width = 0, height = 0, elapsed = 0, last = 0;
  const world = new Float32Array(n * 3);
  const screen = new Float32Array(n * 2);
  const lit = new Map<number, true>();
  const drift = new Float32Array(3);
  const mvp = new Matrix4();
  const ray = new Vector3();

  const load = (target: BufferAttribute, values: Float32Array) => {
    (target.array as Float32Array).set(values);
    target.needsUpdate = true;
  };
  const draw = () => renderer.render(scene, camera);

  function resize(): void {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w === width && h === height) return;
    width = w;
    height = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(h, 1);
    // On tall screens, step back so the formations' width still fits.
    camera.position.z = camera.aspect < 1 ? (6 / Math.max(camera.aspect, 0.55)) * 0.8 : 6;
    camera.updateProjectionMatrix();
    if (!running) draw();
  }
  new ResizeObserver(resize).observe(canvas);

  /** CPU copy of what the vertex shader draws, for the pointer query. */
  function updateWorld(): void {
    const a = from.array as Float32Array, b = to.array as Float32Array;
    const m = uniforms.uMix.value, intro = uniforms.uIntro.value;
    for (let i = 0; i < n; i++) {
      const o = i * 3;
      driftAt(phases[o], phases[o + 1], phases[o + 2], elapsed, drift);
      for (let c = 0; c < 3; c++) {
        const scatter = (phases[o + c] - 0.5) * INTRO_SPREAD;
        const settled = a[o + c] + (b[o + c] - a[o + c]) * m + drift[c];
        world[o + c] = scatter + (settled - scatter) * intro;
      }
    }
  }

  function project(): void {
    mvp.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    const e = mvp.elements;
    for (let i = 0; i < n; i++) {
      const x = world[i * 3], y = world[i * 3 + 1], z = world[i * 3 + 2];
      const w = e[3] * x + e[7] * y + e[11] * z + e[15];
      if (w <= 0) { screen[i * 2] = NaN; screen[i * 2 + 1] = NaN; continue; }
      screen[i * 2] = ((e[0] * x + e[4] * y + e[8] * z + e[12]) / w * 0.5 + 0.5) * width;
      screen[i * 2 + 1] = (0.5 - (e[1] * x + e[5] * y + e[9] * z + e[13]) / w * 0.5) * height;
    }
  }

  /** Where the pointer's ray meets the z = 0 plane. */
  function pointerWorld(p: { x: number; y: number }): Vector3 {
    ray.set((p.x / width) * 2 - 1, -(p.y / height) * 2 + 1, 0.5).unproject(camera).sub(camera.position).normalize();
    return camera.position.clone().addScaledVector(ray, -camera.position.z / ray.z);
  }

  function updateLinks(): void {
    const q2 = pointer ?? (wander ? { x: width * (0.62 + 0.25 * Math.sin(elapsed * 0.21)), y: height * (0.42 + 0.18 * Math.sin(elapsed * 0.33)) } : null);
    const show = q2 !== null && uniforms.uDim.value < 0.5 && uniforms.uIntro.value > 0.95;
    let found: number[] = [];
    if (show) {
      updateWorld();
      project();
      found = nearest(screen, q2.x, q2.y, NEIGHBOURS, LINK_RADIUS_PX);
    }
    const h = highlight.array as Float32Array;
    const wanted = new Set(found);
    for (const i of found) lit.set(i, true);
    for (const i of lit.keys()) {
      const target = wanted.has(i) ? 1 : 0;
      h[i] += (target - h[i]) * 0.18;
      if (target === 0 && h[i] < 0.01) { h[i] = 0; lit.delete(i); }
    }
    highlight.needsUpdate = true;
    if (!show || found.length === 0) { linkGeometry.setDrawRange(0, 0); return; }
    const o = pointerWorld(q2);
    found.forEach((i, k) => linkArray.set([o.x, o.y, o.z, world[i * 3], world[i * 3 + 1], world[i * 3 + 2]], k * 6));
    linkAttr.needsUpdate = true;
    linkGeometry.setDrawRange(0, found.length * 2);
    linkMaterial.opacity = 0.45 * Math.max(0, 1 - uniforms.uDim.value * 2);
  }

  function frame(now: number): void {
    elapsed += Math.min(0.1, (now - last) / 1000);
    last = now;
    uniforms.uTime.value = elapsed;
    camera.position.x = Math.sin(elapsed * 0.07) * 0.3;
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    updateLinks();
    draw();
  }

  function stop(): void {
    running = false;
    renderer.setAnimationLoop(null);
  }

  resize();
  return {
    setMorph(a, b, t) {
      if (a !== fromId) { const f = formation(a); load(from, f.positions); load(accentFrom, f.accents); load(routeFrom, f.route); fromId = a; }
      if (b !== toId) { const f = formation(b); load(to, f.positions); load(accentTo, f.accents); load(routeTo, f.route); toId = b; }
      uniforms.uMix.value = t;
      if (!running) draw();
    },
    setDim(dim) { uniforms.uDim.value = dim; },
    setIntro(progress) { uniforms.uIntro.value = progress; },
    setPointer(p) { pointer = p; },
    setWander(on) { wander = on; },
    setColors(c) {
      uniforms.uPoint.value.set(c.point);
      uniforms.uAccent.value.set(c.accent);
      linkMaterial.color.set(c.accent);
      material.blending = c.additive ? AdditiveBlending : NormalBlending;
      material.needsUpdate = true;
      if (!running) draw();
    },
    start() {
      if (running) return;
      running = true;
      last = performance.now();
      renderer.setAnimationLoop(frame);
    },
    stop,
    onContextLost(cb) {
      canvas.addEventListener('webglcontextlost', (event) => { event.preventDefault(); stop(); cb(); });
    },
  };
}
```

- [ ] **Step 4: Implement the mount**

`src/scene/mount.ts`:
```ts
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Quality } from '../lib/quality';
import { createFieldScene, type FieldScene, type SceneColors } from './field';

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
  document.addEventListener('visibilitychange', () => (document.hidden ? field.stop() : field.start()));
  field.start();
  void ScrollTrigger; // scroll binding arrives in Task 7
  return field;
}
```

`src/main.ts` (the theme block from Task 2 stays; add the rest):
```ts
import './styles/index.css';
import moon from '@phosphor-icons/core/assets/regular/moon.svg?raw';
import sun from '@phosphor-icons/core/assets/regular/sun.svg?raw';
import { detectDevice, pickQuality } from './lib/quality';
import { initThemeToggle } from './lib/theme';

const root = document.documentElement;
const quality = pickQuality(detectDevice(window));
root.dataset.motion = quality.mode;

const toggle = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
if (toggle) {
  toggle.innerHTML = `<span class="icon icon--sun">${sun}</span><span class="icon icon--moon">${moon}</span>`;
  toggle.hidden = false;
  initThemeToggle(toggle);
}

// three.js is the heaviest dependency: load it after the page's own code, so the text and fonts come first.
const canvas = document.querySelector<HTMLCanvasElement>('.field canvas');
if (canvas && quality.mode !== 'static') {
  const { mountField } = await import('./scene/mount');
  mountField(canvas, quality);
}
```
Check after the build that three.js lands in its own chunk (`dist/assets/mount-*.js`), separate from the entry.

- [ ] **Step 5: Run the tests and the type check**

Run: `npx vitest run src/lib/quality.test.ts src/scene/drift.test.ts src/scene/mount.test.ts`, then `npm run typecheck`
Expected: all pass, no type errors. Before going on, confirm in `node_modules/three/src/` that r187 still exports `WebGLRenderer`, `ShaderMaterial`, `Points` and `LineSegments` as used.

- [ ] **Step 6: See the field**

With `npm run dev` running, open the page in the browser pane. Expected: a drifting cluster cloud behind the hero, and no console errors.

- [ ] **Step 7: Check the frame rate**

```js
await new Promise((r) => { let f = 0; const t0 = performance.now(); const tick = () => { f++; performance.now() - t0 < 3000 ? requestAnimationFrame(tick) : r(f / 3); }; requestAnimationFrame(tick); })
```
Expected: about the display's refresh rate (60 or more).

- [ ] **Step 8: Check the fallbacks**

Open `?webgl=0`. Expected: `html[data-motion="static"]`, no canvas drawing, the gradient fallback visible, and all content present.

- [ ] **Step 9: Lose the context on purpose (Review Focus 3)**

In the browser pane on the normal page:
```js
document.querySelector('.field canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext();
await new Promise((r) => setTimeout(r, 200));
document.documentElement.dataset.motion
```
Expected: `"static"`, and the fallback image shows instead of a frozen canvas.

- [ ] **Step 10: Light theme legibility (Review Focus 5, scene half)**

Toggle to light. Expected: the points stay visible as ink on paper (`--field-blend: normal`), and a screenshot shows the cloud clearly in both themes.

- [ ] **Step 11: Checkpoint** (commit only with Chris's yes): `git add -A` then `git commit -m "Scene: quality tiers, point field, fallbacks"`

---

### Task 7: Scroll morphing and smooth scrolling

**Files:**
- Create: `src/scene/timeline.ts`, `src/motion/anchors.ts`
- Modify: `src/scene/mount.ts`, `src/main.ts`
- Test: `src/scene/timeline.test.ts`

**Interfaces:**
- Consumes: `FormationId`, `FORMATION_IDS` (Task 5), `FieldScene` (Task 6)
- Produces: `interface Stop { at: number; formation: FormationId; dim: number }`, `interface SectionBox { top: number; height: number; formation: FormationId; dim: number }`, `interface SceneState { from: FormationId; to: FormationId; t: number; dim: number }`, `stateAt(y: number, stops: readonly Stop[]): SceneState`, `stopsFromSections(sections: readonly SectionBox[], viewport: number, maxScroll: number): Stop[]`, `initAnchors(lenis: Lenis | null): void`; `html[data-formation]` names the formation on screen

- [ ] **Step 1: Write the failing tests**

`src/scene/timeline.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { stateAt, stopsFromSections, type Stop } from './timeline';

const stops: Stop[] = [
  { at: 0, formation: 'clusters', dim: 0 },
  { at: 1000, formation: 'constellation', dim: 0.2 },
  { at: 2000, formation: 'page', dim: 0.2 },
];

describe('stateAt', () => {
  it('holds the first formation before the first stop', () => {
    expect(stateAt(-50, stops)).toEqual({ from: 'clusters', to: 'clusters', t: 0, dim: 0 });
  });
  it('holds the last formation after the last stop', () => {
    expect(stateAt(5000, stops)).toEqual({ from: 'page', to: 'page', t: 0, dim: 0.2 });
  });
  it('blends half-way at the midpoint', () => {
    expect(stateAt(500, stops)).toMatchObject({ from: 'clusters', to: 'constellation', t: 0.5, dim: 0.1 });
  });
  it('eases in and out (smoothstep)', () => {
    expect(stateAt(250, stops).t).toBeCloseTo(0.15625, 6);
  });
  it('is exactly the stop formation when sitting on a stop', () => {
    expect(stateAt(1000, stops)).toMatchObject({ from: 'constellation', to: 'page', t: 0 });
  });
  it('copes with two stops at the same place', () => {
    const s = stateAt(10, [{ at: 0, formation: 'clusters', dim: 0 }, { at: 10, formation: 'page', dim: 0 }, { at: 10, formation: 'singularity', dim: 0 }]);
    expect(Number.isNaN(s.t)).toBe(false);
  });
  it('works with a single stop', () => {
    expect(stateAt(300, [stops[0]])).toEqual({ from: 'clusters', to: 'clusters', t: 0, dim: 0 });
  });
  it('rejects an empty list', () => {
    expect(() => stateAt(0, [])).toThrow();
  });
});

describe('stopsFromSections', () => {
  it('puts each stop where its section is centred on screen', () => {
    const s = stopsFromSections([
      { top: 0, height: 800, formation: 'clusters', dim: 0 },
      { top: 1000, height: 800, formation: 'page', dim: 0.2 },
    ], 800, 5000);
    expect(s.map((x) => x.at)).toEqual([0, 1000]);
  });
  it('never puts a stop past the end of the page', () => {
    const s = stopsFromSections([{ top: 4800, height: 600, formation: 'singularity', dim: 0 }], 800, 4600);
    expect(s[0].at).toBe(4600);
  });
  it('sorts by position', () => {
    const s = stopsFromSections([
      { top: 2000, height: 800, formation: 'page', dim: 0 },
      { top: 0, height: 800, formation: 'clusters', dim: 0 },
    ], 800, 5000);
    expect(s.map((x) => x.formation)).toEqual(['clusters', 'page']);
  });
});
```
Run: `npx vitest run src/scene/timeline.test.ts`. Expected: FAIL, cannot resolve `./timeline`.

- [ ] **Step 2: Implement**

`src/scene/timeline.ts`:
```ts
import type { FormationId } from './formations';

export interface Stop { at: number; formation: FormationId; dim: number }
export interface SectionBox { top: number; height: number; formation: FormationId; dim: number }
export interface SceneState { from: FormationId; to: FormationId; t: number; dim: number }

const smooth = (x: number) => x * x * (3 - 2 * x);

/** The scene's state at scroll position y: which formation it is leaving, which it is reaching, and how far along. */
export function stateAt(y: number, stops: readonly Stop[]): SceneState {
  if (stops.length === 0) throw new Error('stateAt needs at least one stop');
  const first = stops[0], last = stops[stops.length - 1];
  if (stops.length === 1 || y <= first.at) return { from: first.formation, to: first.formation, t: 0, dim: first.dim };
  if (y >= last.at) return { from: last.formation, to: last.formation, t: 0, dim: last.dim };
  let i = 0;
  while (i < stops.length - 2 && stops[i + 1].at <= y) i++;
  const a = stops[i], b = stops[i + 1];
  const span = b.at - a.at;
  const t = span <= 0 ? 1 : smooth(Math.min(1, Math.max(0, (y - a.at) / span)));
  return { from: a.formation, to: b.formation, t, dim: a.dim + (b.dim - a.dim) * t };
}

/** A stop sits where its section is centred in the viewport, clamped to the scrollable range. */
export function stopsFromSections(sections: readonly SectionBox[], viewport: number, maxScroll: number): Stop[] {
  return sections
    .map((s) => ({ at: Math.min(maxScroll, Math.max(0, s.top + s.height / 2 - viewport / 2)), formation: s.formation, dim: s.dim }))
    .sort((p, q) => p.at - q.at);
}
```
Run: `npx vitest run src/scene/timeline.test.ts`. Expected: all pass.

- [ ] **Step 3: Bind the scene to scroll**

In `src/scene/mount.ts`, add the imports `import { FORMATION_IDS, type FormationId } from './formations';` and `import { stateAt, stopsFromSections, type Stop } from './timeline';`. Then replace the line `void ScrollTrigger; // scroll binding arrives in Task 7` with:
```ts
  const sections = [...document.querySelectorAll<HTMLElement>('[data-formation]')];
  const isFormation = (v: string | undefined): v is FormationId => FORMATION_IDS.includes(v as FormationId);
  const measure = (): Stop[] => stopsFromSections(
    sections.map((s) => {
      const r = s.getBoundingClientRect();
      return { top: r.top + window.scrollY, height: r.height, formation: isFormation(s.dataset.formation) ? s.dataset.formation : 'clusters', dim: Number(s.dataset.dim ?? 0) };
    }),
    window.innerHeight,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  let stops = measure();
  const apply = (y: number) => {
    const s = stateAt(y, stops);
    field.setMorph(s.from, s.to, s.t);
    field.setDim(s.dim);
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
```
`root.dataset.formation` is set in `still` mode too (to `clusters`), so tests and CSS can read it.

- [ ] **Step 4: Smooth scrolling and anchors**

`src/motion/anchors.ts`:
```ts
import type Lenis from 'lenis';

/** In-page links scroll smoothly when allowed, and always move focus to the section they name. */
export function initAnchors(lenis: Lenis | null): void {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.hash.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      event.preventDefault();
      const arrive = () => {
        target.focus({ preventScroll: true });
        history.replaceState(null, '', `#${id}`);
      };
      if (lenis) lenis.scrollTo(target, { onComplete: arrive });
      else { target.scrollIntoView(); arrive(); }
    });
  });
}
```
Confirm `scrollTo(target, { onComplete })` against the Lenis 1.3.27 README before relying on it.

`src/main.ts` becomes:
```ts
import 'lenis/dist/lenis.css';
import './styles/index.css';
import moon from '@phosphor-icons/core/assets/regular/moon.svg?raw';
import sun from '@phosphor-icons/core/assets/regular/sun.svg?raw';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { detectDevice, pickQuality } from './lib/quality';
import { initThemeToggle } from './lib/theme';
import { initAnchors } from './motion/anchors';

gsap.registerPlugin(ScrollTrigger, SplitText);

const root = document.documentElement;
const device = detectDevice(window);
const quality = pickQuality(device);
const motionOK = !device.reducedMotion;
root.dataset.motion = quality.mode;
const capture = new URLSearchParams(window.location.search).get('capture');
if (capture === 'field' || capture === 'og') root.dataset.capture = capture;

const toggle = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
if (toggle) {
  toggle.innerHTML = `<span class="icon icon--sun">${sun}</span><span class="icon icon--moon">${moon}</span>`;
  toggle.hidden = false;
  initThemeToggle(toggle);
}

let lenis: Lenis | null = null;
if (motionOK && !capture) {
  lenis = new Lenis();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}
initAnchors(lenis);

// three.js loads after the page's own code, so the text and fonts come first.
const canvas = document.querySelector<HTMLCanvasElement>('.field canvas');
const field = canvas && quality.mode !== 'static' ? (await import('./scene/mount')).mountField(canvas, quality) : null;
```

- [ ] **Step 5: Run the tests and the type check**

Run: `npm test`, then `npm run typecheck`. Expected: all pass.

- [ ] **Step 6: Watch the story**

Scroll the page top to bottom in the browser pane. Expected: clusters, then the constellation, the page, the photo grid, the road network, soft dimmed clusters, then the single point. Morphs are smooth, and the formation is settled when its section is centred. Screenshot each section at 1440 px.

- [ ] **Step 7: Keyboard and focus (Review Focus 1)**

Press Tab until "Work" in the nav is focused, then press Enter. Then run:
```js
[document.activeElement.id, Math.abs(document.getElementById('work').getBoundingClientRect().top) < 80]
```
Expected: `["work", true]`. Also check that the skip link lands on `#work`.

- [ ] **Step 8: Resize mid-page (Review Focus 2)**

Scroll so that `#thesis` is centred. Resize the pane to 375 x 812, then wait a second. Then run:
```js
[document.documentElement.dataset.formation, Math.abs(document.getElementById('thesis').getBoundingClientRect().top) < window.innerHeight]
```
Expected: `["roadNetwork", true]`, and the canvas fills the new size without stretching. Resize back with the `desktop` preset.

- [ ] **Step 9: Checkpoint** (commit only with Chris's yes): `git add -A` then `git commit -m "Scroll morphing, smooth scroll, accessible anchors"`

---

### Task 8: The pointer as a live nearest-neighbour search

**Files:**
- Modify: `src/scene/knn.ts` (replace the stub)
- Test: `src/scene/knn.test.ts`

**Interfaces:**
- Produces: `nearest(xy: Float32Array, qx: number, qy: number, k: number, maxDist: number): number[]` (indices, nearest first; skips NaN points; at most k; none beyond maxDist)

- [ ] **Step 1: Write the failing tests**

`src/scene/knn.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { nearest } from './knn';

// Points at x = 0, 10, 20, ... 90 on y = 0.
const line = new Float32Array(Array.from({ length: 10 }, (_, i) => [i * 10, 0]).flat());

describe('nearest', () => {
  it('returns the k nearest, nearest first', () => {
    expect(nearest(line, 31, 0, 3, 100)).toEqual([3, 4, 2]);
  });
  it('leaves out points beyond the radius', () => {
    expect(nearest(line, 0, 0, 5, 15)).toEqual([0, 1]);
  });
  it('returns fewer than k when there are fewer points', () => {
    expect(nearest(new Float32Array([0, 0, 5, 5]), 0, 0, 12, 100)).toEqual([0, 1]);
  });
  it('skips points behind the camera (NaN)', () => {
    expect(nearest(new Float32Array([NaN, NaN, 3, 4]), 0, 0, 2, 100)).toEqual([1]);
  });
  it('returns nothing for k = 0', () => {
    expect(nearest(line, 0, 0, 0, 100)).toEqual([]);
  });
});
```
Run: `npx vitest run src/scene/knn.test.ts`. Expected: FAIL (the stub returns `[]`).

- [ ] **Step 2: Implement**

`src/scene/knn.ts`:
```ts
/** Indices of the k points nearest (qx, qy) within maxDist, nearest first.
 *  xy holds x, y pairs in screen pixels; NaN marks a point behind the camera.
 *  Brute force on purpose: 15,000 points take well under a millisecond, and the set changes every frame. */
export function nearest(xy: Float32Array, qx: number, qy: number, k: number, maxDist: number): number[] {
  if (k <= 0) return [];
  const best: { i: number; d: number }[] = [];
  const max2 = maxDist * maxDist;
  for (let i = 0; i < xy.length / 2; i++) {
    const dx = xy[i * 2] - qx, dy = xy[i * 2 + 1] - qy;
    const d = dx * dx + dy * dy;
    if (!(d <= max2)) continue; // also rejects NaN
    if (best.length === k && d >= best[k - 1].d) continue;
    if (best.length < k) best.push({ i, d });
    else best[k - 1] = { i, d };
    for (let j = best.length - 1; j > 0 && best[j - 1].d > best[j].d; j--) [best[j - 1], best[j]] = [best[j], best[j - 1]];
  }
  return best.map((b) => b.i);
}
```
Run: `npx vitest run src/scene/knn.test.ts`. Expected: all pass.

- [ ] **Step 3: Feel it**

In the browser pane, hover over the hero. Expected: about 12 nearby points brighten and link to the cursor, the links follow smoothly, and they fade out as the dimmed sections arrive. At 375 px with touch emulation (the `mobile` preset), the search point wanders on its own. Check the frame rate again (Task 6, Step 7) while moving the pointer: still at refresh rate.

- [ ] **Step 4: Checkpoint** (commit only with Chris's yes): `git add src/scene/knn.*` then `git commit -m "Pointer: live nearest-neighbour search"`

---

### Task 9: The motion layer

**Files:**
- Create: `src/motion/format.ts`, `src/motion/counters.ts`, `src/motion/reveal.ts`, `src/motion/tilt.ts`, `src/motion/rail.ts`, `src/motion/intro.ts`, `src/motion/index.ts`
- Modify: `src/main.ts`
- Test: `src/motion/format.test.ts`

**Interfaces:**
- Consumes: `FieldScene` (Task 6), the HTML contract (Task 2)
- Produces: `interface CountFormat { decimals?: number; prefix?: string; suffix?: string }`, `formatCount(value: number, f?: CountFormat): string`, `readCountFormat(data: DOMStringMap): { target: number; format: CountFormat } | null`, `initMotion(opts: { motionOK: boolean; field: FieldScene | null; capture: boolean }): void`

- [ ] **Step 1: Write the failing tests**

`src/motion/format.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { formatCount, readCountFormat } from './format';

describe('formatCount', () => {
  it('groups thousands', () => expect(formatCount(10000)).toBe('10,000'));
  it('adds a prefix and a suffix', () => {
    expect(formatCount(338, { suffix: '×' })).toBe('338×');
    expect(formatCount(15000, { prefix: '~' })).toBe('~15,000');
    expect(formatCount(10000, { prefix: 'up to ' })).toBe('up to 10,000');
  });
  it('keeps the decimals asked for', () => expect(formatCount(99.7, { decimals: 1, suffix: '%' })).toBe('99.7%'));
  it('rounds while counting up', () => expect(formatCount(42.6)).toBe('43'));
  it('starts from zero', () => expect(formatCount(0, { suffix: '%' })).toBe('0%'));
});

describe('readCountFormat', () => {
  it('reads the data attributes', () => {
    expect(readCountFormat({ count: '99.7', decimals: '1', suffix: '%' })).toEqual({ target: 99.7, format: { decimals: 1, prefix: '', suffix: '%' } });
  });
  it('returns null when the number is missing or not a number', () => {
    expect(readCountFormat({})).toBeNull();
    expect(readCountFormat({ count: 'many' })).toBeNull();
  });
});
```
Run: `npx vitest run src/motion/format.test.ts`. Expected: FAIL, cannot resolve `./format`.

- [ ] **Step 2: Implement the formatter**

`src/motion/format.ts`:
```ts
export interface CountFormat {
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export function formatCount(value: number, f: CountFormat = {}): string {
  const d = f.decimals ?? 0;
  const body = value.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  return `${f.prefix ?? ''}${body}${f.suffix ?? ''}`;
}

export function readCountFormat(data: DOMStringMap): { target: number; format: CountFormat } | null {
  const target = Number(data.count);
  if (data.count === undefined || !Number.isFinite(target)) return null;
  return { target, format: { decimals: Number(data.decimals ?? 0), prefix: data.prefix ?? '', suffix: data.suffix ?? '' } };
}
```
Run: `npx vitest run src/motion/format.test.ts`. Expected: all pass.

- [ ] **Step 3: Counters and reveals**

`src/motion/counters.ts`:
```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { formatCount, readCountFormat } from './format';

/** Numbers count up once when they come into view. The HTML already holds the final value, and a
 *  screen-reader copy sits beside each (the animated span is aria-hidden). */
export function initCounters(): void {
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const spec = readCountFormat(el.dataset);
    if (!spec) return;
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
```

`src/motion/reveal.ts`:
```ts
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
      autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, {
        yPercent: 110, duration: 0.9, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      }),
    });
  });
  document.querySelectorAll<HTMLElement>('[data-reveal="fade"]').forEach((el) => {
    gsap.from(el, { autoAlpha: 0, y: 24, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
}
```

- [ ] **Step 4: Tilt, rail and section nav**

`src/motion/tilt.ts`:
```ts
import { gsap } from 'gsap';

/** Feedback: a screenshot tilts slightly toward the mouse, so it reads as an object you can handle. Mouse only. */
export function initTilt(): void {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    gsap.set(el, { transformPerspective: 900 });
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 8);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
    });
    el.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });
}
```
(No continuous scroll parallax: it had no reason beyond looking busy, which the taste skill rules out. Screenshots slide in once through `data-reveal="fade"` instead.)

`src/motion/rail.ts`:
```ts
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
```

`src/motion/intro.ts`:
```ts
import { gsap } from 'gsap';
import type { FieldScene } from '../scene/field';

/** Storytelling: points stream in from a wide scatter and settle into clusters, the index forming.
 *  Only the scene moves; the text is still and readable from the first frame. */
export function playIntro(field: FieldScene): void {
  const state = { p: 0 };
  field.setIntro(0);
  gsap.to(state, { p: 1, duration: 1.4, ease: 'expo.out', onUpdate: () => field.setIntro(state.p) });
}
```

`src/motion/index.ts`:
```ts
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
```

In `src/main.ts`, after the field line, add the import `import { initMotion } from './motion';` and the call `initMotion({ motionOK, field, capture: capture !== null });`.

- [ ] **Step 5: Run the tests and the type check**

Run: `npm test`, then `npm run typecheck`. Expected: all pass.

- [ ] **Step 6: Look at every motion**

In the browser pane, at 1440 px:
- the opening settles in about 1.4 s, with the name readable from the first frame
- headings reveal line by line as they enter
- stats count up once
- screenshots slide in once, and tilt toward the mouse
- the rail fills as you scroll
- the nav marks the current section

Screenshot the hero mid-intro and one project mid-reveal.

- [ ] **Step 7: Reduced motion**

With the Playwright tools, emulate `reducedMotion: 'reduce'` (`browser_emulate_media`) and reload. Expected:
- `html[data-motion="still"]`
- one still frame of the cloud, with no animation loop running
- no smooth scroll, no reveals (all text visible at once) and no count-ups (final numbers shown)
- the rail and the nav marking still work

- [ ] **Step 8: Late fonts (Review Focus 4)**

Throttle the network in Playwright (or block the font files for the first load), reload, and check:
- headings split only after the fonts arrive, with no broken or overlapping lines
- after a resize to 375 px, the lines re-split cleanly (`autoSplit`)

- [ ] **Step 9: Checkpoint** (commit only with Chris's yes): `git add -A` then `git commit -m "Motion: intro, reveals, counters, tilt, rail"`

---

### Task 10: Meta, images and hosting config

**Files:**
- Create: `public/favicon.svg`, `public/apple-touch-icon.png`, `public/og.jpg`, `public/field-dark.jpg`, `public/field-light.jpg`, `public/404.html`, `public/_headers`, `wrangler.jsonc`
- Modify: `src/styles/layout.css` (point the static fallback at the two images), `README.md` (deploy steps)

**Interfaces:**
- Consumes: `?capture=field` and `?capture=og` (Tasks 2 and 7)

- [ ] **Step 1: Favicon**

`public/favicon.svg`: a monogram "CTS" (or "C", whichever reads at 16 px) in the display face's shape, accent on the dark background, with a `prefers-color-scheme` style block inside the SVG for light browsers. Check it at 16, 32 and 180 px in the browser pane.

- [ ] **Step 2: Images from the running scene**

Build and preview: `npm run build`, then `npx vite preview --port 4173 --strictPort` in a terminal tab. With the Playwright tools, take three captures:
- **`public/og.jpg`:** viewport 1200 x 630, dark theme, open `http://localhost:4173/?capture=og`, wait 2 s, take a JPEG screenshot at quality 85.
- **`public/field-dark.jpg`:** viewport 1600 x 1000, dark theme, `?capture=field`, the same steps.
- **`public/field-light.jpg`:** as `field-dark.jpg`, in the light theme.

For `public/apple-touch-icon.png`, open `favicon.svg` at 180 x 180 and take a PNG screenshot.

Each file must be under 300 KB. Look at every image before keeping it.

- [ ] **Step 3: Static fallback uses the images**

In `layout.css`, `html[data-motion="static"] .field` uses `url(/field-dark.jpg)` or `url(/field-light.jpg)` by theme (relative to the CSS file in the build, so write it as Vite resolves it from `public/`). Check `?webgl=0` in both themes.

- [ ] **Step 4: 404 page and headers**

`public/404.html`: a standalone page with its own `<!doctype html>`, title "Not found · Chris Thomas Saji", one line ("This page doesn't exist.") and a link home. It uses the same tokens, inlined in a `<style>` tag. That is allowed by its own CSP line below.

`public/_headers`:
```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/404.html
  Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'

/assets/*
  Cache-Control: public, max-age=31536000, immutable
```
Then confirm that the built page needs no inline style or script, so the CSP above holds. Search `dist/index.html` for `<style` and for `<script>` without `src`. Expected: none.

- [ ] **Step 5: Cloudflare config (deploy waits for Chris)**

`wrangler.jsonc`:
```jsonc
// Cloudflare Worker serving dist/ as static assets, with no Worker script (the streamforge-site pattern).
// Before the first deploy: install wrangler pinned, set compatibility_date no newer than its bundled workerd,
// add the custom-domain route Chris chooses, build with SITE_URL set, and run npm run check.
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "chris-portfolio",
  "compatibility_date": "2026-10-20",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page",
    "html_handling": "auto-trailing-slash"
  },
  "workers_dev": false,
  "preview_urls": false
}
```
In `README.md`, add the deploy steps above, written for PowerShell 5.1, ending with `npx wrangler deploy`, and the note that it runs only on Chris's say.

- [ ] **Step 6: Run the full check**

Run: `npm run check`. Expected: it passes, printing the JS size under 250 KB.

- [ ] **Step 7: Checkpoint** (commit only with Chris's yes): `git add -A` then `git commit -m "Meta, images, headers and Cloudflare config"`

---

### Task 11: Verification, review and the private preview

**Files:**
- Modify: whatever the checks below find wrong
- Create: `docs/verification.md` (dated results)

- [ ] **Step 1: The production build in the browser**

`npm run build`, then `npx vite preview --port 4173 --strictPort`, opened in the browser pane. Check each of these, screenshotting each section:
- 1440 x 900, dark and light
- 375 x 812 (`mobile` preset), dark and light
- 768 x 1024
- a landscape phone, 812 x 375

Expected:
- no console errors and no failed requests (`read_network_requests`)
- no horizontal scroll
- every link works: email, LinkedIn, the resume download (it opens, and has no phone number), flowprep.in, proofml.streamforge.co.in

- [ ] **Step 2: Re-run the Review Focus checks on the build**

Task 6, Steps 9 and 10; Task 7, Steps 7 and 8; Task 9, Steps 7 and 8. Record each result in `docs/verification.md`.

- [ ] **Step 3: Performance**

Frame rate as in Task 6, Step 7, while scrolling through every morph and moving the pointer: at refresh rate on this laptop. Then run Lighthouse in mobile simulation against the preview (one heavy job; nothing else running):
```bash
npx lighthouse http://localhost:4173 --only-categories=performance,accessibility,best-practices,seo --form-factor=mobile --screenEmulation.mobile --throttling-method=simulate --output=json --output-path=docs/lighthouse-mobile.json --chrome-flags="--headless=new"
```
Expected: LCP at most 2.5 s, CLS under 0.1, accessibility 100 (or each remaining item explained). Record the scores in `docs/verification.md`. If Lighthouse cannot find Chrome, say so and record what was measured instead.

- [ ] **Step 4: Layout shift while loading (Review Focus 4)**

Taken from the same Lighthouse run: CLS under 0.1.

- [ ] **Step 5: Independent review**

Dispatch one fresh reviewer (`code-reviewer`, model `opus`) on the whole repository against `docs/spec.md` and this plan. Ask it for correctness bugs, accessibility problems, CSP or security gaps, and anything in the copy that breaks the Global Constraints. It should end its report with anything that surprised it. Act on the findings with `receiving-code-review`.

- [ ] **Step 6: Final check**

Run: `npm run check`. Expected: it passes. Then run the taste skill's Final Pre-Flight Check (§14) once more on the built page, in both themes, and record the result in `docs/design.md`.

- [ ] **Step 7: Private preview link**

Publish `dist/` as a private claude.ai artifact so Chris can open it on any device:
- call the Artifact tool's `quickstart` with intent `other`
- then publish `dist/index.html`, with every other file in `dist/` in `files` at its relative path

Open the artifact and check that the scene, the fonts and the resume download work there. If the artifact's sandbox blocks something (WebGL, a download), note it and point Chris to the local preview instead.

- [ ] **Step 8: Hand over**

Give Chris the link, the screenshots, the measured numbers and what was not verified. Ask him for the address before any deploy.
