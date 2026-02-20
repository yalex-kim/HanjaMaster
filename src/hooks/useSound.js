import { useState, useCallback, useRef } from 'react';

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(ctx, frequency, duration, waveType = 'sine', startTime = 0) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = waveType;
  osc.frequency.value = frequency;
  gain.gain.value = 0.1;
  osc.connect(gain);
  gain.connect(ctx.destination);
  const t = ctx.currentTime + startTime;
  osc.start(t);
  osc.stop(t + duration / 1000);
}

const sounds = {
  correct: (ctx) => {
    playTone(ctx, 523, 100, 'sine', 0);
    playTone(ctx, 659, 100, 'sine', 0.1);
    playTone(ctx, 784, 100, 'sine', 0.2);
  },
  wrong: (ctx) => {
    playTone(ctx, 200, 300, 'sawtooth', 0);
  },
  levelup: (ctx) => {
    playTone(ctx, 440, 120, 'sine', 0);
    playTone(ctx, 554, 120, 'sine', 0.12);
    playTone(ctx, 659, 120, 'sine', 0.24);
    playTone(ctx, 880, 120, 'sine', 0.36);
  },
  flip: (ctx) => {
    playTone(ctx, 800, 50, 'sine', 0);
  },
  click: (ctx) => {
    playTone(ctx, 600, 30, 'sine', 0);
  },
};

export function useSound() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const enabledRef = useRef(true);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      enabledRef.current = !prev;
      return !prev;
    });
  }, []);

  const playSound = useCallback((type) => {
    if (!enabledRef.current) return;
    try {
      const ctx = getAudioContext();
      const fn = sounds[type];
      if (fn) fn(ctx);
    } catch {
      // Audio not available
    }
  }, []);

  return { playSound, soundEnabled, toggleSound };
}
