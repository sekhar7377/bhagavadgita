import * as THREE from "three";

/**
 * Opening wall: an original Kurukṣetra bas-relief that rises out of plaster
 * where attention has recently passed.
 *
 * - Height data comes from `public/relief/kurukshetra-height.png`, built by
 *   `scripts/relief/build_relief.py` from this project's own artwork.
 * - A persistent 256×256 RGBA feedback field (ping-pong render targets) stores
 *   signed velocity (R,G), a nonlinear speed response (B) and coverage (A).
 * - The same field scales real vertex depth and, at twice the strength, walks
 *   through five lighting stages baked offline at 20–100% extrusion, so
 *   carving becomes legible before it reaches full depth.
 * - An independent automatic input keeps discovering the wall in short bursts.
 *
 * The behaviour and constants follow the study in docs/REFERENCE_ANALYSIS.md.
 * All code, geometry and textures here are original to this project.
 */

const FIELD_SIZE = 256;
const FALLOFF = 0.38 * 0.5;
const DISSIPATION = 0.953;
const POINTER_EASE = 0.4;
const WALL_W = 16.08;
const WALL_H = 8.04;
const DEPTH = 0.9;
const CAMERA_DISTANCE = 15;
const CAMERA_FOV = 30;

const quadVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fieldFragment = /* glsl */ `
  precision highp float;
  uniform sampler2D tPrevious;
  uniform sampler2D tNoise;
  uniform float uFalloff;
  uniform float uDissipation;
  uniform float uStep;
  uniform float uAspect;
  uniform float uTime;
  uniform vec2 uPointer;
  uniform vec2 uVelocity;
  uniform vec2 uAuto;
  uniform float uAutoActive;
  uniform float uShift;
  varying vec2 vUv;

  vec4 stamp(vec2 velocity, vec2 centre) {
    vec2 offset = vUv - centre;
    offset.x *= uAspect;
    velocity *= 50.0;
    float speed = 1.0 - pow(1.0 - min(1.0, length(velocity)), 2.0);
    float falloff = smoothstep(uFalloff, 0.0, length(offset));
    return vec4(velocity, speed, 1.0) * falloff;
  }

  void main() {
    // Reproject: when the page scrolls, the carving moves up the screen, so
    // the history moves with it instead of sliding off the sculpture.
    vec2 from = vUv - vec2(0.0, uShift);
    vec4 data = texture2D(tPrevious, from);
    data *= step(0.0, from.y) * step(from.y, 1.0);
    float friction = 1.0 / uDissipation - 1.0;
    data *= 1.0 / (1.0 + uStep * friction);

    vec2 noiseUv = vUv * vec2(uAspect, 1.0);
    float drift = uTime * 0.01;
    float broad = smoothstep(0.4, 1.0, texture2D(tNoise, noiseUv * 0.35 + drift).g);
    float fine = 0.15 + 0.85 * smoothstep(0.4, 1.0, texture2D(tNoise, noiseUv * 0.8 + drift).g);

    data += stamp(uVelocity, uPointer) * fine * uStep;

    vec4 automatic = stamp(vec2(1.0), uAuto) * 3.0 * uAutoActive;
    automatic.a = automatic.b;
    automatic.rg = vec2(0.0);
    data += automatic * broad * uStep;

    data = min(data, vec4(1.0));
    data.rgb = max(data.rgb, vec3(-1.0));
    gl_FragColor = data;
  }
`;

const wallVertex = /* glsl */ `
  uniform sampler2D tField;
  uniform sampler2D tHeight;
  uniform float uDepth;
  uniform float uStill;
  uniform float uReveal;
  uniform float uBoost;
  uniform float uScrollWorld;
  varying vec2 vUv;
  varying vec3 vWorld;

  void main() {
    vUv = uv;
    vec4 undeformed = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vec2 screenUv = (undeformed.xy / undeformed.w + 1.0) * 0.5;
    vec4 field = texture2D(tField, screenUv);
    float extrude = mix(field.b, field.a, 0.5);
    extrude = max(extrude, max(uStill * 0.5, uReveal * 0.5)) + uBoost * 0.5;
    float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
    float height = texture2D(tHeight, uv).r * inside;
    vec3 carved = position;
    carved.z += height * uDepth * mix(0.05, 1.0, min(extrude, 1.0));
    carved.xy *= 1.004;
    // Plaster grain is fixed to the wall, so it travels with the scroll.
    vWorld = (modelMatrix * vec4(position, 1.0)).xyz + vec3(0.0, uScrollWorld, 0.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(carved, 1.0);
  }
`;

