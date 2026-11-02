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

/** WebGL drawn on the CPU (no GPU, or a blocked driver) runs this scene at a frame or two a second. */
export function isSoftwareRenderer(renderer: string): boolean {
  return /swiftshader|llvmpipe|softpipe|software rasterizer|basic render driver/i.test(renderer);
}

/** True when the median frame took longer than limitMs (50 ms: under 20 frames a second). */
export function isTooSlow(frameMs: readonly number[], limitMs = 50): boolean {
  if (frameMs.length < 20) return false;
  const sorted = [...frameMs].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] > limitMs;
}

function hasWebGL2(doc: Document): boolean {
  try {
    const gl = doc.createElement('canvas').getContext('webgl2');
    if (!gl) return false;
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return !isSoftwareRenderer(renderer);
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
