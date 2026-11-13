import * as THREE from "three";

/**
 * Original procedural bas-relief study, not a production character sculpture.
 * Every motif is sampled into the mesh's height attribute. A persistent field
 * changes actual vertex depth, and lighting follows the deformed surface gradient.
 * No image, opacity mask, or pointer spotlight substitutes for the geometry.
 */
export function mountRelief(container: HTMLElement) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let paused = reducedMotion.matches;
  let disposed = false;
  let contextLost = false;
  let frame = 0;
  let lastTime = 0;
  let elapsed = 0;
  let fullReveal = 0;
  let visible = true;
  let pointerActive = false;
  const pointer = new THREE.Vector2(0.5, 0.5);
  const fieldWidth = 160;
  const fieldHeight = 104;
  const values = new Float32Array(fieldWidth * fieldHeight);
  const bytes = new Uint8Array(values.length);
  let renderer: THREE.WebGLRenderer;

  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "low-power",
    });
  } catch {
    container.dataset.reliefState = "unavailable";
    container.dataset.fallback = "true";
    return { dispose() {}, setPaused() {}, reveal() {} };
  }

  container.dataset.reliefState = "ready";
  delete container.dataset.fallback;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
  renderer.setClearColor("#e9e6dd");
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.domElement.style.cssText =
    "display:block;width:100%;height:100%;pointer-events:none";
  container.appendChild(renderer.domElement);
  const texture = new THREE.DataTexture(
    bytes,
    fieldWidth,
    fieldHeight,
    THREE.RedFormat,
    THREE.UnsignedByteType,
  );
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;

  const worldWidth = 15.5;
  const worldHeight = 10;
  const geometry = new THREE.PlaneGeometry(worldWidth, worldHeight, 310, 200);
  const positions = geometry.getAttribute("position");
  const sculpt = new Float32Array(positions.count);
  const incisions = new Float32Array(positions.count);
  const gauss = (d: number, width: number) =>
    Math.exp(-(d * d) / (width * width));
  const segmentDistance = (
    x: number,
    y: number,
    ax: number,
    ay: number,
    bx: number,
    by: number,
  ) => {
    const dx = bx - ax,
      dy = by - ay;
    const t = Math.max(
      0,
      Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)),
    );
    return Math.hypot(x - ax - t * dx, y - ay - t * dy);
  };

  function wheel(x: number, y: number) {
    const dx = x - 4.35,
      dy = y + 2.42;
    const r = Math.hypot(dx, dy),
      a = Math.atan2(dy, dx);
    let h = 0.23 * gauss(r - 2.47, 0.13) + 0.32 * gauss(r - 2.2, 0.17);
    h += 0.12 * gauss(r - 1.97, 0.055) + 0.09 * gauss(r - 2.68, 0.045);
    h += 0.34 * gauss(r, 0.36) + 0.15 * gauss(r - 0.52, 0.09);
    if (r > 0.36 && r < 2.22) {
      const spokeDistance = (Math.abs(Math.sin(a * 6)) * r) / 6;
      const end =
        Math.min(1, (r - 0.36) / 0.18) * Math.min(1, (2.22 - r) / 0.16);
      h += 0.23 * gauss(spokeDistance, 0.065) * end;
      h += 0.07 * gauss(spokeDistance, 0.125) * end;
    }
    // Radial bead carving within the wheel's outside band.
    h +=
      0.06 * gauss(r - 2.43, 0.1) * Math.pow(Math.max(0, Math.cos(a * 56)), 4);
    return h;
  }

  function lotus(x: number, y: number) {
    const dx = x + 4.05,
      dy = y - 2.44;
    const r = Math.hypot(dx, dy),
      a = Math.atan2(dy, dx);
    let h = 0;
    for (let ring = 0; ring < 2; ring++) {
      const count = ring === 0 ? 9 : 7;
      const offset = ring === 0 ? 0.15 : 0.42;
      const length = ring === 0 ? 1.5 : 0.95;
      for (let j = 0; j < count; j++) {
        const angle = (j / count) * Math.PI * 2 + offset;
        const along = dx * Math.cos(angle) + dy * Math.sin(angle);
        const across = -dx * Math.sin(angle) + dy * Math.cos(angle);
        if (along > 0 && along < length) {
          const shape = Math.sin((Math.PI * along) / length);
          const width = 0.38 * Math.pow(shape, 0.8);
          const petal = Math.max(
            0,
            1 - Math.pow(across / Math.max(width, 0.001), 2),
          );
          h = Math.max(h, petal * shape * (ring ? 0.45 : 0.32));
          // The central incised vein stays shallower than the rounded petal.
          if (Math.abs(across) < 0.025) h -= 0.016 * shape;
        }
      }
    }
    h += 0.3 * gauss(r, 0.29);
    h += 0.025 * gauss(r - 0.16, 0.05) * (1 + Math.cos(a * 8));
    return h;
  }

  function bow(x: number, y: number) {
    // A carved recurve bow in the left margin, with a fine taut string.
    const by = y + 1.05;
    const bowX = -4.75 - 0.74 * Math.cos(by * 0.7) + 0.12 * Math.cos(by * 2.1);
    const endFade = Math.max(0, Math.min(1, (3.05 - Math.abs(by)) / 0.24));
    let h = 0.24 * gauss(x - bowX, 0.088) * endFade;
    h += 0.075 * gauss(x - bowX, 0.18) * endFade;
    h += 0.045 * gauss(x + 4.15, 0.021) * endFade;
    h +=
      0.04 *
      gauss(x - bowX, 0.12) *
      gauss(by, 0.48) *
      (0.5 + 0.5 * Math.cos(by * 68));
    return h;
  }

  function leaves(x: number, y: number) {
    let h = 0;
    // A restrained botanical frieze meets the lotus at the top edge.
    const branch = -2.4 + 0.28 * (y - 3.1) * (y - 3.1);
    h += 0.07 * gauss(x - branch, 0.045) * gauss(y - 4.3, 1.2);
    for (let j = 0; j < 5; j++) {
      const cy = 3.1 + j * 0.46;
      const side = j % 2 ? 1 : -1;
      const cx = -2.4 + 0.28 * (cy - 3.1) * (cy - 3.1);
      const dx = (x - cx) * side,
        dy = y - cy;
      const u = dx * 0.84 + dy * 0.54;
      const v = -dx * 0.54 + dy * 0.84;
      const envelope = Math.max(
        0,
        1 - Math.pow((u - 0.38) / 0.47, 2) - Math.pow(v / 0.15, 2),
      );
      h += 0.18 * envelope;
    }
    return h;
  }

  function conch(x: number, y: number) {
    const dx = x - 4.9,
      dy = y - 3.45;
    const u = dx * 0.85 - dy * 0.53,
      v = dx * 0.53 + dy * 0.85;
    const q = Math.pow((u + 0.25) / 1.12, 2) + Math.pow(v / 0.63, 2);
    let h = 0.28 * Math.pow(Math.max(0, 1 - q), 0.75);
    const r = Math.hypot(u + 0.55, v);
    const angle = Math.atan2(v, u + 0.55);
    h +=
      0.08 *
      gauss(r - (0.12 + (angle + Math.PI) * 0.042), 0.055) *
      Math.max(0, 1 - q);
    const tip = segmentDistance(u, v, 0.35, 0, 1.12, -0.14);
    h += 0.18 * gauss(tip, 0.13);
    return h;
  }

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i),
      y = positions.getY(i);
    const raw =
      wheel(x, y) + lotus(x, y) + bow(x, y) + leaves(x, y) + conch(x, y);
    // Small tool marks are modeled, not a surface photo texture.
    const mark =
      Math.sin(x * 91 + Math.sin(y * 32)) * Math.sin(y * 67 + x * 12);
    const grain =
      Math.sin(x * 219.3 + y * 97.1) * Math.sin(x * 73.7 - y * 173.3);
    sculpt[i] = raw * (1 + mark * 0.008) + grain * 0.0003;
    incisions[i] = Math.min(raw * 1.9, 1);
  }
  for (let i = 0; i < positions.count; i++) positions.setZ(i, sculpt[i]);
  geometry.computeVertexNormals();
  for (let i = 0; i < positions.count; i++) positions.setZ(i, 0);
  geometry.setAttribute("aSculpt", new THREE.BufferAttribute(sculpt, 1));
  geometry.setAttribute("aCarving", new THREE.BufferAttribute(incisions, 1));

  const uniforms = {
    uField: { value: texture },
    uStill: { value: paused ? 1 : 0 },
    uReveal: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      uniform sampler2D uField;
      uniform float uStill;
      uniform float uReveal;
      attribute float aSculpt;
      attribute float aCarving;
      varying vec3 vNormal;
      varying vec2 vSurface;
      varying float vCarving;
      varying float vAmount;
      void main() {
        float field = texture2D(uField, uv).r;
        float amount = max(max(smoothstep(0.01, 0.82, field), uStill * 0.78), uReveal);
        float depth = 0.11 + 0.89 * amount;
        vec3 carved = position;
        carved.z += aSculpt * depth;
        vec4 view = modelViewMatrix * vec4(carved, 1.0);
        vec2 texel = vec2(1.0 / 160.0, 1.0 / 104.0);
        float left = smoothstep(0.01, 0.82, texture2D(uField, uv - vec2(texel.x, 0.0)).r);
        float right = smoothstep(0.01, 0.82, texture2D(uField, uv + vec2(texel.x, 0.0)).r);
        float bottom = smoothstep(0.01, 0.82, texture2D(uField, uv - vec2(0.0, texel.y)).r);
        float top = smoothstep(0.01, 0.82, texture2D(uField, uv + vec2(0.0, texel.y)).r);
        vec2 gradient = vec2((right - left) / (2.0 * texel.x * 15.5), (top - bottom) / (2.0 * texel.y * 10.0));
        float fieldActive = step(max(uStill * 0.78, uReveal), smoothstep(0.01, 0.82, field));
        vec2 slope = -normal.xy / max(normal.z, 0.01) * depth + aSculpt * 0.89 * gradient * fieldActive;
        vNormal = normalMatrix * normalize(vec3(-slope, 1.0));
        vSurface = position.xy;
        vCarving = aCarving;
        vAmount = depth;
        gl_Position = projectionMatrix * view;
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec2 vSurface;
      varying float vCarving;
      varying float vAmount;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
      void main() {
        vec3 normal = normalize(vNormal);
        if (!gl_FrontFacing) normal = -normal;
        vec3 light = normalize(vec3(-0.67, 0.74, 0.77));
        float diffuse = max(0.0, dot(normal, light));
        float grain = (hash(vSurface * 145.0) - 0.5) * 0.018;
        float broad = sin(vSurface.x * 1.5 + sin(vSurface.y * 1.2)) * 0.006;
        float shade = 0.78 + diffuse * 0.36;
        float cavity = 1.0 - vCarving * vAmount * 0.035;
        vec3 plaster = vec3(0.916, 0.903, 0.868);
        vec3 color = plaster * shade * cavity + grain + broad;
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
  const scene = new THREE.Scene();
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  const camera = new THREE.OrthographicCamera(-7.75, 7.75, 5, -5, 0.1, 40);
  camera.position.z = 15;

  let box = container.getBoundingClientRect();
  const resize = () => {
    box = container.getBoundingClientRect();
    const width = Math.max(1, box.width),
      height = Math.max(1, box.height);
    const aspect = width / height;
    // Preserve the carving's proportions. Mobile uses the wheel and lotus
    // portions of the wall rather than squeezing the entire desktop scene.
    const halfH = 5;
    const halfW = halfH * aspect;
    camera.left = -halfW;
    camera.right = halfW;
    camera.top = halfH;
    camera.bottom = -halfH;
    camera.position.x = aspect < 0.8 ? 2.3 : 0;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    render();
  };
  const render = () => {
    if (!disposed && !contextLost) renderer.render(scene, camera);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  const intersection = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
    },
    { rootMargin: "80px" },
  );
  intersection.observe(container);

  function stamp(u: number, v: number, power: number, radius: number) {
    const cx = u * fieldWidth,
      cy = v * fieldHeight;
    const rx = radius * fieldWidth,
      ry = (radius * fieldHeight * worldWidth) / worldHeight;
    const left = Math.max(0, Math.floor(cx - rx * 2));
    const right = Math.min(fieldWidth - 1, Math.ceil(cx + rx * 2));
    const bottom = Math.max(0, Math.floor(cy - ry * 2));
    const top = Math.min(fieldHeight - 1, Math.ceil(cy + ry * 2));
    for (let y = bottom; y <= top; y++) {
      for (let x = left; x <= right; x++) {
        const d = Math.pow((x - cx) / rx, 2) + Math.pow((y - cy) / ry, 2);
        const index = y * fieldWidth + x;
        values[index] = Math.min(1, values[index] + Math.exp(-d * 2) * power);
      }
    }
  }

  const onPointer = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    const bounds = container.getBoundingClientRect();
    const ndcX = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const ndcY = 1 - ((event.clientY - bounds.top) / bounds.height) * 2;
    const worldX = camera.position.x + ndcX * camera.right;
    const worldY = ndcY * camera.top;
    pointer.set(
      (worldX + worldWidth / 2) / worldWidth,
      (worldY + worldHeight / 2) / worldHeight,
    );
    pointerActive = true;
  };
  const leave = () => {
    pointerActive = false;
  };
  // Listen on the parent so DOM headings do not punch holes in the reveal.
  const inputSurface = container.parentElement || container;
  inputSurface.addEventListener("pointermove", onPointer);
  inputSurface.addEventListener("pointerleave", leave);
  const onContextLost = (event: Event) => {
    event.preventDefault();
    contextLost = true;
    container.dataset.reliefState = "unavailable";
    container.dataset.fallback = "true";
    renderer.domElement.style.visibility = "hidden";
  };
  const onContextRestored = () => {
    if (disposed) return;
    contextLost = false;
    texture.needsUpdate = true;
    material.needsUpdate = true;
    // Three.js restores its GPU resources before this listener runs. Paint
    // first so the fallback is not replaced by an uninitialized canvas.
    render();
    renderer.domElement.style.visibility = "visible";
    delete container.dataset.fallback;
    container.dataset.reliefState = "ready";
  };
  renderer.domElement.addEventListener("webglcontextlost", onContextLost);
  renderer.domElement.addEventListener(
    "webglcontextrestored",
    onContextRestored,
  );

  // First view has a partially legible wheel and lotus, leaving a quiet center.
  stamp(0.79, 0.27, 0.7, 0.12);
  stamp(0.23, 0.75, 0.48, 0.11);
  function tick(now: number) {
    if (disposed) return;
    const dt = Math.min(0.05, (now - (lastTime || now)) / 1000);
    lastTime = now;
    if (visible && !document.hidden && !paused && !contextLost) {
      if (!paused) {
        elapsed += dt;
        const decay = Math.exp(-dt * 0.26);
        for (let i = 0; i < values.length; i++) values[i] *= decay;
        // Autonomous path runs even while pointer input is present.
        const autoU = 0.5 + 0.34 * Math.sin(elapsed * 0.13 + 1.8);
        const autoV = 0.5 + 0.31 * Math.cos(elapsed * 0.18 + 0.7);
        stamp(autoU, autoV, dt * 0.65, 0.105);
        if (pointerActive) stamp(pointer.x, pointer.y, dt * 3.4, 0.09);
        fullReveal = Math.max(0, fullReveal - dt * 0.13);
      }
      uniforms.uReveal.value = fullReveal;
      for (let i = 0; i < bytes.length; i++)
        bytes[i] = Math.round(values[i] * 255);
      texture.needsUpdate = true;
      render();
    }
    frame = requestAnimationFrame(tick);
  }
  resize();
  frame = requestAnimationFrame(tick);

  return {
    setPaused(value: boolean) {
      // The application owns preference changes; an explicit Resume wins.
      paused = value;
      uniforms.uStill.value = paused ? 1 : 0;
      render();
    },
    reveal() {
      fullReveal = 1;
      uniforms.uReveal.value = 1;
      render();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      inputSurface.removeEventListener("pointermove", onPointer);
      inputSurface.removeEventListener("pointerleave", leave);
      renderer.domElement.removeEventListener(
        "webglcontextlost",
        onContextLost,
      );
      renderer.domElement.removeEventListener(
        "webglcontextrestored",
        onContextRestored,
      );
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
