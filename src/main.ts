import "@fontsource/tinos/latin-ext-400.css";
import "@fontsource/tinos/latin-400.css";
import "@fontsource/tinos/latin-400-italic.css";
import "@fontsource/arimo/latin-ext-400.css";
import "@fontsource/arimo/latin-400.css";
import "./style.css";
import { mountRelief } from "./relief";

const host = document.querySelector<HTMLElement>("#relief")!;
let relief: ReturnType<typeof mountRelief> | undefined;
try {
  relief = mountRelief(host);
} catch {
  host.dataset.fallback = "true";
}
// No visible motion control: the operating-system preference decides. With
// reduced motion the whole carving is shown at rest instead of animating.
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
let paused = motionPreference.matches;
function setMotion(value: boolean) {
  paused = value;
  relief?.setPaused(value);
  document.documentElement.classList.toggle("motion-paused", value);
}
motionPreference.addEventListener("change", (event) =>
  setMotion(event.matches),
);
setMotion(paused);

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
  const destination = pendingDestination;
  pendingDestination = null;
  if (destination) {
    destination.setAttribute("tabindex", "-1");
    destination.focus({ preventScroll: true });
    destination.scrollIntoView({ behavior: paused ? "instant" : "smooth" });
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
    observer.disconnect();
  });
