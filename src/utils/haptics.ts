// Haptic feedback utility combining navigator.vibrate with subtle Web Audio clicks
// for tactile physical feedback across both mobile devices and desktop/iframes.

let audioCtx: AudioContext | null = null;
let soundFeedbackEnabled = true;
let vibrationFeedbackEnabled = true;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Gentle, tactile micro-click synthesized with oscillator
function playTick(freq = 800, duration = 0.015, volume = 0.035) {
  if (!soundFeedbackEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + duration);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Ignore audio restrictions
  }
}

// Chime tone for success / completion
function playSuccessChime() {
  if (!soundFeedbackEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [520, 680].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);

      gain.gain.setValueAtTime(0.04, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.08);
    });
  } catch {
    // Ignore audio restrictions
  }
}

// Warning thud
function playWarningThud() {
  if (!soundFeedbackEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.07);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.07);
  } catch {
    // Ignore audio restrictions
  }
}

function vibrate(pattern: number | number[]) {
  if (!vibrationFeedbackEnabled) return;
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors
    }
  }
}

export const haptic = {
  // Ultra-light tap: for tabs, filters, segment toggles, swipes
  selection: () => {
    vibrate(8);
    playTick(950, 0.012, 0.025);
  },

  // Light tap: for stepper +/- buttons, chips, list clicks
  light: () => {
    vibrate(12);
    playTick(750, 0.015, 0.035);
  },

  // Medium tap: for buttons, actions, expanding sections
  medium: () => {
    vibrate(25);
    playTick(550, 0.022, 0.045);
  },

  // Heavy press: for prominent buttons, camera snaps
  heavy: () => {
    vibrate(40);
    playTick(400, 0.03, 0.055);
  },

  // Success: saved item, restored data, added category
  success: () => {
    vibrate([15, 45, 25]);
    playSuccessChime();
  },

  // Warning / Danger: delete item, remove category, clear all
  warning: () => {
    vibrate([35, 50, 35]);
    playWarningThud();
  },

  // Error / Destructive action
  error: () => {
    vibrate([50, 60, 50]);
    playWarningThud();
  },

  // Settings
  setSoundEnabled: (enabled: boolean) => {
    soundFeedbackEnabled = enabled;
  },
  setVibrationEnabled: (enabled: boolean) => {
    vibrationFeedbackEnabled = enabled;
  },
  isSoundEnabled: () => soundFeedbackEnabled,
  isVibrationEnabled: () => vibrationFeedbackEnabled,
};
