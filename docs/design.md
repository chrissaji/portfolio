# Design record

2026-11-02 · Written with the `design-taste-frontend` skill (Chris: "use taste
skill aswell"). `src/styles/tokens.css` holds the values; this file says why.

## Design read and dials

**Reading this as:** a developer portfolio for recruiters and hiring engineers,
with a dark-tech kinetic language, leaning toward native CSS, GSAP and three.js.

| Dial | Value | Why |
| --- | --- | --- |
| DESIGN_VARIANCE | 7 | The developer preset is 6; one step up so each project gets its own composition |
| MOTION_INTENSITY | 8 | The preset is 5; Chris asked for "more motion or three js", "no need to hold back" |
| VISUAL_DENSITY | 4 | Recruiters skim: airy sections, the depth in lists they can choose to read |

## Type

- **Geist Variable** for display and text, **Geist Mono Variable** for numbers,
  stats, dates and tags (Fontsource 5.3.0, self-hosted). The skill's own
  pairing for this brief. Sans only: no serif anywhere.
- Weight and colour carry hierarchy before size does. The name is the only
  very large text, besides the thesis's "338×".
- No uppercase wide-tracked labels except the hero eyebrow (the eyebrow budget
  is 3; the page uses 1).

## Palette

"Monochrome plus one saturated pop": cool off-black and off-white, one warm
signal orange as the only accent. It reads as the match in a vector search: the
points are cool, the hit is warm. No purple, no `#000`, no `#fff`.

| Token | Dark | Light | Use |
| --- | --- | --- | --- |
| `--bg` | `#0b0d11` | `#eceef1` | Page |
| `--surface` | `rgb(18 21 27 / 0.9)` | `rgb(246 247 249 / 0.92)` | Text panels over the scene |
| `--line` | `#262b35` | `#cfd4db` | Hairlines |
| `--text` | `#e7e9ee` | `#15181e` | Body and headings |
| `--text-muted` | `#9aa1ad` | `#4d5562` | Secondary text |
| `--accent` | `#e9965a` | `#a8501b` | Links, primary button, counters, the search hit |
| `--on-accent` | `#0b0d11` | `#f6f7f9` | Text on the primary button |
| `--field-point` | `#9fb0c8` | `#2a3240` | Points |
| `--field-accent` | `#e9965a` | `#a8501b` | Accent points and the search links |
| `--field-blend` | `additive` | `normal` | Additive light on dark; ink on paper |

Measured contrast: accent on page 8.3:1 (dark), 4.7:1 (light); text on page
above 15:1 in both. Saturation of both accents is under 80%.

## Scales

- **Type** (fluid): `--step--1` 0.8125rem (mono labels), `--step-0` 1rem to
  1.0625rem (body), `--step-1` up to 1.3125rem (lede), `--step-2` up to
  1.875rem (project titles), `--step-3` up to 3rem (section titles),
  `--step-4` 2.75rem to 6.5rem (the name; 3 words, so it may be big),
  `--step-5` 6rem to 15rem (the thesis number).
- **Space:** a 4 px base, `--space-1` 0.25rem to `--space-10` 8rem.
- **Radius, one rule:** controls and tags `--radius-sm` 6px; surfaces (panels,
  screenshots) `--radius` 12px. Nothing else is rounded.
- **Z-index:** field 0, content 1, rail 2, header 10, skip link 100. Nothing
  else sets a z-index.
- **Motion:** `--ease-out` `cubic-bezier(0.16, 1, 0.3, 1)`, `--ease-in-out`
  `cubic-bezier(0.65, 0, 0.35, 1)`; `--dur-1` 120ms (press), `--dur-2` 240ms
  (hover), `--dur-3` 700ms (reveals), `--dur-4` 1200ms (the intro). Only
  `transform` and `opacity` animate, and transitions name their properties.

## Layout families, one per section

The container is 80rem wide with a fluid gutter (1rem at 375 px, 3rem at
1440 px) on a 12-column grid. Every multi-column layout is one column below
768 px, in reading order; the four project layouts start at 1024 px (tablets and landscape phones get one wide column), and so does the scene's sideways shift.

| Section | Family | 1440 px | 375 px |
| --- | --- | --- | --- |
| Hero | Left-aligned stack over the scene | Name, lede and actions in the left 7 columns, a soft scrim behind them, the clusters filling the rest | Same stack, full width; the scene behind a stronger scrim |
| FlowPrep | Asymmetric split | Text 5 columns, screenshot 7; stats under the text, points under the shot | Title, text, shot, stats, points, tags |
| ProofML | Wide band, then two columns | The screenshot as a full-width band first; below it the summary (5) and points (7); stats in a row | Title, text, shot, stats, points |
| ClickMomentz | The scene is the image | A narrow panel at the right edge (4 columns) with the text; the three stats as big mono numbers along the bottom left, straight on the photo-grid formation | Panel full width; stats stacked below |
| Thesis | Number-led | "338×" set huge across 7 columns as the anchor, the two smaller stats under it; title, text and points beside it in 5 | Number first, then the text |
| Experience | Timeline | A vertical rule with dated entries, dates in mono on the left | Dates above each entry |
| Skills | Grouped grid | The eight groups in a 4 × 2 grid | One column |
| Education | Two-up | The two degrees side by side | Stacked |
| Contact | Big and spare | The address set large, left-aligned, over the single point | Same, smaller |

Ruling: the plan gave Education a timeline like Experience; the skill bans a
layout family appearing twice, so Education is a two-up.

**Header.** One line, 64 px, a fade from the page colour to transparent (no
blur: a blur over a canvas that redraws every frame costs GPU on every frame).
Mark, nav, LinkedIn icon, theme toggle. Below 420 px the "CTS" mark is hidden
so the four links and two icons fit on one line.

**Rail.** A 2 px line on the right edge that fills as you scroll.

## Motion, with a reason for each

| Motion | Reason |
| --- | --- |
| Points stream in and settle (intro) | Says "embedding space" before a word is read |
| The cloud re-forms per section | Each project's formation shows what that system does |
| Pointer search: nearest points light up and link | The visitor performs a vector search themselves |
| Headlines reveal line by line | Paces the eye to the section's message |
| Counters count up | Draws the eye to the numbers that matter |
| Screenshots slide in once and tilt toward the mouse | Gives the flat images depth to match the 3D scene |
| Progress rail | Shows where you are on a long page |
| Button press (`translateY(1px)`) | Physical feedback |

No scroll parallax, no letter-spacing animation, no custom cursor, no scroll
cue. Reduced motion turns all of it off and shows one still frame.

## Pre-flight check (skill §14)

Run 2026-11-02 on the page as built in Task 2 (no scene or motion yet), at
1440 × 900 and 375 × 812, both themes. Counts were taken in the browser.

| Box | Result |
| --- | --- |
| Brief inference, dials, design system | Pass: the read and dials above; native CSS, no design-system package (an aesthetic, labelled as one) |
| Redesign mode | Not applicable: a new site |
| Zero em dashes, en dashes as connectors | Pass: 0 and 0 in the rendered text |
| Page theme lock | Pass: one theme across the page, following the system or the toggle |
| Colour consistency lock | Pass: one accent, `--accent`, in every section |
| Shape consistency lock | Pass: only 6px and 12px radii on the page |
| Button contrast, CTA wrap | Pass: every button 44px tall (one line); contrast checker found no text under 4.5:1 in either theme |
| Form contrast | Not applicable: no forms |
| Serif discipline, premium palette | Pass: no serif; not a premium-consumer brief |
| Italic descenders | Not applicable: no italic display type |
| Hero fits, top padding, stack | Pass: name on 1 line, lede 18 words on 3 lines, actions end at 631px of 900; top padding 6rem; 4 elements |
| Eyebrow count | Pass: 1 (the hero's); budget 3 |
| Split-header, floating sub-text | Pass: every section header is a vertical stack |
| Zigzag cap, layout repetition | Pass: nine sections, nine families; only FlowPrep is an image-and-text split |
| Duplicate CTA intent | Pass: three labels, one per intent ("Email me", "Download resume", "LinkedIn") |
| Logo wall, bento | Not applicable: none |
| Copy self-audit | Pass, with three wording notes from `no-ai-slop` for Chris (handover) |
| Motion motivated, motion shown | Each motion has its reason above; built in Tasks 6 to 9, re-checked in Task 11 |
| Marquee | Not applicable: none |
| Navigation | Pass: one line, 64px |
| Long lists | Pass: the skills are a grouped grid, not a long list |
| Real images, no fake UI | Pass: real screenshots of the live sites; the hero visual is the WebGL scene |
| No overlaid pills, photo credits, version footers, micro-meta, hero strip, scoring bars | Pass: none |
| Locale strips | Pass: Kochi appears once in Contact and as a job location, never as a strip |
| Scroll cues, version labels, numbered eyebrows, decorative dots | Pass: none (the list markers are short accent rules, one per bullet) |
| Row borders on every row | Pass: none |
| Content density | Pass: project points are long by choice (the depth for engineers), sitting below each project's short summary |
| No scroll listeners | Pass so far; Task 7 uses ScrollTrigger and Lenis only |
| Reduced motion, dark mode | Dark and light tested; reduced motion re-checked in Tasks 7 and 9 |
| Mobile collapse, viewport | Pass: every grid is one column below 768px; hero `min-height: 100dvh`; no horizontal scroll at 375px |
| Empty, loading, error states | The only one is the scene: still image if WebGL fails or the context is lost (Task 6) |
| Icons | Pass: Phosphor only (LinkedIn, sun, moon, arrow) |
| Core Web Vitals | Measured in Task 11 with Lighthouse |

### Final pre-flight, on the built site with the scene and motion (Task 11)

Re-run 2026-11-02 on the production build, dark and light, 1440 × 900 (counts from the browser):
1 eyebrow; hero 4 elements and an 18-word lede; three CTA labels, one per intent, every button
on one line; radii 6px and 12px only; 0 em dashes and 0 en dashes in the rendered text; no
`transition: all` in any stylesheet (every transition names its properties); no text under 4.5:1
in either theme. Motion: every animation is in the table above, and each is off under reduced
motion. Core Web Vitals (Lighthouse mobile): LCP 1.9 s, CLS 0.019, blocking time 100 ms. All
boxes pass. Changes since the first run: Education became a two-up; the four project layouts
start at 1024 px; stats wrap instead of sitting in fixed columns.
