const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY }, args: ['--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 810 } });
  const p = await ctx.newPage();
  const reqs = []; p.on('response', r => reqs.push(r.status() + ' ' + r.url()));
  await p.goto('https://immersive-g.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.locator('.introLoader.main').waitFor({ state: 'attached', timeout: 40000 });
  await p.waitForFunction(() => {
    const l = document.querySelector('.introLoader.main'); const bg = l?.querySelector('.introLoader__bg'); const w = l?.querySelector('.introLoader__baseline > div');
    return l && !l.classList.contains('lockScroll') && bg && w && +getComputedStyle(bg).opacity < 0.01 && +getComputedStyle(w).opacity < 0.01;
  }, undefined, { timeout: 90000 });
  await p.waitForTimeout(6000);
  await p.screenshot({ path: out + '/rest.png' });
  // every visible text-bearing or svg element in the viewport with computed style
  const els = await p.evaluate(() => {
    const res = [];
    for (const e of document.querySelectorAll('body *')) {
      const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
      if (r.width === 0 || r.height === 0 || r.bottom < 0 || r.top > innerHeight || cs.visibility === 'hidden' || cs.display === 'none') continue;
      const own = [...e.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' ');
      if (!own && !['svg', 'canvas', 'BUTTON', 'A'].includes(e.tagName)) continue;
      res.push({ tag: e.tagName, cls: (e.className.baseVal ?? e.className).toString().slice(0, 80), text: own.slice(0, 80), x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), font: cs.fontFamily, size: cs.fontSize, weight: cs.fontWeight, ls: cs.letterSpacing, lh: cs.lineHeight, color: cs.color, op: cs.opacity, tt: cs.textTransform, cursor: cs.cursor, mix: cs.mixBlendMode });
    }
    return res;
  });
  fs.writeFileSync(out + '/elements.json', JSON.stringify(els, null, 1));
  fs.writeFileSync(out + '/page.html', await p.content());
  const path = (i) => [250 + i * 14, 560 - i * 5 + Math.sin(i / 4) * 40];
  for (let i = 0; i <= 60; i++) { const [x, y] = path(i); await p.mouse.move(x, y); await p.waitForTimeout(30); }
  await p.screenshot({ path: out + '/sweep.png' });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: out + '/stationary.png' });
  await p.mouse.move(900, 300, { steps: 30 }); await p.waitForTimeout(200);
  await p.screenshot({ path: out + '/sweep2.png' });
  fs.writeFileSync(out + '/requests.txt', reqs.join('\n'));
  await b.close();
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
