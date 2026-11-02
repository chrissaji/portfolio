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
