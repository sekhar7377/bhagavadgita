import "@fontsource/tinos/latin-ext-400.css";
import "@fontsource/tinos/latin-400.css";
import "@fontsource/tinos/latin-400-italic.css";
import "@fontsource/arimo/latin-ext-400.css";
import "@fontsource/arimo/latin-400.css";
import "./style.css";
import Lenis from "lenis";
import { mountRelief } from "./relief";
import { mountFloatingType } from "./float";
import { runLoader } from "./loader";
import { createSound } from "./sound";
import { mountColdOpen } from "./coldopen";

// One wall for the whole page: every [data-scene] section anchors a carved
// panel on a single fixed canvas, in story order.
const host = document.querySelector<HTMLElement>("#relief")!;
const sceneAnchors = [
  ...document.querySelectorAll<HTMLElement>("[data-scene]"),
];
for (const anchor of sceneAnchors)
  anchor.style.setProperty(
    "--fallback",
    `url("${import.meta.env.BASE_URL}relief/${anchor.dataset.scene}-fallback.webp")`,
  );
// The cold open drives its own panel's camera (scale, focus, lift).
const reducedMotionQuery = matchMedia("(prefers-reduced-motion: reduce)");
const coldOpen = mountColdOpen({
  section: document.querySelector<HTMLElement>(".cold-open")!,
  reducedMotion: () => reducedMotionQuery.matches,
});
let relief: ReturnType<typeof mountRelief> | undefined;
try {
  relief = mountRelief(
    host,
    sceneAnchors.map((anchor) => ({
      name: anchor.dataset.scene!,
      anchor,
      shot: anchor.dataset.scene === "wheel" ? coldOpen.shot : undefined,
    })),
  );
} catch {
  host.dataset.fallback = "true";
}
const markFallback = () =>
  document.documentElement.classList.toggle(
    "relief-fallback",
    host.dataset.fallback === "true",
  );
markFallback();
new MutationObserver(markFallback).observe(host, {
  attributes: true,
  attributeFilter: ["data-fallback"],
});

// Smooth, weighted scrolling like the reference; the document still scrolls
// natively underneath, so keyboard, anchors and assistive tech keep working.
let lenis: Lenis | undefined;
const floating = mountFloatingType(
  document.querySelectorAll<HTMLElement>("[data-float]"),
);
// No visible motion control: the operating-system preference decides. With
// reduced motion the whole carving is shown at rest instead of animating.
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
let paused = motionPreference.matches;
function setMotion(value: boolean) {
  paused = value;
  relief?.setPaused(value);
  floating.setPaused(value);
  if (value) {
    lenis?.destroy();
    lenis = undefined;
  } else if (!lenis)
    lenis = new Lenis({ autoRaf: true, lerp: 0.085, anchors: true });
  document.documentElement.classList.toggle("motion-paused", value);
}
motionPreference.addEventListener("change", (event) =>
  setMotion(event.matches),
);
setMotion(paused);

// --- intro and sound -------------------------------------------------------
const sound = createSound();
const loader = document.querySelector<HTMLElement>("#loader")!;
const loaderSound = loader.querySelector<HTMLButtonElement>(".loader-sound")!;
const soundToggle = document.querySelector<HTMLButtonElement>(".sound-toggle")!;
sound.onChange((on) => {
  soundToggle.setAttribute("aria-pressed", String(on));
  soundToggle.setAttribute("aria-label", on ? "Sound on" : "Sound off");
  loaderSound.setAttribute("aria-pressed", String(on));
  loaderSound.textContent = on ? "Sound enabled" : "Click to enable sound";
});
// As in the reference, a click anywhere on the intro turns sound on.
loader.addEventListener("click", () => void sound.enable());
soundToggle.addEventListener("click", () => void sound.toggle());
lenis?.stop();
runLoader({
  loader,
  relief: host,
  minimumMs: paused ? 300 : 1600,
  onDone() {
    lenis?.start();
    soundToggle.hidden = false;
    // The carving surfaces once as the intro lifts, then settles back.
    // (The cold open starts in darkness, so the wall is not surfaced here.)
  },
});
lenis?.on("scroll", ({ velocity }: { velocity: number }) =>
  sound.setEnergy(Math.abs(velocity) / 45),
);
// In the dark there is only a heartbeat and wind; the drone arrives with
// the title card and the heartbeat fades as the camera pulls back.
let lastMix = -1;
const mixFrame = () => {
  const p = coldOpen.progress;
  if (Math.abs(p - lastMix) > 0.005) {
    lastMix = p;
    const heart = 1 - Math.min(1, Math.max(0, (p - 0.35) / 0.4));
    const drone = Math.min(1, Math.max(0, (p - 0.45) / 0.4));
    sound.setMix(heart, drone);
  }
  requestAnimationFrame(mixFrame);
};
requestAnimationFrame(mixFrame);
// The toggle turns light over the dark closing sections.
const darkObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries)
      darkSections.set(entry.target, entry.isIntersecting);
    soundToggle.classList.toggle(
      "on-dark",
      [...darkSections.values()].some(Boolean),
    );
  },
  { rootMargin: "-94% 0px 0px 0px" },
);
const darkSections = new Map<Element, boolean>();
document
  .querySelectorAll(".reflection, footer")
  .forEach((section) => darkObserver.observe(section));

