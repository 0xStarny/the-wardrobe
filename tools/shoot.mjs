// Photograph The Crew wearing every theme.
//
//   1. run The Crew locally (npm start in its repo, it listens on 127.0.0.1:5210)
//   2. node tools/shoot.mjs            (needs Playwright: npm i -D playwright)
//
// For each theme it opens the Start page and the app shell, loads the theme after the app's own
// stylesheets, and saves themes/<id>/start.jpg and themes/<id>/app.jpg. Nothing is installed in the app:
// the app shell is opened with an empty local session, so it shows the "team is not running" state.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = process.env.CREW_URL || 'http://localhost:5210';
const only = process.argv.slice(2);
const themes = JSON.parse(readFileSync(path.join(root, 'themes/index.json'), 'utf8')).filter((t) => !only.length || only.includes(t.id));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
const page = await ctx.newPage();

// an empty local session, so app.html shows its shell instead of sending us to Start
await page.goto(base + '/start.html');
await page.evaluate(async () => {
  const m = await import('/js/team-core.js');
  m.createTeamCore().adopt({ model: 'preview', engine: 'none', kind: 'local', live: false });
});

async function shot(url, theme, file) {
  await page.goto(base + url, { waitUntil: 'networkidle' });
  if (theme.id !== 'original') await page.addStyleTag({ path: path.join(root, theme.css) });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(root, 'themes', theme.id, file), type: 'jpeg', quality: 86 });
}

for (const t of themes) {
  await shot('/start.html', t, 'start.jpg');
  await shot('/app.html', t, 'app.jpg');
  console.log('shot', t.id);
}
await browser.close();
