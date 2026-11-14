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

// One wall for the whole page: every [data-scene] section anchors a carved
// panel on a single fixed canvas, in story order.
const host = document.querySelector<HTMLElement>("#relief")!;
const sceneAnchors = [
  ...document.querySelectorAll<HTMLElement>("[data-scene]"),
];
for (const anchor of sceneAnchors)
  anchor.style.setProperty(
    "--fallback",
    `url("/relief/${anchor.dataset.scene}-fallback.webp")`,
  );
let relief: ReturnType<typeof mountRelief> | undefined;
try {
  relief = mountRelief(
    host,
    sceneAnchors.map((anchor) => ({ name: anchor.dataset.scene!, anchor })),
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
    if (!paused) relief?.reveal();
  },
});
lenis?.on("scroll", ({ velocity }: { velocity: number }) =>
  sound.setEnergy(Math.abs(velocity) / 45),
);
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

// Trailing dot: follows the pointer over the opening wall with a soft lag.
const dot = document.querySelector<HTMLElement>(".cursor-dot")!;
const hero = document.querySelector<HTMLElement>(".hero")!;
const dotTarget = { x: 0, y: 0, active: false };
const dotPosition = { x: 0, y: 0 };
let dotFrame = 0;
function moveDot() {
  dotPosition.x += (dotTarget.x - dotPosition.x) * 0.06;
  dotPosition.y += (dotTarget.y - dotPosition.y) * 0.06;
  dot.style.transform = `translate(${dotPosition.x}px, ${dotPosition.y}px)`;
  const settled =
    Math.abs(dotTarget.x - dotPosition.x) +
      Math.abs(dotTarget.y - dotPosition.y) <
    0.2;
  dotFrame = settled ? 0 : requestAnimationFrame(moveDot);
}
hero.addEventListener("pointermove", (event) => {
  if (event.pointerType !== "mouse" || paused) return;
  const bounds = hero.getBoundingClientRect();
  dotTarget.x = event.clientX - bounds.left;
  dotTarget.y = event.clientY - bounds.top;
  if (!dotTarget.active) {
    dotTarget.active = true;
    dotPosition.x = dotTarget.x;
    dotPosition.y = dotTarget.y;
    dot.style.opacity = "1";
  }
  if (!dotFrame) dotFrame = requestAnimationFrame(moveDot);
});
hero.addEventListener("pointerleave", () => {
  dotTarget.active = false;
  dot.style.opacity = "0";
});

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
observer.observe(document.querySelector(".hero")!);
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
    sound.dispose();
    darkObserver.disconnect();
    observer.disconnect();
  });