const wallFragment = /* glsl */ `
  precision highp float;
  uniform sampler2D tField;
  uniform sampler2D tStage1;
  uniform sampler2D tStage2;
  uniform sampler2D tStage3;
  uniform sampler2D tStage4;
  uniform sampler2D tStage5;
  uniform sampler2D tPlaster;
  uniform sampler2D tHeight;
  uniform vec2 uResolution;
  uniform vec2 uTexel;
  uniform float uStill;
  uniform float uReveal;
  uniform float uReady;
  uniform float uBoost;
  varying vec2 vUv;
  varying vec3 vWorld;

  const float REST = 0.54504;

  vec3 hueToRgb(float hue) {
    return clamp(abs(fract(hue + vec3(0.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0) - 1.0, 0.0, 1.0);
  }

  void main() {
    vec2 screenUv = gl_FragCoord.xy / uResolution;
    vec4 field = texture2D(tField, screenUv) * 2.0;
    float extrude = mix(field.b, field.a, 0.5);
    // Fast scrolling swells the geometry (vertex shader) but does not light up
    // carving that attention has not reached, so shading ignores uBoost.
    extrude = max(extrude, max(uStill, uReveal)) * uReady;

    // Lighting was baked offline at five extrusion depths. The field walks
    // through those stages in 0.2 intervals, so shade always belongs to the
    // depth the geometry currently has.
    float inside = step(0.0, vUv.x) * step(vUv.x, 1.0) * step(0.0, vUv.y) * step(vUv.y, 1.0);
    float o = REST;
    o = mix(o, texture2D(tStage1, vUv).g, smoothstep(0.0, 0.2, extrude) * inside);
    o = mix(o, texture2D(tStage2, vUv).g, smoothstep(0.2, 0.4, extrude) * inside);
    o = mix(o, texture2D(tStage3, vUv).g, smoothstep(0.4, 0.6, extrude) * inside);
    o = mix(o, texture2D(tStage4, vUv).g, smoothstep(0.6, 0.8, extrude) * inside);
    o = mix(o, texture2D(tStage5, vUv).g, smoothstep(0.8, 1.0, extrude) * inside);

    float plaster = texture2D(tPlaster, vWorld.xy / 10.0).g;
    float wash = mix(1.0, 0.5, length(screenUv - vec2(0.0, 0.8)));
    float tone = o * plaster + wash * 0.7 * 0.17;
    tone = tone * 0.6 + 0.4;
    vec3 color = vec3(tone);

    // While plaster is moving, shadowed rims pick up a faint iridescence
    // whose hue follows the direction the surface faces. It fades with the
    // field's speed channel, so a settled carving is neutral grey again.
    float moving = smoothstep(0.02, 0.7, field.b * 0.5) * inside * uReady;
    if (moving > 0.001) {
      float hl = texture2D(tHeight, vUv - vec2(uTexel.x, 0.0)).r;
      float hr = texture2D(tHeight, vUv + vec2(uTexel.x, 0.0)).r;
      float hd = texture2D(tHeight, vUv - vec2(0.0, uTexel.y)).r;
      float hu = texture2D(tHeight, vUv + vec2(0.0, uTexel.y)).r;
      vec2 facing = vec2(hr - hl, hu - hd);
      float rim = smoothstep(0.004, 0.05, length(facing));
      float shade = smoothstep(0.42, 0.2, o);
      float hue = atan(facing.y, facing.x) / 6.2831853 + 0.28;
      vec3 tint = mix(vec3(1.0), hueToRgb(hue), 0.5);
      color = mix(color, color * tint * 1.06, max(rim * 0.5, shade) * moving * 0.3);
    }
    gl_FragColor = vec4(color, 1.0);
  }
`;

type Segment = {
  from: THREE.Vector2;
  to: THREE.Vector2;
  duration: number;
  eased: boolean;
  jitter: number[];
};

