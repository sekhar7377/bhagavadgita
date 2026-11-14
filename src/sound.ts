/**
 * Ambient score, synthesised in the browser so no recording is needed:
 * a tanpura-like drone (four strings plucked in a slow cycle, Pa–Sa–Sa–low
 * Sa, each note "blooming" brighter after the pluck the way a tanpura's
 * curved jawari bridge makes it shimmer) over a soft wind. Scrolling raises
 * the wind a little. Nothing plays until the visitor asks for sound.
 *
 * The cold open adds a heartbeat: a 40 Hz "lub-dub" (with a soft 80 Hz
 * overtone so small speakers can carry it) under the wind. `setMix` fades
 * between the heartbeat and the drone as the camera pulls back.
 */

const SA = 138.59; // C#3, a common tonic for a male-voice tanpura
const STRINGS = [SA * 0.75, SA, SA, SA / 2]; // Pa (fifth below Sa), Sa, Sa, low Sa
const PLUCK_GAP = 1.15; // seconds between plucks
const MASTER = 0.22;
const HEART_GAP = 1.15; // seconds between heartbeats (about 52 bpm)

export type Sound = ReturnType<typeof createSound>;

export function createSound() {
  let context: AudioContext | null = null;
  let master: GainNode | null = null;
  let windGain: GainNode | null = null;
  let windFilter: BiquadFilterNode | null = null;
  let droneGain: GainNode | null = null;
  let heartGain: GainNode | null = null;
  let nextBeat = 0;
  let mix = { heart: 0, drone: 1 };
  let tone: PeriodicWave | null = null;
  let timer = 0;
  let nextPluck = 0;
  let stringIndex = 0;
  let enabled = false;
  let energy = 0;
  const listeners = new Set<(on: boolean) => void>();

  const build = () => {
    const ctx = new AudioContext();
    context = ctx;
    master = ctx.createGain();
    master.gain.value = 0;
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.ratio.value = 3;
    master.connect(compressor).connect(ctx.destination);
    droneGain = ctx.createGain();
    droneGain.gain.value = mix.drone;
    droneGain.connect(master);
    heartGain = ctx.createGain();
    heartGain.gain.value = mix.heart;
    heartGain.connect(master);

    // A string's spectrum: strong low partials, a long gentle tail.
    const partials = 24;
    const real = new Float32Array(partials + 1);
    const imag = new Float32Array(partials + 1);
    for (let n = 1; n <= partials; n++) imag[n] = 1 / Math.pow(n, 0.85);
    tone = ctx.createPeriodicWave(real, imag);

    // Wind: looping pink-ish noise through a slowly wandering band-pass.
    const length = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + white * 0.029;
      b1 = 0.985 * b1 + white * 0.032;
      b2 = 0.95 * b2 + white * 0.048;
      data[i] = (b0 + b1 + b2) * 0.6;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    windFilter = ctx.createBiquadFilter();
    windFilter.type = "bandpass";
    windFilter.frequency.value = 420;
    windFilter.Q.value = 0.7;
    const sway = ctx.createOscillator();
    sway.frequency.value = 0.07;
    const swayDepth = ctx.createGain();
    swayDepth.gain.value = 160;
    sway.connect(swayDepth).connect(windFilter.frequency);
    windGain = ctx.createGain();
    windGain.gain.value = 0.05;
    noise.connect(windFilter).connect(windGain).connect(master);
    noise.start();
    sway.start();
  };

  const pluck = (time: number, frequency: number) => {
    if (!context || !master || !tone) return;
    const ctx = context;
    const osc = ctx.createOscillator();
    osc.setPeriodicWave(tone);
    // Tiny random detune keeps the cycle from sounding mechanical.
    osc.frequency.value = frequency * (1 + (Math.random() - 0.5) * 0.002);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 2.5;
    // Jawari bloom: the brightness swells after the pluck, then fades.
    filter.frequency.setValueAtTime(frequency * 3, time);
    filter.frequency.linearRampToValueAtTime(frequency * 22, time + 0.45);
    filter.frequency.exponentialRampToValueAtTime(frequency * 4, time + 4.2);
    const gain = ctx.createGain();
    const level = frequency < SA * 0.6 ? 0.2 : 0.14;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(level, time + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0008, time + 4.6);
    osc.connect(filter).connect(gain).connect(droneGain!);
    osc.start(time);
    osc.stop(time + 4.7);
  };

  // One heartbeat thump: a falling low sine with a fast attack.
  const thump = (time: number, strength: number) => {
    if (!context || !heartGain) return;
    const ctx = context;
    for (const [frequency, level] of [
      [40, 0.9],
      [80, 0.25],
    ]) {
      const osc = ctx.createOscillator();
      osc.frequency.setValueAtTime(frequency * 1.5, time);
      osc.frequency.exponentialRampToValueAtTime(frequency, time + 0.06);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(level * strength, time + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0005, time + 0.32);
      osc.connect(gain).connect(heartGain);
      osc.start(time);
      osc.stop(time + 0.35);
    }
  };

  // Schedule plucks slightly ahead of time so timer jitter never shows.
  const schedule = () => {
    if (!context) return;
    while (nextPluck < context.currentTime + 0.4) {
      pluck(nextPluck, STRINGS[stringIndex]);
      stringIndex = (stringIndex + 1) % STRINGS.length;
      // The cycle breathes: a longer pause after the low Sa.
      nextPluck += stringIndex === 0 ? PLUCK_GAP * 1.6 : PLUCK_GAP;
    }
    while (nextBeat < context.currentTime + 0.4) {
      thump(nextBeat, 1);
      thump(nextBeat + 0.27, 0.6);
      nextBeat += HEART_GAP;
    }
  };

  const notify = () => listeners.forEach((listener) => listener(enabled));

  return {
    get enabled() {
      return enabled;
    },
    /** Must be called from a user gesture (browsers require it for audio). */
    async enable() {
      if (enabled) return;
      if (!context) build();
      const ctx = context!;
      if (ctx.state === "suspended") await ctx.resume();
      enabled = true;
      nextPluck = Math.max(nextPluck, ctx.currentTime + 0.15);
      nextBeat = Math.max(nextBeat, ctx.currentTime + 0.1);
      schedule();
      window.clearInterval(timer);
      timer = window.setInterval(schedule, 120);
      master!.gain.cancelScheduledValues(ctx.currentTime);
      master!.gain.setTargetAtTime(MASTER, ctx.currentTime, 1.2);
      notify();
    },
    disable() {
      if (!enabled || !context || !master) return;
      enabled = false;
      const ctx = context;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.35);
      window.clearInterval(timer);
      window.setTimeout(() => {
        if (!enabled) void ctx.suspend();
      }, 1800);
      notify();
    },
    toggle() {
      return enabled ? this.disable() : this.enable();
    },
    /** 0..1, e.g. scroll speed: the wind rises and brightens with it. */
    setEnergy(value: number) {
      if (!context || !windGain || !windFilter || !enabled) return;
      const target = Math.min(1, Math.max(0, value));
      if (Math.abs(target - energy) < 0.02) return;
      energy = target;
      const now = context.currentTime;
      windGain.gain.setTargetAtTime(0.05 + energy * 0.12, now, 0.25);
      windFilter.Q.setTargetAtTime(0.7 - energy * 0.3, now, 0.25);
    },
    /** Heartbeat and drone levels, 0..1 each (the cold open crossfades them). */
    setMix(heart: number, drone: number) {
      const next = {
        heart: Math.max(0, Math.min(1, heart)),
        drone: Math.max(0, Math.min(1, drone)),
      };
      if (
        Math.abs(next.heart - mix.heart) + Math.abs(next.drone - mix.drone) <
        0.02
      )
        return;
      mix = next;
      if (!context || !heartGain || !droneGain) return;
      const now = context.currentTime;
      heartGain.gain.setTargetAtTime(mix.heart, now, 0.3);
      droneGain.gain.setTargetAtTime(mix.drone, now, 0.3);
    },
    onChange(listener: (on: boolean) => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose() {
      window.clearInterval(timer);
      listeners.clear();
      void context?.close();
    },
  };
}
