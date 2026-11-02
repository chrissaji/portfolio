import { defineConfig, type Plugin } from 'vite';

/** Absolute URLs for link previews exist only once the address is known: SITE_URL=https://… npm run build. */
function siteMeta(): Plugin {
  return {
    name: 'site-meta',
    transformIndexHtml(html) {
      const url = process.env.SITE_URL?.replace(/\/$/, '');
      if (!url) return html;
      const tags = [
        `<link rel="canonical" href="${url}/">`,
        `<meta property="og:url" content="${url}/">`,
        `<meta property="og:image" content="${url}/og.jpg">`,
        `<meta name="twitter:image" content="${url}/og.jpg">`,
      ].join('\n    ');
      return html.replace('</head>', `    ${tags}\n  </head>`);
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [siteMeta()],
  // three.js alone is about 540 KB before compression; the real budget (250 KB gzipped) is enforced by scripts/check.mjs.
  build: { target: 'es2022', assetsInlineLimit: 0, chunkSizeWarningLimit: 600 },
});
