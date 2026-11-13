/**
 * Floating type, after the reference: each line of a statement rises into
 * place as it enters the screen, then drifts at its own pace while the page
 * scrolls, so a paragraph breathes apart and settles rather than sitting
 * flat. Text stays real DOM text; only transforms and opacity change.
 */

type Floating = { element: HTMLElement; lines: HTMLElement[] };

/** Split an element's <br>-separated lines (including inside <em>) into spans. */
function splitLines(element: HTMLElement) {
  const lines: string[] = [""];
  const escape = (text: string) =>
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const walk = (node: Node, wrap: string | null) => {
    if (node.nodeName === "BR") {
      lines.push("");
      return;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      const text = escape(node.textContent ?? "").replace(/\s+/g, " ");
      if (!text.trim() && !lines[lines.length - 1]) return;
      lines[lines.length - 1] += wrap ? `<${wrap}>${text}</${wrap}>` : text;
      return;
    }
    const tag = node.nodeName.toLowerCase();
    node.childNodes.forEach((child) => walk(child, tag === "em" ? "em" : wrap));
  };
  element.childNodes.forEach((child) => walk(child, null));
  element.innerHTML = lines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<span class="line">${line}</span>`)
    .join("");
  return [...element.querySelectorAll<HTMLElement>(".line")];
}

export function mountFloatingType(elements: Iterable<HTMLElement>) {
  const items: Floating[] = [...elements].map((element) => ({
    element,
    lines: splitLines(element),
  }));
  let paused = false;
  let frame = 0;
  const start = performance.now();

  const clear = () => {
    for (const { lines } of items)
      for (const line of lines) {
        line.style.transform = "";
        line.style.opacity = "";
      }
  };

  const tick = (now: number) => {
    const time = (now - start) / 1000;
    const height = window.innerHeight;
    for (const { element, lines } of items) {
      const rect = element.getBoundingClientRect();
      if (rect.bottom < -height * 0.5 || rect.top > height * 1.5) continue;
      // 0 as the block reaches the lower fifth of the screen, 1 a little later.
      const enter = (height * 0.92 - rect.top) / (height * 0.45);
      // Distance of the block's centre from the screen centre, -1..1.
      const offset = (rect.top + rect.height / 2 - height / 2) / height;
      const middle = (lines.length - 1) / 2;
      lines.forEach((line, index) => {
        const local = Math.min(1, Math.max(0, enter * 1.3 - index * 0.13));
        const eased = 1 - Math.pow(1 - local, 3);
        // Lines spread apart slightly away from centre and gather at it.
        const drift = offset * (index - middle) * 14;
        const breathe = Math.sin(time * 0.6 + index * 0.9) * 1.6;
        const rise = (1 - eased) * (56 + index * 14);
        line.style.transform = `translate3d(0, ${(rise + drift + breathe).toFixed(2)}px, 0)`;
        line.style.opacity = eased.toFixed(3);
      });
    }
    frame = requestAnimationFrame(tick);
  };

  const run = () => {
    if (!frame && !paused) frame = requestAnimationFrame(tick);
  };
  run();

  return {
    setPaused(value: boolean) {
      paused = value;
      if (paused) {
        cancelAnimationFrame(frame);
        frame = 0;
        clear();
      } else run();
    },
    dispose() {
      cancelAnimationFrame(frame);
      frame = 0;
      clear();
    },
  };
}
