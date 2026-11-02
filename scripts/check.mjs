// The pre-deploy check. `npm run check` builds first, then runs this; deploy refuses to ship if it fails.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { JS_BUDGET_BYTES, RESUME_FILE, cssUrls, dashProblems, filesIn, jsGzipBytes, localRefs, phoneProblems, userText } from './check-lib.mjs';

const dist = resolve('dist');
const problems = [];
const html = readFileSync(join(dist, 'index.html'), 'utf8');

for (const page of ['index.html', '404.html']) {
  const path = join(dist, page);
  if (existsSync(path)) for (const p of dashProblems(userText(readFileSync(path, 'utf8')))) problems.push(`${page}: ${p}`);
}
for (const file of filesIn(dist).filter((f) => /\.(html|js|css|svg|txt|json|webmanifest)$/.test(f))) {
  for (const p of phoneProblems(readFileSync(file, 'utf8'))) problems.push(`${relative(dist, file)}: ${p}`);
}

// The repository too: a number in any tracked text file would stay in git history for good.
// Test files are skipped on purpose; they hold stand-in numbers to prove the check works.
const tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n')
  .filter((f) => f && f !== 'package-lock.json' && !/\.test\.m?[jt]s$/.test(f) && /\.(md|html|css|m?js|ts|jsonc?|py|txt|svg)$/.test(f));
for (const file of tracked) {
  for (const p of phoneProblems(readFileSync(file, 'utf8'))) problems.push(`${file} (in the repository): ${p}`);
}

const pdf = join(dist, RESUME_FILE);
if (!existsSync(pdf)) problems.push(`${RESUME_FILE} is missing from the build`);
else {
  const text = execFileSync('python', ['-I', resolve('scripts/pdf-text.py'), pdf], { encoding: 'utf8' });
  for (const p of phoneProblems(text)) problems.push(`${RESUME_FILE}: ${p}`);
}

for (const ref of localRefs(html)) {
  const path = join(dist, decodeURIComponent(ref.replace(/^\.?\//, '').split(/[?#]/)[0]));
  if (!existsSync(path)) problems.push(`index.html links to a missing file: ${ref}`);
}

for (const css of filesIn(dist).filter((f) => f.endsWith('.css'))) {
  for (const ref of cssUrls(readFileSync(css, 'utf8'))) {
    if (!existsSync(join(dirname(css), decodeURIComponent(ref.split(/[?#]/)[0])))) problems.push(`${relative(dist, css)} points at a missing file: ${ref}`);
  }
}

const js = jsGzipBytes(dist);
if (js > JS_BUDGET_BYTES) problems.push(`JavaScript is ${(js / 1024).toFixed(1)} KB gzipped, over the ${JS_BUDGET_BYTES / 1024} KB budget`);

if (problems.length) {
  console.error(`Check failed:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`Check passed. JavaScript ${(js / 1024).toFixed(1)} KB gzipped of ${JS_BUDGET_BYTES / 1024} KB.`);
