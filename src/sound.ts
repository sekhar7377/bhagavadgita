/**
 * The site's score: a recorded flute piece, looped, faded in when the
 * visitor asks for sound and faded out when they turn it off or leave the
 * tab. Nothing downloads or plays until then.
 *
 * Each page is its own document, so the playing position is kept in
 * sessionStorage and the music carries on from where it was on the next
 * page instead of starting over.
 *
 * The dice hall's cast of dice is still synthesised and plays over it.
 */

const TRACK = `${import.meta.env.BASE_URL}audio/flute.mp3`;
const MUSIC = 0.7; // the recording is mastered loud; this sits under reading
const EFFECTS = 0.22;
const POSITION_KEY = "gita-music-position";

export type Sound = ReturnType<typeof createSound>;

export function createSound() {
  let context: AudioContext | null = null;
  let out: GainNode | null = null;
  let effects: GainNode | null = null;
  let audio: HTMLAudioElement | null = null;
  let enabled = false;
  let pauseTimer = 0;
  const listeners = new Set<(on: boolean) => void>();

  const savePosition = () => {
    if (!audio) return;
    try {
      sessionStorage.setItem(POSITION_KEY, String(audio.currentTime));
    } catch {
      /* storage blocked: the music simply restarts on the next page */
    }
  };

  const build = () => {
    const ctx = new AudioContext();
    context = ctx;
    out = ctx.createGain();
    out.gain.value = 0;
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.ratio.value = 3;
    out.connect(compressor).connect(ctx.destination);

    effects = ctx.createGain();
    effects.gain.value = EFFECTS;
    effects.connect(out);

    audio = new Audio();
    audio.src = TRACK;
    audio.loop = true;
    audio.preload = "auto";
    let saved = 0;
    try {
      saved = Number(sessionStorage.getItem(POSITION_KEY)) || 0;
    } catch {
      /* no saved position */
    }
    // Seeking only sticks once the file's length is known.
    if (saved > 0)
      audio.addEventListener(
        "loadedmetadata",
        () => {
          if (saved < audio!.duration) audio!.currentTime = saved;
        },
        { once: true },
      );
    const music = ctx.createGain();
    music.gain.value = MUSIC;
    ctx.createMediaElementSource(audio).connect(music).connect(out);
    window.addEventListener("pagehide", savePosition);
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
      enabled = true;
      window.clearTimeout(pauseTimer);
      // play() must start inside the gesture, before any await.
      const playing = audio!.play().catch(() => undefined);
      if (ctx.state === "suspended") await ctx.resume();
      await playing;
      out!.gain.cancelScheduledValues(ctx.currentTime);
      out!.gain.setTargetAtTime(1, ctx.currentTime, 1.2);
      notify();
    },
    disable() {
      if (!enabled || !context || !out) return;
      enabled = false;
      const ctx = context;
      out.gain.cancelScheduledValues(ctx.currentTime);
      out.gain.setTargetAtTime(0, ctx.currentTime, 0.35);
      pauseTimer = window.setTimeout(() => {
        if (enabled) return;
        audio?.pause();
        savePosition();
        void ctx.suspend();
      }, 1800);
      notify();
    },
    toggle() {
      return enabled ? this.disable() : this.enable();
    },
    /** Kept for callers; the recorded score doesn't follow scroll speed. */
    setEnergy(_value: number) {},
    /** Kept for callers; the recorded score has no separate layers. */
    setMix(_heart: number, _drone: number) {},
    /**
     * A cast of dice: two hard ivory clicks and a soft rattle, like dice
     * striking a board. Used as each stake is reached in the dice hall.
     */
    dice() {
      if (!enabled || !context || !effects) return;
      const ctx = context;
      const now = ctx.currentTime;
      const length = Math.floor(ctx.sampleRate * 0.05);
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++)
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 6);
      for (const [delay, level, freq] of [
        [0, 0.55, 2600],
        [0.075, 0.4, 3100],
        [0.13, 0.18, 2200],
        [0.17, 0.1, 2800],
      ]) {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const band = ctx.createBiquadFilter();
        band.type = "bandpass";
        band.frequency.value = freq;
        band.Q.value = 3;
        const gain = ctx.createGain();
        gain.gain.value = level;
        source.connect(band).connect(gain).connect(effects);
        source.start(now + delay);
      }
      // The board's low knock under the first strike.
      const knock = ctx.createOscillator();
      knock.frequency.setValueAtTime(140, now);
      knock.frequency.exponentialRampToValueAtTime(60, now + 0.08);
      const knockGain = ctx.createGain();
      knockGain.gain.setValueAtTime(0.35, now);
      knockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      knock.connect(knockGain).connect(effects);
      knock.start(now);
      knock.stop(now + 0.14);
    },
    onChange(listener: (on: boolean) => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose() {
      window.clearTimeout(pauseTimer);
      savePosition();
      audio?.pause();
      listeners.clear();
      void context?.close();
    },
  };
}
