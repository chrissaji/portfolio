import { describe, expect, it } from 'vitest';
import { cssUrls, dashProblems, localRefs, phoneProblems, userText } from './check-lib.mjs';

describe('userText', () => {
  it('keeps visible text and visitor-facing attributes, and drops scripts and styles', () => {
    const t = userText('<style>p{}</style><p>Hi <b>there</b></p><img alt="A photo"><script>const x = "—";</script>');
    expect(t).toContain('Hi');
    expect(t).toContain('there');
    expect(t).toContain('A photo');
    expect(t).not.toContain('—');
  });
  it('decodes dash entities', () => {
    expect(userText('<p>a &mdash; b &#8211; c</p>')).toContain('—');
    expect(userText('<p>a &mdash; b &#8211; c</p>')).toContain('–');
  });
  it('reads meta content and aria-labels', () => {
    expect(userText('<meta name="description" content="Fast — sites"><a aria-label="Back — top">x</a>')).toMatch(/Fast — sites[\s\S]*Back — top/);
  });
});

describe('dashProblems', () => {
  it('flags every em dash', () => {
    expect(dashProblems('one — two — three')).toHaveLength(2);
  });
  it('allows an en dash between digits', () => {
    expect(dashProblems('2,000–10,000 photos')).toEqual([]);
  });
  it('flags an en dash anywhere else', () => {
    expect(dashProblems('Aug 2025 – now')).toHaveLength(1);
  });
});

describe('phoneProblems', () => {
  // A stand-in number: the real one is never written into this repository.
  it('finds a mobile number however it is spaced', () => {
    expect(phoneProblems('call +91 98765 43210 today')).not.toEqual([]);
    expect(phoneProblems('call +91-98765-43210 today')).not.toEqual([]);
  });
  it('finds any Indian mobile number', () => {
    expect(phoneProblems('ring 9876543210')).not.toEqual([]);
  });
  it('ignores the figures on the page', () => {
    expect(phoneProblems('373 of 126,063 pairs, 338x faster, 2,000 to 10,000 photos, CGPA 8.41, 16,000+ tests')).toEqual([]);
  });
  it('ignores longer digit runs such as PDF dates', () => {
    expect(phoneProblems('D:20261102101530Z')).toEqual([]);
  });
});

describe('localRefs', () => {
  it('lists local src, href and srcset targets once each, skipping web, mail and in-page links', () => {
    const html = '<link href="./assets/a.css"><a href="#work">w</a><a href="mailto:x@y.z">m</a><a href="https://flowprep.in">f</a>'
      + '<img src="./img/p-800.webp" srcset="./img/p-800.webp 800w, ./img/p-1600.webp 1600w">'
      + '<meta property="og:image" content="https://site/og.jpg">';
    expect(localRefs(html).sort()).toEqual(['./assets/a.css', './img/p-1600.webp', './img/p-800.webp']);
  });
});

describe('cssUrls', () => {
  it('lists local url() targets in a stylesheet, skipping data, web and in-page ones', () => {
    const css = ".a{background:url(../field-dark.jpg) center/cover}.b{background:url('../img/x.webp')}"
      + '.c{src:url("./font.woff2") format("woff2")}.d{background:url(data:image/png;base64,AAA)}'
      + '.e{background:url(https://site/x.png)}.f{mask:url(#m)}';
    expect(cssUrls(css).sort()).toEqual(['../field-dark.jpg', '../img/x.webp', './font.woff2']);
  });
});
