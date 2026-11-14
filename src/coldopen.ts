/**
 * Cold open, before the title card. The page begins in darkness: one ember
 * drifts up while the score is only a heartbeat and wind. Scrolling pulls
 * the camera back from macro to wide (the wall panel is scaled and re-centred
 * through `shot()`), the dark lifts, and the ember is revealed rising from a
 * shattered chariot wheel carved in the plaster. Then the title arrives.
 *
 * Everything here is driven by scroll progress through a pinned section, so
 * it runs backwards as faithfully as forwards.
 */

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export type ColdOpenShot = {
  scale: number;
  focusX: number;
  focusY: number;
  lift: number;
};

type Ember = {
  x: number;
  y: number;
  vy: number;
  vx: number;
  size: number;
  life: number;
  phase: number;
};

export function mountColdOpen(options: {
  section: HTMLElement;
  reducedMotion: () => boolean;
  onProgress?: (progress: number) => void;
}) {
  const { section, reducedMotion, onProgress } = options;
  const dark = section.querySelector<HTMLElement>(".cold-open-dark")!;
  const canvas = section.querySelector<HTMLCanvasElement>(".cold-open-embers")!;
  const lines = [
    ...section.querySelectorAll<HTMLElement>(".title-card [data-line]"),
  ];
  const context = canvas.getContext("2d");
  const html = document.documentElement;
  let progress = 0;
  let frame = 0;
  let last = performance.now();
  let disposed = false;
  const embers: Ember[] = [];

  const measure = () => {
    const rect = section.getBoundingClientRect();
    const travel = Math.max(1, rect.height - window.innerHeight);
    return clamp(-rect.top / travel);
  };

  // The camera: very close on the wheel's hub at first, then the whole panel.
  const shot = (): ColdOpenShot => {
    if (reducedMotion())
      return { scale: 1, focusX: 0.5, focusY: 0.5, lift: 0.3 };
    const pull = smooth(0.08, 0.7, progress);
    const eased = 1 - Math.pow(1 - pull, 3);
    return {
      scale: 3.2 - 2.2 * eased,
      // The wheel's hub, measured on the carving (uv, y up).
      focusX: 0.49 + 0.01 * eased,
      focusY: 0.53 - 0.03 * eased,
      // The wheel stands fully carved while the dark lifts, then softens to
      // a resting wall that the cursor has to discover, like the reference.
      lift:
        smooth(0.04, 0.3, progress) * (1 - 0.75 * smooth(0.62, 0.92, progress)),
    };
  };

  const spawn = (hero = false) => {
    const w = canvas.width;
    const h = canvas.height;
    embers.push({
      x: hero ? w / 2 : w * (0.35 + Math.random() * 0.3),
      y: hero ? h * 1.02 : h * (0.75 + Math.random() * 0.3),
      vx: (Math.random() - 0.5) * 0.02 * h,
      vy: -(hero ? 0.055 : 0.04 + Math.random() * 0.05) * h,
      size:
        (hero ? 3.2 : 0.8 + Math.random() * 1.4) *
        (window.devicePixelRatio || 1),
      life: hero ? 1e9 : 3 + Math.random() * 4,
      phase: Math.random() * 10,
    });
  };

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round(canvas.clientHeight * ratio);
    embers.length = 0;
    spawn(true);
  };

  const apply = () => {
    const reduced = reducedMotion();
    const darkness = reduced ? 0 : 1 - smooth(0.1, 0.55, progress);
    dark.style.opacity = darkness.toFixed(3);
    canvas.style.opacity = reduced ? "0" : clamp(darkness * 1.4).toFixed(3);
    html.classList.toggle("cold-dark", darkness > 0.45);
    lines.forEach((line, index) => {
      const local = reduced
        ? 1
        : smooth(0.66 + index * 0.05, 0.86 + index * 0.05, progress);
      // Opacity goes through a variable so each line keeps its own resting
      // opacity from the stylesheet (the scroll cue rests at 0.6).
      line.style.setProperty("--in", local.toFixed(3));
      line.style.transform = reduced
        ? ""
        : `translate3d(0, ${((1 - local) * (40 + index * 12)).toFixed(1)}px, 0)`;
    });
    onProgress?.(progress);
  };

  const draw = (dt: number, time: number) => {
    if (!context) return;
    const w = canvas.width;
    const h = canvas.height;
    context.clearRect(0, 0, w, h);
    if (canvas.style.opacity === "0") return;
    if (embers.length < 22 && Math.random() < dt * 3) spawn();
    context.globalCompositeOperation = "lighter";
    for (let i = embers.length - 1; i >= 0; i--) {
      const e = embers[i];
      const hero = e.life > 1e8;
      e.life -= dt;
      e.x += (e.vx + Math.sin(time * 0.9 + e.phase) * 0.012 * h) * dt;
      // The first ember climbs to the hub and hangs there, breathing.
      if (hero) e.y = Math.max(h * 0.5, e.y + e.vy * dt);
      else e.y += e.vy * dt;
      if (!hero && (e.life <= 0 || e.y < -20)) {
        embers.splice(i, 1);
        continue;
      }
      const flicker = 0.75 + 0.25 * Math.sin(time * 7 + e.phase * 3);
      const alpha = hero ? flicker : Math.min(1, e.life / 1.5) * flicker * 0.7;
      const r = e.size * (hero ? 1 + 0.15 * Math.sin(time * 2) : 1);
      const glow = context.createRadialGradient(e.x, e.y, 0, e.x, e.y, r * 9);
      glow.addColorStop(0, `rgba(255,214,150,${alpha})`);
      glow.addColorStop(0.15, `rgba(255,140,50,${alpha * 0.55})`);
      glow.addColorStop(1, "rgba(120,30,0,0)");
      context.fillStyle = glow;
      context.beginPath();
      context.arc(e.x, e.y, r * 9, 0, Math.PI * 2);
      context.fill();
    }
    context.globalCompositeOperation = "source-over";
  };

  const tick = (now: number) => {
    if (disposed) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    progress = measure();
    apply();
    draw(dt, now / 1000);
    frame = requestAnimationFrame(tick);
  };

  resize();
  window.addEventListener("resize", resize);
  progress = measure();
  apply();
  frame = requestAnimationFrame(tick);

  return {
    shot,
    get progress() {
      return progress;
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      html.classList.remove("cold-dark");
    },
  };
}
