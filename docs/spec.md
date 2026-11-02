# Portfolio site: design spec

2026-11-02 · Chris Thomas Saji · **Draft, waiting for Chris's review**

## 1. Goal

A one-page public portfolio that wins interviews for AI and software engineer
roles.

- **A recruiter who gives it 30 seconds** leaves knowing what Chris does, what
  he has shipped and how to reach him.
- **A hiring engineer who stays longer** finds the depth (stack, numbers,
  decisions), and a site that is itself proof of craft.

## 2. Decisions so far

| Question      | Decision                                                                                                                                  | Source                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Audience      | Recruiters and hiring managers, AI and software engineer roles                                                                            | Chris: "Use the defaults"                                                                      |
| Code location | `C:\D Drive\GitHub\portfolio`, its own git repo, apart from FlowPrep                                                                      | same                                                                                           |
| Hosting       | Cloudflare static assets on a Worker, as `streamforge-site` does. Address chosen later. A private preview link first. Nothing public without Chris's yes | same                                                                                           |
| Sections      | Intro, selected work, experience, skills, education, contact, resume download                                                             | same                                                                                           |
| Contact       | Email and LinkedIn. No phone number. No GitHub link (none given)                                                                          | same                                                                                           |
| ClickMomentz  | Chris's part, in words, no more detail than the resume. No screenshots                                                                    | same                                                                                           |
| Images        | Screenshots of flowprep.in and proofml.streamforge.co.in. No headshot                                                                     | same                                                                                           |
| Content       | The resume, plus a two-line intro written from its summary                                                                                | same                                                                                           |
| Look and feel | **Rich motion and a real-time 3D scene. Quality first.** Replaces the calm default                                                       | Chris: "needs more motion or three js and all. no need to hold back on quality"                |
| Design rules  | The `design-taste-frontend` skill binds the design: dials VARIANCE 7, MOTION 8, DENSITY 4; its hero, eyebrow, CTA, layout and motion rules (plan, Global Constraints) | Chris: "use taste skill aswell"                                                                |

## 3. The concept: "Embedding space"

Three directions were weighed for the 3D layer:

1. **Embedding space (chosen).** Chris's own work, drawn in light. ClickMomentz
   turns each face into a 512-number vector and finds a guest's photos by
   nearest-neighbour search. Its culling engine clusters them. The site makes
   that visible, so the visual says something true about him.
2. **Neural network graph.** Nodes and pulsing edges. Reads as "AI" at once, but
   it is the stock AI-portfolio picture.
3. **Abstract shader surface.** A flowing gradient blob or terrain. Looks
   premium, says nothing about him.

### 3.1 What the visitor sees

- **Opening.** Points stream in from noise and settle into clusters as the name
  sets in. Under 1.5 s, and the text is readable from the first frame.
