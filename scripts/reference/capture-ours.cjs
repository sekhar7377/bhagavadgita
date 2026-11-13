const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1440, height: 810 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) });
  await p.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => document.querySelector('#relief').dataset.reliefState === 'ready', null, { timeout: 30000 });
  await p.waitForTimeout(1500);
  // slow strokes over the chariot, like the hand movement in the recording
  const pts = [[420, 620], [520, 520], [640, 430], [760, 380], [860, 420], [820, 520], [700, 560], [600, 500]];
  for (let k = 0; k < pts.length - 1; k++) for (let i = 0; i <= 14; i++) { await p.mouse.move(pts[k][0] + (pts[k + 1][0] - pts[k][0]) * i / 14, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * i / 14); await p.waitForTimeout(25); }
  await p.screenshot({ path: out + '/o2-moving.png' });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: out + '/o2-settled.png' });
  await p.close();
  const r = await b.newPage({ viewport: { width: 1440, height: 810 } }); await r.emulateMedia({ reducedMotion: 'reduce' });
  await r.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' }); await r.waitForTimeout(3500); await r.screenshot({ path: out + '/o2-still.png' });
  console.log(errs.slice(0, 5).join('\n'));
  await b.close();
})();
