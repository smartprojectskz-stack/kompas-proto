"use client";

// All sounds here are synthesized in the browser with the Web Audio API —
// no downloaded audio files, so there is nothing to license or host.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem("firefly_sound") !== "off";
  } catch {
    return true;
  }
}

const soundListeners = new Set<() => void>();

/** For useSyncExternalStore — lets components re-render when the sound preference changes. */
export function subscribeSoundEnabled(callback: () => void): () => void {
  soundListeners.add(callback);
  return () => soundListeners.delete(callback);
}

export function setSoundEnabled(enabled: boolean) {
  try {
    localStorage.setItem("firefly_sound", enabled ? "on" : "off");
  } catch {
    // ignore (private browsing, etc.)
  }
  if (!enabled) stopAmbient();
  soundListeners.forEach((cb) => cb());
}

/** Soft tap sound for choosing an option. */
export function playPop() {
  if (!isSoundEnabled()) return;
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(520, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(300, c.currentTime + 0.12);
  gain.gain.setValueAtTime(0.12, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.16);
}

/** Gentle three-note chime for a positive moment (e.g. finishing a check-in). */
export function playChime() {
  if (!isSoundEnabled()) return;
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now + i * 0.09);
    gain.gain.linearRampToValueAtTime(0.09, now + i * 0.09 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.6);
    osc.connect(gain).connect(c.destination);
    osc.start(now + i * 0.09);
    osc.stop(now + i * 0.09 + 0.65);
  });
}

interface AmbientNodes {
  osc1: OscillatorNode;
  osc2: OscillatorNode;
  lfo: OscillatorNode;
  gain: GainNode;
}

let ambient: AmbientNodes | null = null;

/** Soft, slowly breathing two-tone pad — a free, generated stand-in for calming ambient music. */
export function startAmbient() {
  if (ambient || !isSoundEnabled()) return;
  const c = getCtx();
  if (!c) return;

  const gain = c.createGain();
  gain.gain.value = 0;
  gain.connect(c.destination);
  gain.gain.linearRampToValueAtTime(0.05, c.currentTime + 1.5);

  const osc1 = c.createOscillator();
  osc1.type = "sine";
  osc1.frequency.value = 174.6; // low, grounding tone
  const osc2 = c.createOscillator();
  osc2.type = "sine";
  osc2.frequency.value = 220; // a calm fifth above

  const lfo = c.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.12; // slow swell, like breathing
  const lfoGain = c.createGain();
  lfoGain.gain.value = 0.025;
  lfo.connect(lfoGain).connect(gain.gain);

  osc1.connect(gain);
  osc2.connect(gain);
  osc1.start();
  osc2.start();
  lfo.start();

  ambient = { osc1, osc2, lfo, gain };
}

export function stopAmbient() {
  if (!ambient) return;
  const c = getCtx();
  const { osc1, osc2, lfo, gain } = ambient;
  if (c) {
    gain.gain.linearRampToValueAtTime(0, c.currentTime + 0.8);
  }
  setTimeout(() => {
    try {
      osc1.stop();
      osc2.stop();
      lfo.stop();
    } catch {
      // already stopped
    }
  }, 850);
  ambient = null;
}

export function isAmbientPlaying(): boolean {
  return !!ambient;
}
