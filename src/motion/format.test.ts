import { describe, expect, it } from 'vitest';
import { formatCount, readCountFormat } from './format';

describe('formatCount', () => {
  it('groups thousands', () => expect(formatCount(10000)).toBe('10,000'));
  it('adds a prefix and a suffix', () => {
    expect(formatCount(338, { suffix: '×' })).toBe('338×');
    expect(formatCount(15000, { prefix: '~' })).toBe('~15,000');
    expect(formatCount(10000, { prefix: 'up to ' })).toBe('up to 10,000');
  });
  it('keeps the decimals asked for', () => expect(formatCount(99.7, { decimals: 1, suffix: '%' })).toBe('99.7%'));
  it('rounds while counting up', () => expect(formatCount(42.6)).toBe('43'));
  it('starts from zero', () => expect(formatCount(0, { suffix: '%' })).toBe('0%'));
});

describe('readCountFormat', () => {
  it('reads the data attributes', () => {
    expect(readCountFormat({ count: '99.7', decimals: '1', suffix: '%' })).toEqual({ target: 99.7, format: { decimals: 1, prefix: '', suffix: '%' } });
  });
  it('returns null when the number is missing or not a number', () => {
    expect(readCountFormat({})).toBeNull();
    expect(readCountFormat({ count: 'many' })).toBeNull();
  });
});
