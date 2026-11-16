/**
 * Everything that keeps the wall working outside the happy path:
 * - leaving the tab and coming back (sound pauses and resumes; the carving
 *   and the smooth scroll pick up without a jump);
 * - restored from the back/forward cache;
 * - losing and regaining the connection (a quiet notice, and the offline
 *   cache in public/sw.js keeps every page and carving already seen);
 * - any painting that fails to load (a framed, readable note instead of a
 *   broken image, and one retry when the connection returns).
 */
type Hooks = {
  sound: { enabled: boolean; enable(): Promise<void>; disable(): void };
  wake(): void;
};

export function mountResilience({ sound, wake }: Hooks) {
  // --- leaving and returning ------------------------------------------------
  let soundWasOn = false;
  let hiddenAt = 0;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      hiddenAt = performance.now();
      soundWasOn = sound.enabled;
      if (soundWasOn) sound.disable();
    } else {
      wake();
      // Browsers let audio resume without a new gesture once it was allowed.
      if (soundWasOn) void sound.enable().catch(() => undefined);
      void hiddenAt;
    }
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) wake();
  });

  // --- connection notice ------------------------------------------------------
  const notice = document.createElement("p");
  notice.className = "net-notice";
  notice.setAttribute("role", "status");
  notice.setAttribute("aria-live", "polite");
  document.body.append(notice);
  let hideTimer = 0;
  const show = (text: string, stay: boolean) => {
    window.clearTimeout(hideTimer);
    notice.textContent = text;
    notice.classList.add("is-shown");
    if (!stay)
      hideTimer = window.setTimeout(
        () => notice.classList.remove("is-shown"),
        4000,
      );
  };
  window.addEventListener("offline", () =>
    show(
      "You are offline. Scenes you have already seen stay on the wall.",
      true,
    ),
  );
  window.addEventListener("online", () => {
    show("Back online.", false);
    retryImages();
  });
  if (!navigator.onLine)
    show(
      "You are offline. Scenes you have already seen stay on the wall.",
      true,
    );

  // --- paintings that fail to load ------------------------------------------
  const failed = new Set<HTMLImageElement>();
  const fail = (image: HTMLImageElement) => {
    if (failed.has(image)) return;
    failed.add(image);
    const frame =
      image.closest<HTMLElement>(".art-wrap") ?? image.parentElement!;
    frame.classList.add("art-missing");
    if (!frame.querySelector(".art-error")) {
      const message = document.createElement("span");
      message.className = "art-error";
      message.textContent =
        image.alt || "This painting could not load. The story continues below.";
      frame.append(message);
    }
  };
  const retryImages = () => {
    failed.forEach((image) => {
      failed.delete(image);
      const frame =
        image.closest<HTMLElement>(".art-wrap") ?? image.parentElement!;
      frame.classList.remove("art-missing");
      frame.querySelector(".art-error")?.remove();
      const src = image.src;
      image.src = "";
      image.src = src;
    });
  };
  document
    .querySelectorAll<HTMLImageElement>("main img:not(.battlefield img)")
    .forEach((image) => {
      image.addEventListener("error", () => fail(image));
      if (image.complete && image.naturalWidth === 0 && image.src) fail(image);
    });

  // --- offline cache ----------------------------------------------------------
  if (import.meta.env.PROD && "serviceWorker" in navigator)
    window.addEventListener("load", () => {
      void navigator.serviceWorker
        .register(`${import.meta.env.BASE_URL}sw.js`, {
          scope: import.meta.env.BASE_URL,
        })
        .catch(() => undefined);
    });
}
