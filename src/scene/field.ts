import {
  AdditiveBlending, BufferAttribute, BufferGeometry, Color, DynamicDrawUsage, LineBasicMaterial, LineSegments,
  Matrix4, NormalBlending, PerspectiveCamera, Points, Scene, ShaderMaterial, Vector3, WebGLRenderer,
} from 'three';
import { POINTS, type Quality } from '../lib/quality';
import { mulberry32 } from '../lib/rng';
import { DRIFT_AMP, INTRO_SPREAD, driftAt } from './drift';
import { buildFormation, type Formation, type FormationId } from './formations';
import { nearest, searchSample } from './knn';
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
  setShift(fraction: number): void;
  setColors(c: SceneColors): void;
  start(): void;
  stop(): void;
  onContextLost(cb: () => void): void;
}

const NEIGHBOURS = 12;
const LINK_RADIUS_PX = 150;
const SEARCH_SAMPLE = 500;
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
  let shift = 0;
  let wander = false;
  let running = false;
  let width = 0, height = 0, elapsed = 0, last = 0;
  // The pointer searches a fixed sample of the points, like an index: the full set is so dense that
  // the 12 nearest would sit within a few pixels of the cursor and read as one blob.
  const picked = searchSample(n, SEARCH_SAMPLE);
  const sample = picked.length;
  const world = new Float32Array(sample * 3);
  const screen = new Float32Array(sample * 2);
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
    // Keep points the same size on screen when the camera steps back, and a little larger when
    // there are fewer of them (phones), so the cloud reads as clearly there as on a laptop.
    uniforms.uSize.value = BASE_SIZE * q.dpr * Math.min(2, (camera.position.z / 6) * Math.sqrt(POINTS.full / Math.max(n, 1)));
    applyShift();
    if (!running) draw();
  }
  new ResizeObserver(resize).observe(canvas);

  /** Slide the view so the formation sits right (shift > 0) or left of centre. The pointer query
   *  projects through the same camera, so the links still land on the points. */
  function applyShift(): void {
    if (shift === 0 || width === 0) camera.clearViewOffset();
    else camera.setViewOffset(width, height, -shift * width, 0, width, height);
    camera.updateProjectionMatrix();
  }

  /** CPU copy of what the vertex shader draws for the searched sample (sample j is point picked[j]). */
  function updateWorld(): void {
    const a = from.array as Float32Array, b = to.array as Float32Array;
    const m = uniforms.uMix.value, intro = uniforms.uIntro.value;
    for (let j = 0; j < sample; j++) {
      const o = picked[j] * 3;
      driftAt(phases[o], phases[o + 1], phases[o + 2], elapsed, drift);
      for (let c = 0; c < 3; c++) {
        const scatter = (phases[o + c] - 0.5) * INTRO_SPREAD;
        const settled = a[o + c] + (b[o + c] - a[o + c]) * m + drift[c];
        world[j * 3 + c] = scatter + (settled - scatter) * intro;
      }
    }
  }

  function project(): void {
    mvp.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    const e = mvp.elements;
    for (let i = 0; i < sample; i++) {
      const x = world[i * 3], y = world[i * 3 + 1], z = world[i * 3 + 2];
      const w = e[3] * x + e[7] * y + e[11] * z + e[15];
      if (w <= 0) { screen[i * 2] = NaN; screen[i * 2 + 1] = NaN; continue; }
      screen[i * 2] = ((e[0] * x + e[4] * y + e[8] * z + e[12]) / w * 0.5 + 0.5) * width;
      screen[i * 2 + 1] = (0.5 - (e[1] * x + e[5] * y + e[9] * z + e[13]) / w * 0.5) * height;
    }
  }

  /** On touch screens a query point drifts by itself: through the cloud beside the text on wide
   *  screens, and through the open space above the text on phones (the hero stacks at the bottom there). */
  function wanderAt(): { x: number; y: number } {
    const sx = Math.sin(elapsed * 0.21), sy = Math.sin(elapsed * 0.33);
    return width < 768
      ? { x: width * (0.5 + 0.3 * sx), y: height * (0.3 + 0.1 * sy) }
      : { x: width * (0.62 + 0.25 * sx), y: height * (0.42 + 0.18 * sy) };
  }

  /** Where the pointer's ray meets the z = 0 plane. */
  function pointerWorld(p: { x: number; y: number }): Vector3 {
    ray.set((p.x / width) * 2 - 1, -(p.y / height) * 2 + 1, 0.5).unproject(camera).sub(camera.position).normalize();
    return camera.position.clone().addScaledVector(ray, -camera.position.z / ray.z);
  }

  function updateLinks(): void {
    const q2 = pointer ?? (wander ? wanderAt() : null);
    const show = q2 !== null && uniforms.uDim.value < 0.5 && uniforms.uIntro.value > 0.95;
    let found: number[] = [];
    if (show) {
      updateWorld();
      project();
      found = nearest(screen, q2.x, q2.y, NEIGHBOURS, LINK_RADIUS_PX);
    }
    const h = highlight.array as Float32Array;
    const hits = found.map((j) => picked[j]);
    const wanted = new Set(hits);
    for (const i of hits) lit.set(i, true);
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
    setShift(fraction) {
      if (fraction === shift) return;
      shift = fraction;
      applyShift();
      if (!running) draw();
    },
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
