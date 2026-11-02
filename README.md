# Chris Thomas Saji: portfolio

A one-page portfolio site. Every word is plain HTML; behind it, a real-time
three.js point cloud (an "embedding space") re-forms for each project as the
page scrolls.

- Design spec: `docs/spec.md`
- Build plan: `docs/plan.md`

## Commands

Run each from this folder, one per line (they work in Windows PowerShell 5.1).

```powershell
npm install
```

```powershell
npm run dev
```

```powershell
npm test
```

```powershell
npm run check
```

`npm run check` is the pre-deploy gate: type check, tests, build, then the
copy, phone-number, link and JavaScript-budget checks. Nothing deploys without
it passing.

## Deploy (only on Chris's say)

The site is a Cloudflare Worker that serves `dist/` as static assets
(`wrangler.jsonc`), with security headers from `public/_headers`. Nothing is
deployed yet. When Chris has picked the address and said go:

1. Install Wrangler, pinned to an exact version:

   ```powershell
   npm install --save-exact --save-dev wrangler@<version>
   ```

2. In `wrangler.jsonc`, set `compatibility_date` no newer than that Wrangler's
   bundled workerd, and add the custom-domain route for the chosen address.
3. Build with the address, so link previews get absolute URLs, then run the
   pre-deploy check (it builds again, with the same variable set):

   ```powershell
   $env:SITE_URL = 'https://<the address>'
   ```

   ```powershell
   npm run check
   ```

4. Deploy. `npm run deploy` runs the check again first and stops if it fails, so the check cannot be skipped:

   ```powershell
   npm run deploy
   ```