// Trailing dot: follows the pointer over each opening screen with a soft lag.
function trailDot(zone: HTMLElement) {
  const dot = zone.querySelector<HTMLElement>(".cursor-dot");
  if (!dot) return;
  const target = { x: 0, y: 0, active: false };
  const position = { x: 0, y: 0 };
  let frame = 0;
  const move = () => {
    position.x += (target.x - position.x) * 0.06;
    position.y += (target.y - position.y) * 0.06;
    dot.style.transform = `translate(${position.x}px, ${position.y}px)`;
    const settled =
      Math.abs(target.x - position.x) + Math.abs(target.y - position.y) < 0.2;
    frame = settled ? 0 : requestAnimationFrame(move);
  };
  zone.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || paused) return;
    const bounds = zone.getBoundingClientRect();
    target.x = event.clientX - bounds.left;
    target.y = event.clientY - bounds.top;
    if (!target.active) {
      target.active = true;
      position.x = target.x;
      position.y = target.y;
      dot.style.opacity = "1";
    }
    if (!frame) frame = requestAnimationFrame(move);
  });
  zone.addEventListener("pointerleave", () => {
    target.active = false;
    dot.style.opacity = "0";
  });
}
document.querySelectorAll<HTMLElement>(".cursor-zone").forEach(trailDot);

const dialog = document.querySelector<HTMLDialogElement>("#navigation")!;
const menuButton = document.querySelector<HTMLButtonElement>(".menu-toggle")!;
menuButton.addEventListener("click", () => {
  dialog.showModal();
  document.documentElement.classList.add("menu-open");
  menuButton.setAttribute("aria-expanded", "true");
  relief?.setPaused(true);
  lenis?.stop();
});
let pendingDestination: HTMLElement | null = null;
function closeMenu() {
  dialog.close();
}
dialog.querySelector(".menu-close")!.addEventListener("click", closeMenu);
dialog.addEventListener("close", () => {
  document.documentElement.classList.remove("menu-open");
  menuButton.setAttribute("aria-expanded", "false");
  relief?.setPaused(paused);
  lenis?.start();
  const destination = pendingDestination;
  pendingDestination = null;
  if (destination) {
    destination.setAttribute("tabindex", "-1");
    destination.focus({ preventScroll: true });
    if (lenis) lenis.scrollTo(destination);
    else destination.scrollIntoView({ behavior: "instant" });
  } else menuButton.focus({ preventScroll: true });
});
dialog.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    pendingDestination = document.querySelector<HTMLElement>(link.hash)!;
    closeMenu();
    history.pushState(null, "", link.hash);
  });
});
const header = document.querySelector<HTMLElement>(".site-header")!;
const observer = new IntersectionObserver(
  ([entry]) => header.classList.toggle("past-hero", !entry.isIntersecting),
  { threshold: 0.05 },
);
observer.observe(document.querySelector(".cold-open")!);
// Keep missing artwork from collapsing the reserved exhibition window.
const artwork = document.querySelector<HTMLImageElement>(".battlefield img")!;
function artworkFailed() {
  if (artwork.parentElement!.querySelector(".art-error")) return;
  artwork.hidden = true;
  const message = document.createElement("p");
  message.className = "art-error";
  message.textContent =
    "The battlefield image could not load. The story continues below.";
  artwork.parentElement!.append(message);
}
artwork.addEventListener("error", artworkFailed);
if (artwork.complete && artwork.naturalWidth === 0) artworkFailed();
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    relief?.dispose();
    lenis?.destroy();
    floating.dispose();
    coldOpen.dispose();
    sound.dispose();
    darkObserver.disconnect();
    observer.disconnect();
  });
