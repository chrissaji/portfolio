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
