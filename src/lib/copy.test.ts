import { describe, expect, it } from 'vitest';
import { copyText } from './copy';

describe('copyText', () => {
  it('writes the text to the clipboard and reports success', async () => {
    const written: string[] = [];
    const clipboard = { writeText: async (text: string) => { written.push(text); } };
    expect(await copyText('chris@example.com', clipboard)).toBe(true);
    expect(written).toEqual(['chris@example.com']);
  });
  it('reports failure when the browser has no clipboard', async () => {
    expect(await copyText('chris@example.com', undefined)).toBe(false);
  });
  it('reports failure when the clipboard refuses, instead of throwing', async () => {
    const clipboard = { writeText: async () => { throw new DOMException('denied', 'NotAllowedError'); } };
    expect(await copyText('chris@example.com', clipboard)).toBe(false);
  });
});
