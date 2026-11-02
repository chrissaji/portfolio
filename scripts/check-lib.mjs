import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

export const JS_BUDGET_BYTES = 250 * 1024;
export const RESUME_FILE = 'Chris_Thomas_Saji_Resume.pdf';
const VISIBLE_ATTRS = /\b(?:alt|title|aria-label|placeholder|content)="([^"]*)"/g;
// An Indian mobile number: optional +91, then ten digits starting 6 to 9, spaces or hyphens
// allowed between digits, and no digit, comma or point either side (so figures like 126,063
// and the 14-digit PDF dates do not match). The real number is never written in this repo.
const MOBILE = /(?<![\d,.])(?:\+?91[\s-]?)?[6-9](?:[\s-]?\d){9}(?![\d,.])/g;

/** Everything a visitor can read: text nodes plus the attributes browsers and link previews show. */
export function userText(html) {
  const attrs = [...html.matchAll(VISIBLE_ATTRS)].map((m) => m[1]);
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  return [body, ...attrs].join('\n')
    .replace(/&mdash;|&#8212;|&#x2014;/gi, '—')
    .replace(/&ndash;|&#8211;|&#x2013;/gi, '–');
}

function around(text, at) {
  return text.slice(Math.max(0, at - 30), at + 30).replace(/\s+/g, ' ');
}

export function dashProblems(text) {
  const out = [];
  for (const m of text.matchAll(/—/g)) out.push(`em dash: "${around(text, m.index)}"`);
  for (const m of text.matchAll(/–/g)) {
    const before = text[m.index - 1] ?? '';
    const after = text[m.index + 1] ?? '';
    if (!(/\d/.test(before) && /\d/.test(after))) out.push(`en dash outside a number range: "${around(text, m.index)}"`);
  }
  return out;
}

export function phoneProblems(text) {
  return [...text.matchAll(MOBILE)].map((m) => `a mobile number: "${around(text, m.index)}"`);
}

export function localRefs(html) {
  const refs = new Set();
  for (const m of html.matchAll(/\b(src|href|srcset)="([^"]+)"/g)) {
    for (const part of m[2].split(',')) {
      const url = part.trim().split(/\s+/)[0];
      if (!url || /^(?:[a-z]+:|#|\/\/)/i.test(url)) continue;
      refs.add(url);
    }
  }
  return [...refs];
}

/** Local files a stylesheet points at with url(), relative to the stylesheet. */
export function cssUrls(css) {
  const refs = new Set();
  for (const m of css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)) {
    const url = m[2].trim();
    if (!url || /^(?:[a-z]+:|#|\/\/)/i.test(url)) continue;
    refs.add(url);
  }
  return [...refs];
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

export function filesIn(dir) {
  return walk(dir);
}

export function jsGzipBytes(dir) {
  return walk(dir).filter((f) => f.endsWith('.js')).reduce((sum, f) => sum + gzipSync(readFileSync(f)).length, 0);
}
