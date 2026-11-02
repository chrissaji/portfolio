import type { FormationId } from './formations';

/** `shift` moves the formation sideways, as a fraction of the viewport width (positive is right),
 *  so it sits in the part of the section the text leaves open. */
export interface Stop { at: number; formation: FormationId; dim: number; shift?: number }
export interface SectionBox { top: number; height: number; formation: FormationId; dim: number; shift?: number }
export interface SceneState { from: FormationId; to: FormationId; t: number; dim: number; shift: number }

const smooth = (x: number) => x * x * (3 - 2 * x);

/** The scene's state at scroll position y: which formation it is leaving, which it is reaching, and how far along. */
export function stateAt(y: number, stops: readonly Stop[]): SceneState {
  if (stops.length === 0) throw new Error('stateAt needs at least one stop');
  const first = stops[0], last = stops[stops.length - 1];
  const hold = (s: Stop): SceneState => ({ from: s.formation, to: s.formation, t: 0, dim: s.dim, shift: s.shift ?? 0 });
  if (stops.length === 1 || y <= first.at) return hold(first);
  if (y >= last.at) return hold(last);
  let i = 0;
  while (i < stops.length - 2 && stops[i + 1].at <= y) i++;
  const a = stops[i], b = stops[i + 1];
  const span = b.at - a.at;
  const t = span <= 0 ? 1 : smooth(Math.min(1, Math.max(0, (y - a.at) / span)));
  const sa = a.shift ?? 0, sb = b.shift ?? 0;
  return { from: a.formation, to: b.formation, t, dim: a.dim + (b.dim - a.dim) * t, shift: sa + (sb - sa) * t };
}

/** A stop sits where its section is centred in the viewport, clamped to the scrollable range. */
export function stopsFromSections(sections: readonly SectionBox[], viewport: number, maxScroll: number): Stop[] {
  return sections
    .map((s) => ({ at: Math.min(maxScroll, Math.max(0, s.top + s.height / 2 - viewport / 2)), formation: s.formation, dim: s.dim, shift: s.shift ?? 0 }))
    .sort((p, q) => p.at - q.at);
}
