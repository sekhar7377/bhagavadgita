// Uncovered stretches of wall between carvings (desktop or phone size).
import { chromium } from "@playwright/test";
const [base, w, h] = process.argv.slice(2);
const browser = await chromium.launch();
for (const path of ["", "hastinapura/", "sabha/", "vana/", "kurukshetra/", "svarga/"]) {
  const page = await browser.newPage({ viewport: { width: +w, height: +h } });
  await page.goto(base + path);
  const r = await page.evaluate(() => {
    const vw = innerWidth, vh = innerHeight, aspect = vw / vh;
    const zoom = aspect >= 1 ? Math.max(1, aspect / 2.15) : 0.44 + 0.26 * aspect;
    const visibleH = (2 * 15 * Math.tan((15 * Math.PI) / 180)) / zoom;
    const panelPx = (8.04 / visibleH) * vh;
    const footer = document.querySelector("footer");
    const end = footer ? footer.getBoundingClientRect().top + scrollY : document.documentElement.scrollHeight;
    const spans = [...document.querySelectorAll("[data-scene]")].filter((e) => e.getBoundingClientRect().height > 0)
      .map((e) => { const b = e.getBoundingClientRect(); const c = b.top + scrollY + b.height / 2; return [c - panelPx / 2, c + panelPx / 2, e.dataset.scene]; })
      .sort((a, b) => a[0] - b[0]);
    const gaps = []; let cursor = 0, prev = "(top)";
    for (const [a, b, name] of spans) { if (a - cursor > 60) gaps.push({ a: Math.round(cursor), b: Math.round(a), after: prev, before: name }); if (b > cursor) { cursor = b; prev = name; } }
    if (end - cursor > 60) gaps.push({ a: Math.round(cursor), b: Math.round(end), after: prev, before: "(footer)" });
    for (const g of gaps) {
      const inside = [...document.querySelectorAll("main > *, main > section > *")].filter((el) => { const r = el.getBoundingClientRect(); const t = r.top + scrollY; return r.height > 0 && t < g.b && t + r.height > g.a && !el.querySelector("[data-scene]") && !el.matches("[data-scene]"); });
      g.what = [...new Set(inside.map((el) => (el.id ? "#" + el.id : "." + String(el.className).split(" ")[0])))].slice(0, 3).join(" ");
      g.px = g.b - g.a;
    }
    return { panelPx: Math.round(panelPx), gaps };
  });
  console.log("== /" + path, "panel", r.panelPx);
  for (const g of r.gaps) console.log(`   ${g.px}px  after ${g.after} → before ${g.before}   [${g.what}]`);
  await page.close();
}
await browser.close();
