import { describe, expect, it } from 'vitest';
import { isRealResize, placeAt, scrollFor } from './place';

const boxes = [
  { top: 0, height: 900 },
  { top: 900, height: 1200 },
  { top: 2300, height: 800 },
];

describe('placeAt', () => {
  it('finds the section under the centre line and how far down it the line falls', () => {
    expect(placeAt(boxes, 1050, 900)).toEqual({ index: 1, ratio: 0.5 });
  });
  it('takes the nearest section when the centre line falls in a gap', () => {
    expect(placeAt(boxes, 1760, 900)).toMatchObject({ index: 2, ratio: 0 });
  });
  it('has no place without sections', () => {
    expect(placeAt([], 0, 900)).toBeNull();
  });
});

describe('scrollFor', () => {
  it('puts the same point of the same section back under the centre line', () => {
    const resized = [{ top: 0, height: 812 }, { top: 812, height: 2400 }, { top: 3300, height: 1500 }];
    expect(scrollFor({ index: 1, ratio: 0.5 }, resized, 812, 10000)).toBe(812 + 1200 - 406);
  });
  it('stays inside the scrollable range', () => {
    expect(scrollFor({ index: 0, ratio: 0 }, boxes, 900, 5000)).toBe(0);
    expect(scrollFor({ index: 2, ratio: 1 }, boxes, 900, 2400)).toBe(2400);
  });
  it('keeps the position when the section is gone', () => {
    expect(scrollFor({ index: 7, ratio: 0.5 }, boxes, 900, 5000)).toBeNull();
  });
});

describe('isRealResize', () => {
  it('counts a width change (a rotation, a resized window)', () => {
    expect(isRealResize({ w: 1440, h: 900 }, { w: 375, h: 900 })).toBe(true);
  });
  it('ignores a phone toolbar sliding away or back (height only, under a quarter)', () => {
    expect(isRealResize({ w: 375, h: 812 }, { w: 375, h: 868 })).toBe(false);
    expect(isRealResize({ w: 375, h: 868 }, { w: 375, h: 812 })).toBe(false);
  });
  it('counts a large height change', () => {
    expect(isRealResize({ w: 812, h: 375 }, { w: 812, h: 700 })).toBe(true);
  });
  it('ignores no change at all', () => {
    expect(isRealResize({ w: 375, h: 812 }, { w: 375, h: 812 })).toBe(false);
  });
});
