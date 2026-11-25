import { createState, inject, step } from './simulation.js';

// Runs the simulation on a timer and lets React subscribe to it. One store per
// page. The timer stops whenever the tab is hidden or the panel is off screen.

const TICK_MS = 100;
const HISTORY = 60;
const SAMPLE_EVERY = 3; // ticks between sparkline samples

function createSystemStore() {
  let state = createState();
  let history = { rps: [], latency: [], errorRate: [], queue: [] };
  let snapshot = { state, history };
  let timer = null;
  let ticks = 0;
  let wanted = false;
  const listeners = new Set();

  const publish = () => {
    snapshot = { state, history };
    listeners.forEach((listener) => listener());
  };

  const sample = () => {
    const push = (key) => [...history[key], state[key]].slice(-HISTORY);
    history = { rps: push('rps'), latency: push('latency'), errorRate: push('errorRate'), queue: push('queue') };
  };

  const tick = () => {
    state = step(state, TICK_MS / 1000, Math.random);
    ticks += 1;
    if (ticks % SAMPLE_EVERY === 0) sample();
    publish();
  };

  const sync = () => {
    const shouldRun = wanted && document.visibilityState === 'visible';
    if (shouldRun && !timer) timer = setInterval(tick, TICK_MS);
    if (!shouldRun && timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  // Start with a full, slightly lively history so the sparklines aren't empty.
  for (let i = 0; i < HISTORY * SAMPLE_EVERY; i += 1) {
    state = step(state, TICK_MS / 1000, Math.random);
    if (i % SAMPLE_EVERY === 0) sample();
  }
  state = { ...state, time: 0 };
  snapshot = { state, history };

  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', sync);

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => snapshot,
    // Read without subscribing; used by the animation loop.
    peek: () => state,
    setRunning(value) {
      wanted = value;
      sync();
    },
    inject(kind) {
      state = inject(state, kind);
      publish();
    },
  };
}

export const systemStore = createSystemStore();
