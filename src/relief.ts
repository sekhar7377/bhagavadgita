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
// Panels start loading this many screen heights ahead, and are released
// beyond the second distance, so scrolling rarely meets an unloaded wall.
const LOAD_AHEAD = 1.8;
const RELEASE_BEYOND = 3;
// Entrance of each carving: seconds to rise, hold, settle; resting depth.
const RISE_IN = 2.4;
const RISE_HOLD = 1.4;
const RISE_SETTLE = 2.6;
const REST_RELIEF = 0;

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
  uniform float uLift;
  uniform float uRise;
  uniform float uPresence;
  uniform float uBoost;
  uniform float uScrollWorld;
  uniform sampler2D tVideo;
  uniform float uVideoOn;
  varying vec2 vUv;
  varying vec3 vWorld;

  // Living relief: a motion map (R sway, G flicker, B drift) moves parts of
  // the carving in place, so banners ripple, fire licks and dust drifts.
  uniform sampler2D tMotion;
  uniform float uMotionOn;
  uniform float uTime;
  vec2 flow(vec2 uv) {
    if (uMotionOn < 0.5) return uv;
    vec3 m = texture2D(tMotion, uv).rgb;
    float t = uTime;
    vec2 sway = vec2(sin(t * 1.7 + uv.y * 38.0 + uv.x * 9.0), cos(t * 1.3 + uv.x * 30.0)) * vec2(0.0035, 0.0018);
    vec2 flicker = vec2(sin(t * 6.3 + uv.y * 85.0) * 0.0016, -abs(sin(t * 4.1 + uv.x * 60.0)) * 0.0032);
    vec2 drift = vec2(sin(t * 0.22 + uv.y * 5.0) * 0.012, sin(t * 0.17 + uv.x * 4.0) * 0.004);
    return uv + m.r * sway + m.g * flicker + m.b * drift;
  }

  void main() {
    vUv = uv;
    vec4 undeformed = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vec2 screenUv = (undeformed.xy / undeformed.w + 1.0) * 0.5;
    vec4 field = texture2D(tField, screenUv);
    float extrude = mix(field.b, field.a, 0.5);
    extrude = max(extrude, max(uStill, max(max(uReveal, uRise), uLift)) * 0.5) + uBoost * 0.5;
    float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
    // Presence dissolves the whole carving back into flat plaster (0) or
    // condenses it out of the wall (1) when one scene hands over to the next.
    float stillHeight = texture2D(tHeight, flow(uv)).r;
    // A video carving keeps its height in the lower half of each frame.
    float movingHeight = texture2D(tVideo, vec2(uv.x, uv.y * 0.5)).r;
    float height = mix(stillHeight, movingHeight, uVideoOn) * inside * uPresence;
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
  uniform float uLift;
  uniform float uRise;
  uniform float uPresence;
  uniform float uReady;
  uniform float uBoost;
  uniform sampler2D tVideo;
  uniform float uVideoOn;
  uniform sampler2D tColor;
  uniform float uColorOn;
  varying vec2 vUv;
  varying vec3 vWorld;

  // Living relief: a motion map (R sway, G flicker, B drift) moves parts of
  // the carving in place, so banners ripple, fire licks and dust drifts.
  uniform sampler2D tMotion;
  uniform float uMotionOn;
  uniform float uTime;
  vec2 flow(vec2 uv) {
    if (uMotionOn < 0.5) return uv;
    vec3 m = texture2D(tMotion, uv).rgb;
    float t = uTime;
    vec2 sway = vec2(sin(t * 1.7 + uv.y * 38.0 + uv.x * 9.0), cos(t * 1.3 + uv.x * 30.0)) * vec2(0.0035, 0.0018);
    vec2 flicker = vec2(sin(t * 6.3 + uv.y * 85.0) * 0.0016, -abs(sin(t * 4.1 + uv.x * 60.0)) * 0.0032);
    vec2 drift = vec2(sin(t * 0.22 + uv.y * 5.0) * 0.012, sin(t * 0.17 + uv.x * 4.0) * 0.004);
    return uv + m.r * sway + m.g * flicker + m.b * drift;
  }

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
    extrude = max(extrude, max(uStill, max(max(uReveal, uRise), uLift))) * uReady * uPresence;

    // Lighting was baked offline at five extrusion depths. The field walks
    // through those stages in 0.2 intervals, so shade always belongs to the
    // depth the geometry currently has.
    float inside = step(0.0, vUv.x) * step(vUv.x, 1.0) * step(0.0, vUv.y) * step(vUv.y, 1.0);
    vec2 fuv = flow(vUv);
    float o = REST;
    o = mix(o, texture2D(tStage1, fuv).r, smoothstep(0.0, 0.2, extrude) * inside);
    o = mix(o, texture2D(tStage2, fuv).r, smoothstep(0.2, 0.4, extrude) * inside);
    o = mix(o, texture2D(tStage3, fuv).r, smoothstep(0.4, 0.6, extrude) * inside);
    o = mix(o, texture2D(tStage4, fuv).r, smoothstep(0.6, 0.8, extrude) * inside);
    o = mix(o, texture2D(tStage5, fuv).r, smoothstep(0.8, 1.0, extrude) * inside);

    // A video carving brings its own moving plaster shading (upper half),
    // levelled to the baked stages so it sits in the same wall.
    if (uVideoOn > 0.0) {
      float shade = texture2D(tVideo, vec2(vUv.x, 0.5 + vUv.y * 0.5)).r;
      float moving = REST + (shade - 0.751) * 0.95;
      o = mix(o, mix(REST, moving, smoothstep(0.0, 0.8, extrude)), uVideoOn * inside);
    }
    float plaster = texture2D(tPlaster, vWorld.xy / 10.0).g;
    float wash = mix(1.0, 0.5, length(screenUv - vec2(0.0, 0.8)));
    float tone = o * plaster + wash * 0.7 * 0.17;
    tone = tone * 0.6 + 0.4;
    vec3 color = vec3(tone);
    // A coloured carving: where the relief is revealed it shows its true
    // colours, lit by the same carved shading; at rest it stays plaster.
    if (uColorOn > 0.5) {
      vec3 albedo = texture2D(tColor, fuv).rgb;
      float light = clamp(o / REST, 0.0, 1.6);
      vec3 painted = albedo * (0.25 + 0.85 * light);
      color = mix(color, painted, smoothstep(0.0, 0.55, extrude) * inside);
    }

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

// Height maps decode in a worker; one worker serves the whole page.
let heightWorker: Worker | undefined;
let heightJob = 0;
const heightJobs = new Map<
  number,
  { resolve: (t: THREE.DataTexture) => void; reject: (e: Error) => void }
>();
function loadHeight(url: string, signal: AbortSignal) {
  if (!heightWorker) {
    heightWorker = new Worker(new URL("./height-worker.ts", import.meta.url), {
      type: "module",
    });
    heightWorker.onmessage = (event) => {
      const { id, width, height, data, error } = event.data;
      const job = heightJobs.get(id);
      if (!job) return;
      heightJobs.delete(id);
      if (error) return job.reject(new Error(error));
      const texture = new THREE.DataTexture(
        data,
        width,
        height,
        THREE.RedFormat,
        THREE.HalfFloatType,
      );
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
      job.resolve(texture);
    };
  }
  const id = ++heightJob;
  const absolute = new URL(url, window.location.href).href;
  return new Promise<THREE.DataTexture>((resolve, reject) => {
    heightJobs.set(id, { resolve, reject });
    signal.addEventListener("abort", () => {
      heightJobs.delete(id);
      reject(new Error("aborted"));
    });
    heightWorker!.postMessage({ id, url: absolute });
  });
}

export type SceneSpec = {
  /** Asset prefix in /relief: NAME-height.png, NAME-stage1..5.webp. */
  name: string;
  /** The page element the carving is centred on; it scrolls with the page. */
  anchor: HTMLElement;
  /** Load NAME-motion.png and let parts of the carving move (living relief). */
  motion?: boolean;
  /** A slow camera drift across the panel while it is on screen. */
  drift?: boolean;
  /** Play NAME-video.mp4 (shading above, height below) as a moving carving. */
  video?: boolean;
  /** How much carving stays visible at rest (0 = bare plaster). */
  rest?: number;
  /** A bridge carving: drawn just behind its neighbours, so it only shows
   *  in the gap between two scenes. */
  bridge?: boolean;
  /** Reveal the carving in true colour from NAME-color.webp. */
  color?: boolean;
  /**
   * The figure's horizontal span in the panel (0..1 from the left). When the
   * anchor holds a painting, the panel is shrunk and moved so that span
   * stands whole in the margin beside it, instead of the painting covering
   * the body and leaving a head poking out above it.
   */
  beside?: [number, number];
  /**
   * Optional camera for this panel, read every frame: scale (1 = the panel
   * as laid out), the panel point (uv) kept at the anchor's centre, and a
   * lift that raises this panel's carving as if attention were on it.
   */
  shot?: () => {
    scale: number;
    focusX: number;
    focusY: number;
    lift: number;
    /** 0..1: how fully the carving has condensed out of the plaster. */
    presence?: number;
    /** Keep the panel centred on screen instead of following the anchor. */
    pinned?: boolean;
  };
};

type SceneState = {
  spec: SceneSpec;
  status: "idle" | "loading" | "ready" | "failed";
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  uniforms: Record<string, THREE.IUniform>;
  abort?: AbortController;
  /** Seconds since this panel began rising into view; -1 while waiting. */
  riseTime: number;
  /** Seconds since every texture arrived, for a soft fade-in. */
  readyTime: number;
  video?: HTMLVideoElement;
};

/**
 * One continuous wall for the whole page, as in the reference: a single
 * fixed canvas, one shared reveal field, and one carved panel per scene laid
 * along the scroll. Panels load when they approach and are released when far
 * away. The first scene drives the container's ready/plain state.
 */
export function mountRelief(container: HTMLElement, specs: SceneSpec[]) {
  const noop = {
    dispose() {},
    setPaused(_: boolean) {},
    reveal() {},
    wake() {},
  };
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
  // Entrances wait until the intro loader has lifted, so none is missed.
  let entrancesArmed = false;

  container.dataset.reliefState = "loading";
  delete container.dataset.fallback;
  // Sharp but affordable: the plaster is soft, so 1.5x (1.25x on touch
  // devices, whose GPUs are smaller) is visually enough.
  const pixelRatio = Math.min(
    window.devicePixelRatio || 1,
    matchMedia("(pointer: coarse)").matches ? 1.25 : 1.5,
  );
  renderer.setPixelRatio(pixelRatio);
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
  // Images decode off the main thread (ImageBitmap), and each one is sent
  // to the GPU as soon as it arrives, so scrolling never stalls on a decode
  // or a first-use upload. The bitmap is flipped while decoding.
  const loader = new THREE.ImageBitmapLoader();
  loader.setOptions({ imageOrientation: "flipY", premultiplyAlpha: "none" });
  const data = (url: string, repeat: boolean, onLoad?: () => void) => {
    const texture = new THREE.Texture();
    texture.flipY = false;
    if (!repeat) {
      // Panels are shown near 1:1, so mipmaps only cost GPU memory.
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      // The baked stages are greyscale: one channel is a quarter of the
      // GPU memory of RGBA, which keeps phones from losing the context.
      texture.format = THREE.RedFormat;
    }
    texture.colorSpace = THREE.NoColorSpace;
    if (repeat) texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.addEventListener("dispose", () => {
      (texture.image as ImageBitmap | null)?.close?.();
    });
    loader.load(
      url,
      (bitmap) => {
        texture.image = bitmap;
        texture.needsUpdate = true;
        if (renderer && !contextLost) renderer.initTexture(texture);
        onLoad?.();
      },
      undefined,
      () => undefined,
    );
    return texture;
  };
  const noise = data(import.meta.env.BASE_URL + "relief/noise.png", true);
  const plaster = data(import.meta.env.BASE_URL + "relief/plaster.webp", true);
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
    uTime: { value: 0 },
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
    uLift: { value: 0 },
    uRise: { value: 0 },
    uPresence: { value: 1 },
    tMotion: { value: blank as THREE.Texture },
    uMotionOn: { value: 0 },
    tVideo: { value: blank as THREE.Texture },
    uVideoOn: { value: 0 },
    tColor: { value: blank as THREE.Texture },
    uColorOn: { value: 0 },
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
    if (spec.bridge) {
      mesh.position.z = -0.0015;
      mesh.renderOrder = -0.5;
      // Drawn first and never written to the depth buffer, so its relief can
      // never rise through a neighbouring carving: when the cursor lifted
      // both, the bridge's sand used to bury the figure beside it.
      material.depthWrite = false;
    }
    scene.add(mesh);
    return {
      spec,
      status: "idle",
      mesh,
      material,
      uniforms,
      riseTime: -1,
      readyTime: 0,
    };
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
      "tMotion",
      "tVideo",
      "tColor",
    ]) {
      if (u[key].value !== blank) u[key].value.dispose();
      u[key].value = blank;
    }
    u.uReady.value = 0;
    u.uRise.value = 0;
    u.uMotionOn.value = 0;
    u.uVideoOn.value = 0;
    u.uColorOn.value = 0;
    state.video?.pause();
    state.video?.removeAttribute("src");
    state.video = undefined;
    state.riseTime = -1;
    state.readyTime = 0;
    state.status = "idle";
  };

  // The still carving shows first; the moving one takes over once playing.
  const startVideo = (state: SceneState) => {
    const video = document.createElement("video");
    video.src = `${import.meta.env.BASE_URL}relief/${state.spec.name}-video.mp4`;
    video.muted = true;
    video.loop = false;
    video.playsInline = true;
    video.preload = "auto";
    video.crossOrigin = "anonymous";
    state.video = video;
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.NoColorSpace;
    texture.minFilter = THREE.LinearFilter;
    state.uniforms.tVideo.value = texture;
    video.addEventListener(
      "playing",
      () => {
        if (state.video === video && !paused) state.uniforms.uVideoOn.value = 1;
      },
      { once: true },
    );
  };

  const loadScene = (state: SceneState, first: boolean) => {
    state.status = "loading";
    const abort = new AbortController();
    state.abort = abort;
    const name = state.spec.name;
    const u = state.uniforms;
    // A panel only counts as ready once its height AND all five lighting
    // stages have arrived; showing it earlier flashes half-lit plaster.
    let pending = (state.spec.motion ? 7 : 6) + (state.spec.color ? 1 : 0);
    if (state.spec.color) {
      const colorTexture = new THREE.Texture();
      colorTexture.flipY = false;
      colorTexture.colorSpace = THREE.NoColorSpace;
      colorTexture.generateMipmaps = false;
      colorTexture.minFilter = THREE.LinearFilter;
      new THREE.ImageBitmapLoader()
        .setOptions({ imageOrientation: "flipY", premultiplyAlpha: "none" })
        .load(
          `${import.meta.env.BASE_URL}relief/${name}-color.webp`,
          (bitmap) => {
            colorTexture.image = bitmap;
            colorTexture.needsUpdate = true;
            u.uColorOn.value = 1;
            arrived();
          },
          undefined,
          () => arrived(),
        );
      u.tColor.value = colorTexture;
    }

    const arrived = () => {
      pending -= 1;
      if (pending > 0 || disposed || abort.signal.aborted) return;
      u.uReady.value = 0;
      state.readyTime = 0;
      state.status = "ready";
      if (state.spec.video) startVideo(state);
      if (first && !contextLost) container.dataset.reliefState = "ready";
      render();
    };
    if (state.spec.motion) {
      u.tMotion.value = data(
        `${import.meta.env.BASE_URL}relief/${name}-motion.png`,
        false,
        arrived,
      );
      u.uMotionOn.value = 1;
    }
    [1, 2, 3, 4, 5].forEach((index) => {
      u[`tStage${index}`].value = data(
        `${import.meta.env.BASE_URL}relief/${name}-stage${index}.webp`,
        false,
        arrived,
      );
    });
    loadHeight(
      `${import.meta.env.BASE_URL}relief/${name}-height.png`,
      abort.signal,
    )
      .then((texture) => {
        if (disposed || abort.signal.aborted) return texture.dispose();
        u.tHeight.value = texture;
        u.uTexel.value.set(1 / texture.image.width, 1 / texture.image.height);
        arrived();
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
  let scrollSpeed = 0;
  // How far the carving nearest the centre actually moved on screen since
  // the last frame. Pinned (sticky) walls stay still while the page scrolls,
  // so the reveal history must follow the carving, not the scroll position.
  let wallDelta = 0;
  const lastTops = new Map<SceneState, number>();
  const place = () => {
    shared.uScrollWorld.value = window.scrollY * worldPerPixel;
    let nearest = Infinity;
    wallDelta = 0;
    scenes.forEach((state, index) => {
      const rect = state.spec.anchor.getBoundingClientRect();
      // A scene inside a closed branch stays hidden and unloaded until the
      // visitor opens that branch. Current browsers can still give a closed
      // <details> body a layout box, so check the branch, not only the size.
      if (
        rect.height === 0 ||
        state.spec.anchor.closest("details:not([open]) > :not(summary)")
      ) {
        state.mesh.visible = false;
        return;
      }
      const offset = rect.top + rect.height / 2 - viewHeight / 2;
      const previousTop = lastTops.get(state);
      lastTops.set(state, rect.top);
      const pinnedNow = state.spec.shot?.()?.pinned;
      if (Math.abs(offset) < nearest) {
        nearest = Math.abs(offset);
        wallDelta =
          pinnedNow || previousTop === undefined ? 0 : previousTop - rect.top;
      }
      state.mesh.position.y = -offset * worldPerPixel;
      const shot = state.spec.shot?.();
      if (!shot && state.spec.drift) {
        // A slow breathing dolly: a little closer, a little across, never still.
        const s = 1.05 + 0.035 * Math.sin(elapsed * 0.11);
        state.mesh.scale.set(s, s, Math.sqrt(s));
        state.mesh.position.x = Math.sin(elapsed * 0.07) * WALL_W * 0.018;
      }
      if (!shot && state.spec.beside) {
        const art = state.spec.anchor.querySelector(".art-wrap");
        const artLeft = art?.getBoundingClientRect().left ?? 0;
        const [from, to] = state.spec.beside;
        const panelPx = WALL_W / worldPerPixel;
        const gap = 28;
        const room = artLeft - gap - 12;
        const s = Math.min(1, room / ((to - from) * panelPx));
        // On narrow screens there is no margin to stand in: leave it as is.
        if (s >= 0.4) {
          const left = artLeft - gap - to * s * panelPx;
          const centre = left + (s * panelPx) / 2;
          state.mesh.scale.set(s, s, Math.sqrt(s));
          state.mesh.position.x =
            (centre - window.innerWidth / 2) * worldPerPixel;
        } else {
          state.mesh.scale.set(1, 1, 1);
          state.mesh.position.x = 0;
        }
      }
      if (shot) {
        // Keep the chosen point of the panel at the anchor's centre while
        // scaling, so the camera appears to pull back from that point.
        state.mesh.scale.set(shot.scale, shot.scale, Math.sqrt(shot.scale));
        state.mesh.position.x = -(shot.focusX - 0.5) * WALL_W * shot.scale;
        state.mesh.position.y -= (shot.focusY - 0.5) * WALL_H * shot.scale;
        state.uniforms.uLift.value = shot.lift;
        state.uniforms.uPresence.value = shot.presence ?? 1;
        if (shot.pinned)
          state.mesh.position.y = -(shot.focusY - 0.5) * WALL_H * shot.scale;
      }
      const distance = Math.abs(offset) / viewHeight;
      if (state.video) {
        // Played once, in step with the panel's entrance, then held on its
        // last frame; it never runs backwards or restarts.
        const video = state.video;
        const go = state.riseTime >= 0 && distance < 1.1 && !paused;
        if (go && video.paused && !video.ended)
          void video.play().catch(() => {});
        else if (!go && !video.paused) video.pause();
      }
      state.mesh.visible =
        state.status === "ready" &&
        (shot?.pinned ? (shot.presence ?? 1) > 0.002 : distance < 1.2);
      if (distance < LOAD_AHEAD && state.status === "idle")
        loadScene(state, index === 0);
      else if (
        distance > RELEASE_BEYOND &&
        state.status !== "idle" &&
        index !== 0
      )
        releaseScene(state);
      // Leaving the screen re-arms the entrance, so a panel rises again
      // each time the visitor comes back to it.
      if (distance > 1.1) state.riseTime = -1;
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
    // Every GPU resource was lost with the context: load the panels again.
    scenes.forEach((state) => {
      if (state.status !== "idle") releaseScene(state);
    });
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

  // Each panel, once fully loaded and on screen, rises out of the plaster,
  // holds at full depth for a breath, then settles to a soft resting relief
  // so the wall never reads as empty. The cursor still raises it fully.
  const animateEntrance = (state: SceneState, dt: number) => {
    const u = state.uniforms;
    if (state.status !== "ready") return;
    state.readyTime += dt;
    u.uReady.value = Math.min(1, state.readyTime / 0.5);
    // The cold open drives its own camera and stays dark until the cursor.
    if (state.spec.shot || !entrancesArmed) return;
    const rect = state.spec.anchor.getBoundingClientRect();
    const offset = Math.abs(rect.top + rect.height / 2 - viewHeight / 2);
    if (state.riseTime < 0) {
      if (offset / viewHeight > 0.45) {
        u.uRise.value = Math.max(0, u.uRise.value - dt * 0.5);
        return;
      }
      state.riseTime = 0;
    }
    state.riseTime += dt;
    // Pages that rest as bare plaster show nothing until the cursor or the
    // slow path reveals it, not even an entrance.
    if ((state.spec.rest ?? REST_RELIEF) === 0) {
      u.uRise.value = 0;
      return;
    }
    const t = state.riseTime;
    const ease = (x: number) => x * x * (3 - 2 * x);
    let rise: number;
    if (t < RISE_IN) rise = ease(t / RISE_IN);
    else if (t < RISE_IN + RISE_HOLD) rise = 1;
    else {
      const k = Math.min(1, (t - RISE_IN - RISE_HOLD) / RISE_SETTLE);
      const rest = state.spec.rest ?? REST_RELIEF;
      rise = 1 + (rest - 1) * ease(k);
    }
    u.uRise.value = rise;
  };

  function tick(now: number) {
    if (disposed) return;
    const rawMs = now - (lastTime || now);
    const dtMs = Math.min(64, rawMs);
    lastTime = now;
    // Nothing is visible under the intro, so the wall does no work until it
    // lifts (keeps the entry title smooth on slower GPUs).
    const covered = document.documentElement.classList.contains("is-loading");
    // Still place panels while covered: that is what starts their loading.
    if (covered && !contextLost) place();
    if (!document.hidden && !contextLost && !covered) {
      const dt = dtMs / 1000;
      place();
      shared.uTime.value = elapsed;
      for (const state of scenes) animateEntrance(state, dt);
      // Fast scrolling swells the whole visible carving, then it settles.
      const speed = Math.min(
        1,
        Math.abs(wallDelta) / Math.max(1, viewHeight * 0.05),
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
        fieldUniforms.uShift.value = wallDelta / viewHeight;
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
    /** Back from a hidden tab: drop stale pointer history and big frame gaps. */
    wake() {
      staleInput = true;
      lastTime = 0;
      if (!contextLost) render();
    },
    /** Start the carvings' entrances (called as the intro lifts). */
    reveal() {
      entrancesArmed = true;
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
