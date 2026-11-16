// Where does the page have no carving behind it? Prints uncovered stretches.
import { chromium } from "@playwright/test";
const base = process.argv[2];
const browser = await chromium.launch();
for (const vp of [{ width: 1440, height: 810 }, { width: 390, height: 844 }]) {
  for (const path of ["", "hastinapura/", "sabha/", "vana/", "kurukshetra/", "svarga/"]) {
    const page = await browser.newPage({ viewport: vp });
    await page.goto(base + path);
    const r = await page.evaluate(() => {
      const H = document.documentElement.scrollHeight;
      const vw = innerWidth, vh = innerHeight;
      const aspect = vw / vh;
      // panel height on screen per the engine's camera rule
      const zoom = aspect >= 1 ? Math.max(1, aspect / 2.15) : 0.44 + 0.26 * aspect;
      const visibleH = 2 * 15 * Math.tan((30 / 2) * Math.PI / 180) / zoom; // world units
      const panelPx = (8.04 / visibleH) * vh;
      const spans = [...document.querySelectorAll("[data-scene]")].filter(e => e.getBoundingClientRect().height > 0).map(e => {
        const b = e.getBoundingClientRect(); const c = b.top + scrollY + b.height / 2;
        return [c - panelPx / 2, c + panelPx / 2, e.dataset.scene];
      }).sort((a, b) => a[0] - b[0]);
      const gaps = []; let cursor = 0;
      for (const [a, b] of spans) { if (a - cursor > 20) gaps.push([Math.round(cursor), Math.round(a)]); cursor = Math.max(cursor, b); }
      if (H - cursor > 20) gaps.push([Math.round(cursor), H]);
      const total = gaps.reduce((s, [a, b]) => s + b - a, 0);
      const labels = gaps.map(([a, b]) => { const el = document.elementFromPoint(vw / 2, 1); window.scrollTo(0, (a + b) / 2 - vh / 2); const m = document.elementFromPoint(vw / 2, vh / 2)?.closest("section,footer,div"); return `${a}-${b}(${b - a}px:${m?.className?.toString().slice(0, 30) || m?.tagName})`; });
      return { H, panelPx: Math.round(panelPx), uncoveredPct: Math.round(100 * total / H), gaps: labels.slice(0, 12) };
    });
    console.log(vp.width, "/" + path, JSON.stringify(r));
    await page.close();
  }
}
await browser.close();
