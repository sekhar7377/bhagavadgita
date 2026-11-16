/**
 * The entry title on the home page, after the reference title sequence:
 * each letter of MAHĀBHĀRATA flickers through the scripts of India
 * (Devanagari, Bengali, Gurmukhi, Gujarati, Odia, Tamil, Telugu, Kannada,
 * Malayalam) and locks into place, left to right, on the white plaster.
 * The subtitle follows, and only when the title is complete and the wall
 * has loaded does the small "Enter with sound" line appear. A tap or click
 * anywhere enters.
 *
 * It plays on every load of the home page.
 */
// NFC keeps Ā as one letter (a decomposed macron would get its own slot).
const TITLE = "MAHĀBHĀRATA".normalize("NFC");
// A handful of letters from each script, all shaped like the sound "ma",
// "ha", "bha", "ra", "ta", "ka" and so on, so the flicker reads as the
// same word passing through many tongues.
const GLYPHS = [
  "म",
  "ह",
  "भ",
  "र",
  "त",
  "क",
  "ध", // Devanagari
  "ম",
  "হ",
  "ভ",
  "র",
  "ত",
  "ক", // Bengali
  "ਮ",
  "ਹ",
  "ਭ",
  "ਰ", // Gurmukhi
  "મ",
  "હ",
  "ભ",
  "ર", // Gujarati
  "ମ",
  "ହ",
  "ଭ",
  "ର", // Odia
  "ம",
  "ஹ",
  "ர",
  "த",
  "க", // Tamil
  "మ",
  "హ",
  "భ",
  "ర",
  "త", // Telugu
  "ಮ",
  "ಹ",
  "ಭ",
  "ರ",
  "ತ", // Kannada
  "മ",
  "ഹ",
  "ഭ",
  "ര",
  "ത", // Malayalam
];
export function mountEntry(options: {
  loader: HTMLElement;
  reducedMotion: boolean;
  /** Is the page ready (wall loaded)? Polled until true. */
  ready: () => boolean;
  /** Called on the entering click, from inside the user gesture. */
  onEnter: () => void;
}) {
  const { loader, reducedMotion, ready, onEnter } = options;
  loader.classList.add("is-entry");
  const word = loader.querySelector<HTMLElement>(".entry-word")!;
  const button = loader.querySelector<HTMLButtonElement>(".entry-enter")!;
  word.textContent = "";
  const slots = [...TITLE].map((letter) => {
    const span = document.createElement("span");
    span.className = "entry-letter";
    span.textContent = reducedMotion ? (letter === "Ā" ? "A" : letter) : "";
    if (reducedMotion && letter === "Ā") span.classList.add("has-macron");
    span.dataset.final = letter;
    word.append(span);
    return span;
  });

  let complete = reducedMotion;
  let entered = false;
  const start = performance.now();
  // Each letter starts flickering a little after the one before it and locks
  // after it has passed through a few scripts.
  const STAGGER = 260;
  const FLICKER = 700;
  const STEP = 75;
  let lastSwap = 0;
  const pick = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

  const tick = (now: number) => {
    if (entered) return;
    const t = now - start;
    if (!complete) {
      const swap = now - lastSwap > STEP;
      if (swap) lastSwap = now;
      let locked = 0;
      slots.forEach((span, i) => {
        const begin = 300 + i * STAGGER;
        if (t < begin) return;
        if (t >= begin + FLICKER) {
          if (!span.classList.contains("is-locked")) {
            // Ā is drawn as A with a centred bar: the font's own macron sits
            // off-centre at display sizes.
            const final = span.dataset.final!;
            span.textContent = final === "Ā" ? "A" : final;
            span.classList.toggle("has-macron", final === "Ā");
            span.classList.add("is-locked");
          }
          locked++;
        } else {
          span.classList.add("is-live");
          if (swap) span.textContent = pick();
        }
      });
      if (locked === slots.length) {
        complete = true;
        loader.classList.add("is-titled");
      }
    }
    if (complete && ready() && !loader.classList.contains("is-ready")) {
      loader.classList.add("is-ready");
      button.hidden = false;
    }
    requestAnimationFrame(tick);
  };
  if (reducedMotion) loader.classList.add("is-titled");
  requestAnimationFrame(tick);

  const enter = (event: Event) => {
    if (entered || !loader.classList.contains("is-ready")) return;
    event.stopPropagation();
    entered = true;
    onEnter();
  };
  // A click anywhere on the finished title page enters, as does the button
  // (which keyboard and screen-reader users reach directly).
  button.addEventListener("click", enter);
  loader.addEventListener("click", enter);

  return {
    /** The loader may only lift after the visitor has entered. */
    isOpen: () => entered,
  };
}