async function loadHeight(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`height ${response.status}`);
  const bitmap = await createImageBitmap(await response.blob(), {
    colorSpaceConversion: "none",
    premultiplyAlpha: "none",
  });
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  context.drawImage(bitmap, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const data = new Uint16Array(canvas.width * canvas.height);
  // Rows are flipped so that v = 0 is the bottom of the wall.
  for (let y = 0; y < canvas.height; y++) {
    const source = (canvas.height - 1 - y) * canvas.width * 4;
    const target = y * canvas.width;
    for (let x = 0; x < canvas.width; x++) {
      const value =
        (pixels[source + x * 4] * 256 + pixels[source + x * 4 + 1]) / 65535;
      data[target + x] = THREE.DataUtils.toHalfFloat(value);
    }
  }
  bitmap.close();
  const texture = new THREE.DataTexture(
    data,
    canvas.width,
    canvas.height,
    THREE.RedFormat,
    THREE.HalfFloatType,
  );
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export type SceneSpec = {
  /** Asset prefix in /relief: NAME-height.png, NAME-stage1..5.webp. */
  name: string;
  /** The page element the carving is centred on; it scrolls with the page. */
  anchor: HTMLElement;
};

type SceneState = {
  spec: SceneSpec;
  status: "idle" | "loading" | "ready" | "failed";
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  uniforms: Record<string, THREE.IUniform>;
  abort?: AbortController;
};

/**
 * One continuous wall for the whole page, as in the reference: a single
 * fixed canvas, one shared reveal field, and one carved panel per scene laid
 * along the scroll. Panels load when they approach and are released when far
 * away. The first scene drives the container's ready/plain state.
 */
export function mountRelief(container: HTMLElement, specs: SceneSpec[]) {
  const noop = { dispose() {}, setPaused(_: boolean) {}, reveal() {} };
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
  } catch {
    container.dataset.reliefState = "unavailable";
    container.dataset.fallback = "true";
    return noop;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let paused = reducedMotion.matches;
  let disposed = false;
  let contextLost = false;
  let frame = 0;
  let lastTime = 0;
  let elapsed = 0;
  let reveal = 0;

  container.dataset.reliefState = "loading";
  delete container.dataset.fallback;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor("#c8c8c8");
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.domElement.style.cssText =
    "display:block;width:100%;height:100%;pointer-events:none";
  container.appendChild(renderer.domElement);

  // --- persistent field ---------------------------------------------------
  const floatTargets =
    renderer.capabilities.isWebGL2 &&
    renderer.extensions.has("EXT_color_buffer_float");
  const targetOptions: THREE.RenderTargetOptions = {
    type: floatTargets ? THREE.HalfFloatType : THREE.UnsignedByteType,
    format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
    stencilBuffer: false,
  };
  let read = new THREE.WebGLRenderTarget(FIELD_SIZE, FIELD_SIZE, targetOptions);
  let write = new THREE.WebGLRenderTarget(
    FIELD_SIZE,
    FIELD_SIZE,
    targetOptions,
  );
  const loader = new THREE.TextureLoader();
  const data = (url: string, repeat: boolean, onLoad?: () => void) => {
    // The frame loop redraws continuously, so a finished load needs no
    // render call of its own (and may arrive before render exists).
    const texture = loader.load(url, () => onLoad?.());
    texture.colorSpace = THREE.NoColorSpace;
    if (repeat) texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
  };
  const noise = data("/relief/noise.png", true);
  const plaster = data("/relief/plaster.webp", true);
  const blank = new THREE.DataTexture(
    new Uint16Array([0]),
    1,
    1,
    THREE.RedFormat,
    THREE.HalfFloatType,
  );
  blank.needsUpdate = true;

  const fieldUniforms = {
    tPrevious: { value: read.texture },
    tNoise: { value: noise },
    uFalloff: { value: FALLOFF },
    uDissipation: { value: DISSIPATION },
    uStep: { value: 1 },
    uAspect: { value: 1 },
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(-1, -1) },
    uVelocity: { value: new THREE.Vector2() },
    uAuto: { value: new THREE.Vector2(-1, -1) },
    uAutoActive: { value: 0 },
    uShift: { value: 0 },
  };
  const fieldMaterial = new THREE.ShaderMaterial({
    uniforms: fieldUniforms,
    vertexShader: quadVertex,
    fragmentShader: fieldFragment,
    depthTest: false,
    depthWrite: false,
  });
  const fieldScene = new THREE.Scene();
  const fieldQuad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    fieldMaterial,
  );
  fieldQuad.frustumCulled = false;
  fieldScene.add(fieldQuad);
  const fieldCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // --- wall ---------------------------------------------------------------
  // Uniforms every panel shares (same objects, so one update reaches all).
  const shared = {
    tField: { value: read.texture },
    tPlaster: { value: plaster },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uDepth: { value: DEPTH },
    uStill: { value: paused ? 1 : 0 },
    uReveal: { value: 0 },
    uBoost: { value: 0 },
    uScrollWorld: { value: 0 },
  };
  const makeUniforms = () => ({
    ...shared,
    tHeight: { value: blank as THREE.Texture },
    tStage1: { value: blank as THREE.Texture },
    tStage2: { value: blank as THREE.Texture },
    tStage3: { value: blank as THREE.Texture },
    tStage4: { value: blank as THREE.Texture },
    tStage5: { value: blank as THREE.Texture },
    uTexel: { value: new THREE.Vector2(1 / 1152, 1 / 576) },
    uReady: { value: 0 },
  });
  const makeMaterial = (uniforms: Record<string, THREE.IUniform>) =>
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: wallVertex,
      fragmentShader: wallFragment,
    });

  const scene = new THREE.Scene();
  const panelGeometry = new THREE.PlaneGeometry(WALL_W, WALL_H, 448, 224);
  // Bare plaster behind every panel, fixed to the camera; its grain scrolls
  // through uScrollWorld so the whole page reads as one wall.
  const surroundGeometry = new THREE.PlaneGeometry(WALL_W * 5, WALL_H * 5);
  const surroundUv = surroundGeometry.getAttribute("uv");
  for (let i = 0; i < surroundUv.count; i++)
    surroundUv.setXY(
      i,
      (surroundUv.getX(i) - 0.5) * 5 + 0.5,
      (surroundUv.getY(i) - 0.5) * 5 + 0.5,
    );
  const surroundMaterial = makeMaterial(makeUniforms());
  const surround = new THREE.Mesh(surroundGeometry, surroundMaterial);
  surround.position.z = -0.002;
  surround.renderOrder = -1;
  surround.frustumCulled = false;
  scene.add(surround);

  const scenes: SceneState[] = specs.map((spec) => {
    const uniforms = makeUniforms();
    const material = makeMaterial(uniforms);
    const mesh = new THREE.Mesh(panelGeometry, material);
    mesh.visible = false;
    scene.add(mesh);
    return { spec, status: "idle", mesh, material, uniforms };
  });

  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 2, 5, 30);
  camera.position.set(0, 0, CAMERA_DISTANCE);

  const render = () => {
    if (disposed || contextLost) return;
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
  };

  const releaseScene = (state: SceneState) => {
    state.abort?.abort();
    const u = state.uniforms;
    for (const key of [
      "tHeight",
      "tStage1",
      "tStage2",
      "tStage3",
      "tStage4",
      "tStage5",
    ]) {
      if (u[key].value !== blank) u[key].value.dispose();
      u[key].value = blank;
    }
    u.uReady.value = 0;
    state.status = "idle";
  };

  const loadScene = (state: SceneState, first: boolean) => {
    state.status = "loading";
    const abort = new AbortController();
    state.abort = abort;
    const name = state.spec.name;
    const u = state.uniforms;
    [1, 2, 3, 4, 5].forEach((index) => {
      u[`tStage${index}`].value = data(
        `/relief/${name}-stage${index}.webp`,
        false,
      );
    });
    loadHeight(`/relief/${name}-height.png`, abort.signal)
      .then((texture) => {
        if (disposed || abort.signal.aborted) return texture.dispose();
        u.tHeight.value = texture;
        u.uTexel.value.set(1 / texture.image.width, 1 / texture.image.height);
        u.uReady.value = 1;
        state.status = "ready";
        if (first && !contextLost) container.dataset.reliefState = "ready";
        render();
      })
      .catch(() => {
        if (disposed || abort.signal.aborted) return;
        // The plaster wall still renders; the page stays fully readable.
        state.status = "failed";
        if (first) container.dataset.reliefState = "plain";
      });
  };

  // World units per CSS pixel at the wall plane, for the current camera.
  let worldPerPixel = 1;
  let viewHeight = window.innerHeight;
  const resize = () => {
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    viewHeight = height;
    const aspect = width / height;
    camera.aspect = aspect;
    // Cover the 2:1 panel on landscape screens; on portrait step back so a
    // panel shows whole across the width.
    camera.zoom =
      aspect >= 1 ? Math.max(1, aspect / 2.15) : 0.44 + 0.26 * aspect;
    camera.updateProjectionMatrix();
    const visible =
      (2 *
        CAMERA_DISTANCE *
        Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2))) /
      camera.zoom;
    worldPerPixel = visible / height;
    renderer.setSize(width, height, false);
    renderer.getDrawingBufferSize(shared.uResolution.value);
    fieldUniforms.uAspect.value = aspect;
    place();
    render();
  };
  window.addEventListener("resize", resize);

  // Lay every panel at its anchor's current position on screen.
  let lastScroll = window.scrollY;
  let scrollSpeed = 0;
  const place = () => {
    shared.uScrollWorld.value = window.scrollY * worldPerPixel;
    scenes.forEach((state, index) => {
      const rect = state.spec.anchor.getBoundingClientRect();
      const offset = rect.top + rect.height / 2 - viewHeight / 2;
      state.mesh.position.y = -offset * worldPerPixel;
      const distance = Math.abs(offset) / viewHeight;
      state.mesh.visible = distance < 1.2 && state.status === "ready";
      if (distance < 1.6 && state.status === "idle")
        loadScene(state, index === 0);
      else if (distance > 3 && state.status !== "idle" && index !== 0)
        releaseScene(state);
    });
  };

  // --- user input -----------------------------------------------------------
  const target = new THREE.Vector2(-1, -1);
  const previous = new THREE.Vector2(-1, -1);
  const rawVelocity = new THREE.Vector2();
  let hasPointer = false;
  let staleInput = true;
  const onPointer = (event: PointerEvent) => {
    target.set(
      event.clientX / window.innerWidth,
      1 - event.clientY / window.innerHeight,
    );
    if (!hasPointer || staleInput) {
      fieldUniforms.uPointer.value.copy(target);
      previous.copy(target);
      hasPointer = true;
      staleInput = false;
    }
  };
  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("pointerdown", onPointer, { passive: true });

  // --- automatic input ------------------------------------------------------
  let segments: Segment[] = [];
  let segmentTime = 0;
  let pause = 0.6;
  const between = (a: number, b: number) => a + (b - a) * Math.random();
  const planAutomaticPath = () => {
    segments = [];
    const count = Math.floor(Math.random() * 3) + 1;
    let start: THREE.Vector2 | null = null;
    for (let i = 0; i < count; i++) {
      const eased = i !== count - 1 && Math.random() < 0.7;
      const duration = eased ? between(0.8, 1) : between(0.7, 0.8);
      const from: THREE.Vector2 =
        start ??
        new THREE.Vector2((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2);
      const angle = from.angle() + (Math.random() - 0.5) * 2 * Math.PI * 0.8;
      const radius = between(0.7, 0.9);
      const to = new THREE.Vector2(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
      );
      const points = Math.max(2, Math.floor(duration * 12));
      const strength = eased ? 3 : 2;
      const jitter = Array.from({ length: points + 1 }, (_, index) =>
        index === 0 || index === points
          ? 0
          : ((Math.random() - 0.5) * strength) / points,
      );
      segments.push({ from, to, duration, eased, jitter });
      start = to;
    }
    segmentTime = 0;
  };
  const advanceAutomatic = (dt: number) => {
    if (!segments.length) {
      pause -= dt;
      fieldUniforms.uAutoActive.value = 0;
      if (pause <= 0) planAutomaticPath();
      return;
    }
    const segment = segments[0];
    segmentTime += dt;
    const linear = Math.min(1, segmentTime / segment.duration);
    // A hand-drawn, slightly uneven progression rather than a mechanical glide.
    const scaled = linear * (segment.jitter.length - 1);
    const index = Math.min(segment.jitter.length - 2, Math.floor(scaled));
    const wobble =
      segment.jitter[index] +
      (segment.jitter[index + 1] - segment.jitter[index]) * (scaled - index);
    const base = segment.eased ? 1 - (1 - linear) * (1 - linear) : linear;
    const progress = Math.min(1, Math.max(0, base + wobble));
    fieldUniforms.uAuto.value.set(
      (segment.from.x + (segment.to.x - segment.from.x) * progress) / 2 + 0.5,
      (segment.from.y + (segment.to.y - segment.from.y) * progress) / 2 + 0.5,
    );
    fieldUniforms.uAutoActive.value = 1;
    if (linear >= 1) {
      segments.shift();
      segmentTime = 0;
      if (!segments.length) pause = between(1, 3);
    }
  };

  // --- lifecycle ------------------------------------------------------------
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
    staleInput = true;
    render();
    renderer.domElement.style.visibility = "visible";
    delete container.dataset.fallback;
    container.dataset.reliefState =
      scenes[0]?.status === "ready" ? "ready" : "loading";
  };
  renderer.domElement.addEventListener("webglcontextlost", onContextLost);
  renderer.domElement.addEventListener(
    "webglcontextrestored",
    onContextRestored,
  );

  function tick(now: number) {
    if (disposed) return;
    const dtMs = Math.min(64, now - (lastTime || now));
    lastTime = now;
    if (!document.hidden && !contextLost) {
      const dt = dtMs / 1000;
      const scrollNow = window.scrollY;
      const delta = scrollNow - lastScroll;
      lastScroll = scrollNow;
      place();
      // Fast scrolling swells the whole visible carving, then it settles.
      const speed = Math.min(
        1,
        Math.abs(delta) / Math.max(1, viewHeight * 0.05),
      );
      scrollSpeed +=
        (speed - scrollSpeed) * (speed > scrollSpeed ? 0.25 : 0.06);
      shared.uBoost.value = paused ? 0 : scrollSpeed * 0.18;
      if (!paused) {
        elapsed += dt;
        const step = Math.min(dtMs, 32) / 16;
        if (hasPointer && !staleInput) {
          rawVelocity.copy(target).sub(previous).multiplyScalar(step);
          previous.copy(target);
          const settle = rawVelocity.lengthSq() > 0 ? 0.1 : 0.04;
          fieldUniforms.uPointer.value.lerp(
            target,
            1 - Math.pow(1 - POINTER_EASE, step),
          );
          fieldUniforms.uVelocity.value.lerp(
            rawVelocity,
            1 - Math.pow(1 - settle, step),
          );
        } else {
          fieldUniforms.uVelocity.value.set(0, 0);
        }
        advanceAutomatic(dt);
        fieldUniforms.uShift.value = delta / viewHeight;
        fieldUniforms.uStep.value = step;
        fieldUniforms.uTime.value = elapsed;
        fieldUniforms.tPrevious.value = read.texture;
        renderer.setRenderTarget(write);
        renderer.render(fieldScene, fieldCamera);
        [read, write] = [write, read];
        shared.tField.value = read.texture;
      }
      if (reveal > 0) {
        reveal = Math.max(0, reveal - dt * 0.18);
        shared.uReveal.value = reveal;
      }
      render();
    }
    frame = requestAnimationFrame(tick);
  }
  resize();
  frame = requestAnimationFrame(tick);

  return {
    /** Paused shows every carving at rest instead of an empty wall. */
    setPaused(value: boolean) {
      paused = value;
      staleInput = true;
      shared.uStill.value = paused ? 1 : 0;
      render();
    },
    reveal() {
      reveal = 1;
      shared.uReveal.value = 1;
      render();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      renderer.domElement.removeEventListener(
        "webglcontextlost",
        onContextLost,
      );
      renderer.domElement.removeEventListener(
        "webglcontextrestored",
        onContextRestored,
      );
      scenes.forEach((state) => {
        releaseScene(state);
        state.material.dispose();
      });
      read.dispose();
      write.dispose();
      panelGeometry.dispose();
      surroundGeometry.dispose();
      surroundMaterial.dispose();
      fieldQuad.geometry.dispose();
      fieldMaterial.dispose();
      for (const texture of [noise, plaster, blank]) texture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