- **Hero.** A slowly drifting cloud of glowing points in soft clusters. The
  pointer is a query: the nearest dozen points brighten and connect to it with
  fine lines, like a live vector search. On touch screens a query point wanders
  on its own. Over the scene, four things only (the taste skill's hero rule):
  - the role
  - the name
  - one line of at most 20 words
  - two actions: "Email me" (primary) and "Download resume"

  LinkedIn sits in the header as an icon, and again in Contact.
- **The cloud re-forms as you scroll**, one formation per chapter, morphing on
  the GPU:

| Section                        | Formation                                                                          | What it echoes                |
| ------------------------------ | ---------------------------------------------------------------------------------- | ----------------------------- |
| Hero                           | Soft clusters in 3D                                                                | Faces in a vector index       |
| FlowPrep                       | A constellation: chapter nodes joined by links                                     | Its knowledge map             |
| ProofML                        | Rows of a printed page; a few points flagged, then corrected                       | Proofreading                  |
| ClickMomentz                   | A grid of photo tiles that sorts itself: sharp ones rise, weak ones fade           | The culling engine            |
| Thesis                         | A road network of cameras; a vehicle's pulse travels and impossible matches drop away | Temporal pruning           |
| Experience, skills, education  | Back to soft clusters, dimmed, so the text leads                                   | Calm reading                  |
| Contact                        | The cloud collapses into one bright point                                          | The match                     |

- **Other motion**
  - Smooth, inertial scrolling, synced to the scene.
  - Headlines reveal line by line.
  - Key numbers count up as they come into view (95% match accuracy, up to
    10,000 photos, 338× faster search, about 15,000 tests).
  - Project screenshots slide in once, and tilt slightly toward the mouse. (No
    continuous scroll parallax: under the taste skill every animation needs a
    reason, and that one had none.)
  - Each project has its own layout: a split for FlowPrep, a wide screenshot
    band for ProofML, the scene as the image for ClickMomentz, and a big number
    for the thesis.
  - A thin progress rail shows where you are on the page.
  - Buttons and links answer hover with short, eased moves. No custom cursor:
    it hurts usability.

### 3.2 Rules that keep it fast and readable

- **Every word is real HTML.** The canvas is decoration (`aria-hidden`), so
  search engines, screen readers and a failed WebGL load all get the full page.
- **Text always has contrast.** The scene dims and softens behind text panels.
- **Reduced motion** (the visitor's system setting): no smooth scroll, no
  morphs, no count-ups, a still frame of the cloud.
- **No WebGL, or a weak device:** a static image of the cloud, same content.
- **Phones:** about a third of the points and a lower pixel ratio. The same
  story.
- **Rendering pauses** when the tab is hidden.
- **Budgets:**
  - JavaScript at most 250 KB gzipped.
  - Largest contentful paint at most 2.5 s on a mid-range phone over 4G.
  - A steady 60 fps on a laptop.
- **Light and dark themes**, following the system, with a toggle. Dark is the
  showcase; light is a paper-and-ink version of the same scene.
- **The copy:** no em dashes, and a `no-ai-slop` pass before it ships.

## 4. Content

- **Intro.** "AI / Software Engineer", the name, and one line: "I build
  computer vision that runs in production, backend services that scale, and
  products on large language models." The M.Tech is under Education and
  Claude Code under Skills and FlowPrep. Kochi, Kerala goes in Contact, not
  the hero (the taste skill bans locale strips there).
- **FlowPrep** (flowprep.in). Follows FlowPrep's `docs/marketing.md`:
  - names JEE and NEET together
  - pre-launch, so no user counts, results or competitor names
  - describes the whole product: lessons with interactive diagrams, the AI
    tutor, adaptive practice, revision with the mistake notebook, the weekly
    report

  Chris's role: co-leads a team of two, and owns the platform, product
  surfaces and payments. The engineering: the Claude Code workflow, the AI
  gateway with failover, the LangGraph tutor, about 15,000 tests. The counts
  (99 chapters, 300+ diagrams, 15,000 tests) are re-checked against the
  FlowPrep repo before shipping. Screenshot reused from `streamforge-site`.
- **ProofML** (proofml.streamforge.co.in). As the resume: Malayalam
  proofreading, two-track detection at 100% recall on a curated evaluation
  set, legacy-font decoding, multi-tenant SaaS. "A leading educational
  publisher" stays unnamed. Screenshot reused from `streamforge-site`.
- **ClickMomentz, at Mastermine.** The resume only:
  - about 95% matching accuracy from one selfie
  - events of 2,000 to 10,000 photos
  - a typical event indexed in under an hour
  - 4 microservices, 8+ queues, a team of 6

  No screenshots, and nothing from the `clickmomentz` folder on this machine.
- **Thesis: vehicle re-identification** (VeRi-776). From Chris's thesis records
  (`TemporalReId/docs/ppt/ppt_word_to_word.md`):
  - 99.70% of physically impossible candidate pairs removed (373 of 126,063
    survive), a 338× faster search
  - no retraining
  - mAP 82.1% → 82.5%, with Rank-1 held at 97.4%

  The journal paper, "Physics-Aware Rule-Based Temporal Filtering for Scalable
  Vehicle Re-Identification" (Chris Thomas Saji, Jithin Mathews), is accepted
  at IJITCS (MECS Press), camera-ready stage. It isn't on the resume (open
  point 1).
- **Experience.** A timeline: Mastermine (Aug 2025 to now), OpenText DevOps
  intern (Aug 2023 to Feb 2024).
- **Skills.** The resume's eight groups, as compact rows.
- **Education.** Rajagiri M.Tech (May 2026, CGPA 8.41), Jain University B.Tech
  (Jun 2023, CGPA 8.02).
- **Contact.** Email, LinkedIn, and the resume download: a copy with the phone
  number truly removed (redacted, not covered with a white box).
- **Meta.**
  - Title and description.
  - A preview image for shared links (a still of the hero).
  - A monogram favicon.

## 5. Technical design

- **Vite + TypeScript, no UI framework.** The page is static HTML; TypeScript
  adds the scene and the motion. React Three Fiber was considered: nothing here
  needs React, and it costs load time.
- **Libraries:**
  - three.js for the scene
  - GSAP with ScrollTrigger and SplitText for scroll-driven motion and text
    reveals
  - Lenis for smooth scrolling

  Versions and GSAP's licence are checked against official docs while the
  plan is written.
- **The scene.**
  - One `THREE.Points` with a custom shader.
  - Each formation is a `Float32Array` of positions generated in code, with no
    model files.
  - The vertex shader blends the current formation into the next by scroll
    progress; per-point noise keeps it alive.
  - The pointer query finds nearest neighbours in screen space on the CPU (at
    most about 15,000 points, well under a millisecond) and draws the links
    with `LineSegments`.
- **Fonts** self-hosted as woff2, chosen during the build with the
  `design-taste-frontend` skill. No third-party requests at runtime. A content
  security policy in `_headers` allows only the site itself.
- **Layout:**

```
portfolio/
  index.html          all copy
  src/main.ts         boot: theme, smooth scroll, motion, scene
  src/scene/          renderer, points, shaders, formations, pointer query
  src/motion/         text reveals, counters, parallax, progress rail
  src/styles/         tokens, layout, sections
  public/             fonts, images, resume PDF, og.png, favicons, _headers
  scripts/check.mjs   the pre-deploy check
  wrangler.jsonc      Cloudflare static assets
  docs/               spec.md, plan.md
```

## 6. How it gets checked

- **`npm run check`**, which deploy refuses to skip. It fails when:
  - the type check or the build fails
  - the JavaScript is over budget
  - the copy has an em dash
  - a link or image is broken
  - a phone number appears in the built site or the PDF
- **In the browser:**
  - phone (375 px) and desktop widths
  - both themes
  - reduced motion on, and WebGL off
  - a clean console
  - frame rate and LCP measured in the page
- **Screenshots** for Chris at each stage.

## 7. Not in this version

Blog, CMS, contact form, analytics, headshot, GitHub link, more than one page,
custom cursor.

## 8. Open points (default in brackets)

1. **The paper.** Mention it in the thesis card? [Yes, as "Accepted at IJITCS",
   since the camera-ready files say it was accepted. Say if it's out, and I'll
   link it.]
2. **The thesis numbers** above. [Use them as written.]
3. **The resume download** without the phone number. [Yes.]
4. **The address.** [Decide at deploy time.]
