# Verification

2026-11-02 · Chris's laptop (Windows 11, Intel Iris Xe) · the production build (`npm run build`,
served by `vite preview`). Browsers: Chrome via Playwright, headless with the GPU on
(`--use-angle=d3d11`), unless a line says otherwise.

## Budgets

| Check | Target | Measured |
| --- | --- | --- |
| JavaScript, gzipped | ≤ 250 KB | 187.9 KB (`npm run check`); three.js loads in its own chunk after the page |
| Largest contentful paint, mobile (Lighthouse 13.5.0, simulated 4G, mid-range phone) | ≤ 2.5 s | 1.9 s |
| Layout shift, mobile (Lighthouse) | < 0.1 | 0.019 |
| Layout shift with every font file delayed 2.5 s | < 0.1 | 0.015 at 1440 px, 0.0001 at 375 px |
| Frame rate, scrolling through every morph with the pointer moving, 1440 px at 2× | 60 fps | 276 fps uncapped (headless has no vsync); 95th percentile frame 7 ms, worst 22 ms |
| Lighthouse mobile scores (final build, two runs) | | Performance 94 and 99 (blocking time 260 ms and 70 ms: run-to-run variance of the simulated phone), Accessibility 100, Best practices 100, SEO 100 |

The report JSON is not kept in the repo (543 KB); rerun with the command in `docs/plan.md`, Task 11.

## Viewports

1440 × 900 (dark, light), 375 × 812 (dark, light, touch), 768 × 1024, 812 × 375, plus
1024, 1100, 1280 and 1920 wide for the stat layouts:

- no console errors, no failed requests, no horizontal scroll at any size
- no stat number overlaps another, runs out of its list, or covers a panel (measured from the boxes)
- quality tier: `full` on desktop and tablet, `lite` on the phone (5,000 points, pixel ratio 1.5)

## Links

- `mailto:chris.saji001@gmail.com`, `https://www.linkedin.com/in/chris-thomas-saji`
- `https://flowprep.in` → 200, `https://proofml.streamforge.co.in` → 200
- the resume download → 200, `application/pdf`, 98,665 bytes; no phone number in its text, metadata or bytes;
  reads name, then "chris.saji001@gmail.com | www.linkedin.com/in/chris-thomas-saji", then the summary

## Review Focus (docs/plan.md)

| # | Check | Result |
| --- | --- | --- |
| 1 | Tab, Tab, Tab, Enter on "Work" | Focus on `#work`, which sits 80 px from the top (below the 64 px header, as native anchors do); the next Tab lands inside Work, also when pressed during the smooth scroll, and focus is never pulled back afterwards. The skip link and every nav link do the same; with reduced motion too. The fade-in blocks stay readable by screen readers before they are revealed (opacity only, never visibility: hidden) |
| 2 | Thesis centred at 1440, resize to 375 | Still on the thesis, formation `roadNetwork`, canvas resized. Also kept on resize: ClickMomentz, Skills, FlowPrep, Contact, ProofML, the hero (7 of 7 with smooth scroll, 7 of 7 with reduced motion). A phone toolbar sliding away and back mid-swipe (375 × 812 ↔ 868, touch): the page never moved backwards (0 px), from the thesis or from the hero |
| 3 | WebGL context lost on purpose | `data-motion="static"`, the canvas hidden, the still image shown; the scene does not restart when the tab comes back |
| 4 | Fonts delayed 2.5 s | No line split before the fonts arrive; no overlapping or over-wide lines at 1440 or after a resize to 375; CLS as above |
| 5 | Light theme | Points drawn as ink on paper (normal blending); the contrast checker finds no text under 4.5:1 in either theme |

## Fallbacks

- `?webgl=0`: static mode, the right still image per theme, the three.js chunk never requested.
- Software WebGL (Chrome forced onto SwiftShader): detected before the scene loads, so static mode.
- A slow machine (frames held to about 70 ms): the scene stops and the still image shows within about 5 s of load.
- Reduced motion: `still`, one frame of the cloud, no smooth scroll, no splits or reveals, final numbers shown, rail and nav marking still work.
- JavaScript off (the build over HTTP): fully styled, every word present, the theme toggle hidden.

## Security headers

The `_headers` content security policy was injected on the built site: no violation on the page
(full motion and reduced motion, every section, the theme toggle) or on `404.html`.
Cloudflare's own handling of `_headers` is checked only after a deploy.

## The pre-deploy check

`npm run check` (and `npm run deploy`, which runs it first): types, 111 unit tests, the build, then em and
en dashes in `index.html` and `404.html`, a phone number in any served file, the resume PDF or any
tracked file in the repository, missing files linked from the page or its stylesheets, and the
JavaScript budget. Each guard was shown to fail on a planted fault (an em dash in an `alt`, the phone
number in `docs/plan.md`, a removed `field-light.jpg`).

## Not verified here

- A real phone and Safari or Firefox: only Chrome was used. Firefox reports a generic WebGL renderer
  name, so its software-rendering case is left to the frame-rate guard.
- A real 60 Hz display: headless Chrome has no vsync, so frame rate is reported uncapped.
- The deployed site on Cloudflare (no deploy yet).
