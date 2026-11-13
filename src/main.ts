import "@fontsource/cormorant-garamond/latin-ext-400.css";
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/latin-400-italic.css";
import "@fontsource/dm-sans/latin-400.css";
import "./style.css";
import { mountRelief } from "./relief";

const host = document.querySelector<HTMLElement>("#relief")!;
let relief: ReturnType<typeof mountRelief> | undefined;
try {
  relief = mountRelief(host);
} catch {
  host.dataset.fallback = "true";
}
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
let paused = motionPreference.matches;
const motion = document.querySelector<HTMLButtonElement>(".motion-toggle")!;
function setMotion(value: boolean) {
  paused = value;
  relief?.setPaused(value);
  motion.setAttribute("aria-pressed", String(value));
  motion.querySelector(".motion-label")!.textContent = value
    ? "Resume motion"
    : "Pause motion";
  motion.querySelector(".motion-symbol")!.classList.toggle("is-paused", value);
  document.documentElement.classList.toggle("motion-paused", value);
}
motion.addEventListener("click", () => setMotion(!paused));
motionPreference.addEventListener("change", (event) =>
  setMotion(event.matches),
);
setMotion(paused);

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
