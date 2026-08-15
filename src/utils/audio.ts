/**
 * Web Audio API synthesizer for sound effects and festive birthday music
 * Works in all browsers without external audio files!
 */

let audioCtx: AudioContext | null = null;
let isMuted = false;
let isBgmPlaying = false;
let bgmIntervalId: number | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSoundMuted(muted: boolean) {
  isMuted = muted;
  if (muted && isBgmPlaying) {
    stopBackgroundMelody();
  }
}

export function getSoundMuted(): boolean {
  return isMuted;
}

export function playPopSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(450, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.09);
}

export function playSparkleSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6
  freqs.forEach((f, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = ctx.currentTime + index * 0.05;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, startTime);

    gain.gain.setValueAtTime(0.12, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.35);
  });
}

export function playBlowSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  // Pink noise / whoosh approximation
  const bufferSize = ctx.sampleRate * 0.4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.35);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start();
  noise.stop(ctx.currentTime + 0.4);
}

export function playFanfareSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  // Celebration chords
  const notes = [
    { freq: 523.25, time: 0, dur: 0.15 },    // C5
    { freq: 523.25, time: 0.15, dur: 0.15 }, // C5
    { freq: 523.25, time: 0.30, dur: 0.15 }, // C5
    { freq: 659.25, time: 0.45, dur: 0.4 },  // E5
    { freq: 783.99, time: 0.85, dur: 0.2 },  // G5
    { freq: 1046.5, time: 1.05, dur: 0.8 },  // C6
  ];

  notes.forEach((n) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const st = ctx.currentTime + n.time;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(n.freq, st);

    gain.gain.setValueAtTime(0.2, st);
    gain.gain.exponentialRampToValueAtTime(0.001, st + n.dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(st);
    osc.stop(st + n.dur + 0.05);
  });
}

// Happy Birthday Song synth note sequence
const HB_MELODY = [
  { note: 261.63, dur: 0.3 }, // C4
  { note: 261.63, dur: 0.3 }, // C4
  { note: 293.66, dur: 0.6 }, // D4
  { note: 261.63, dur: 0.6 }, // C4
  { note: 349.23, dur: 0.6 }, // F4
  { note: 329.63, dur: 1.2 }, // E4
  { note: 261.63, dur: 0.3 }, // C4
  { note: 261.63, dur: 0.3 }, // C4
  { note: 293.66, dur: 0.6 }, // D4
  { note: 261.63, dur: 0.6 }, // C4
  { note: 392.00, dur: 0.6 }, // G4
  { note: 349.23, dur: 1.2 }, // F4
  { note: 261.63, dur: 0.3 }, // C4
  { note: 261.63, dur: 0.3 }, // C4
  { note: 523.25, dur: 0.6 }, // C5
  { note: 440.00, dur: 0.6 }, // A4
  { note: 349.23, dur: 0.6 }, // F4
  { note: 329.63, dur: 0.6 }, // E4
  { note: 293.66, dur: 0.9 }, // D4
  { note: 466.16, dur: 0.3 }, // Bb4
  { note: 466.16, dur: 0.3 }, // Bb4
  { note: 440.00, dur: 0.6 }, // A4
  { note: 349.23, dur: 0.6 }, // F4
  { note: 392.00, dur: 0.6 }, // G4
  { note: 349.23, dur: 1.4 }, // F4
];

export function playHappyBirthdayTune() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  let currentOffset = 0;
  HB_MELODY.forEach((item) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const st = ctx.currentTime + currentOffset;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(item.note, st);

    // Warm bell envelope
    gain.gain.setValueAtTime(0.001, st);
    gain.gain.linearRampToValueAtTime(0.18, st + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, st + item.dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(st);
    osc.stop(st + item.dur + 0.05);

    currentOffset += item.dur * 0.75;
  });
}

export function playCuteMeow() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(850, ctx.currentTime + 0.15);
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.35);

  gain.gain.setValueAtTime(0.001, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.38);
}

export function startBackgroundMelody() {
  if (isBgmPlaying) return;
  isBgmPlaying = true;
  playHappyBirthdayTune();

  // Play every 22 seconds
  bgmIntervalId = window.setInterval(() => {
    if (!isMuted && isBgmPlaying) {
      playHappyBirthdayTune();
    }
  }, 22000);
}

export function stopBackgroundMelody() {
  isBgmPlaying = false;
  if (bgmIntervalId) {
    clearInterval(bgmIntervalId);
    bgmIntervalId = null;
  }
}

export function isBgmActive(): boolean {
  return isBgmPlaying;
}
