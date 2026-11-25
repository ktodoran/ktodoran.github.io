// A small simulated service: traffic, a job queue, workers, a database, and the
// monitoring and on-call loop around them. Pure functions with no DOM or timers,
// so the whole thing can be unit tested. Nothing here is scripted to a timeline:
// faults change what the system can do, the numbers follow, monitoring notices,
// and the response plays out from there.

export const BASELINE = {
  rps: 1280, // requests per second
  latency: 140, // p95, milliseconds
  errorRate: 0.0002, // fraction of requests
  workers: 4,
};

// Thresholds monitoring alerts on.
export const ALERTS = {
  errorRate: 0.05,
  queue: 200,
  latency: 800,
};

export const FAULTS = {
  database: {
    label: 'Take the database down',
    start: 'The database stopped responding.',
    fix: 'Failed over to the standby database.',
  },
  queue: {
    label: 'Flood the queue',
    start: 'A burst of jobs hit the queue.',
    fix: 'Scaled workers from 4 to 16.',
  },
  api: {
    label: 'Slow the API',
    start: 'A bad deploy slowed the API.',
    fix: 'Rolled back the latest deploy.',
  },
};

const JOBS_PER_REQUEST = 0.03;
const JOBS_PER_WORKER = 12; // jobs a worker finishes per second
const SCALED_WORKERS = 16;
const FLOOD_SECONDS = 7;
const FLOOD_MULTIPLIER = 6;

// How long each human or automated step in the response takes, in seconds.
const RESPONSE = {
  page: 1.2, // alert firing -> on-call paged
  acknowledge: 2, // paged -> acknowledged
  mitigate: 2.5, // acknowledged -> fix applied
  settle: 1.5, // healthy this long -> incident closed
};

export function createState() {
  return {
    time: 0,
    rps: BASELINE.rps,
    latency: BASELINE.latency,
    errorRate: BASELINE.errorRate,
    backlog: 0, // jobs waiting beyond what is in flight
    queue: Math.round(BASELINE.rps * JOBS_PER_REQUEST * 0.3),
    workers: BASELINE.workers,
    writes: Math.round(BASELINE.rps * JOBS_PER_REQUEST),
    fault: null, // { kind, since }
    mitigated: false,
    alert: null, // { reason, since }
    oncall: 'idle', // idle | paged | acknowledged
    oncallSince: 0,
    healthySince: 0,
    health: healthOf(null, false, 0),
    log: [],
  };
}

function healthOf(fault, mitigated, backlog) {
  const kind = fault?.kind;
  const broken = Boolean(fault) && !mitigated;
  return {
    clients: 'ok',
    api: kind === 'api' && broken ? 'down' : kind === 'database' && broken ? 'degraded' : 'ok',
    model: 'ok',
    queue: backlog > ALERTS.queue ? 'degraded' : 'ok',
    workers: kind === 'database' && broken ? 'degraded' : 'ok',
    cache: 'ok',
    database: kind === 'database' && broken ? 'down' : 'ok',
  };
}

// Moves `value` toward `target`, covering most of the gap in `seconds`.
function approach(value, target, seconds, dt) {
  return value + (target - value) * (1 - Math.exp(-dt / seconds));
}

function record(state, text, level = 'info') {
  state.log = [...state.log, { at: state.time, text, level }].slice(-30);
}

// Starts a fault. Ignored while an incident is already open: one thing at a time.
export function inject(state, kind) {
  if (state.fault || state.alert || !FAULTS[kind]) return state;
  const next = { ...state, fault: { kind, since: state.time }, mitigated: false };
  record(next, FAULTS[kind].start, 'fault');
  return next;
}

// Advances the simulation by `dt` seconds. `jitter` returns 0..1 and only adds
// life to the displayed traffic; it never decides what happens.
export function step(state, dt, jitter = () => 0.5) {
  const next = { ...state, time: state.time + dt };
  const kind = next.fault?.kind;
  const broken = Boolean(next.fault) && !next.mitigated;

  const databaseUp = !(kind === 'database' && broken);
  const apiSlow = kind === 'api' && broken;
  const flooding = kind === 'queue' && next.time - next.fault.since < FLOOD_SECONDS;

  // Traffic and the API's own health.
  const wobble = 1 + (jitter() - 0.5) * 0.04;
  next.rps = approach(next.rps, BASELINE.rps * (apiSlow ? 0.8 : 1) * wobble, 0.8, dt);
  next.latency = approach(next.latency, apiSlow ? 1400 : databaseUp ? BASELINE.latency : 620, 1.1, dt);
  next.errorRate = approach(next.errorRate, !databaseUp ? 0.36 : apiSlow ? 0.03 : BASELINE.errorRate, 0.9, dt);

  // The queue: jobs arrive with traffic and leave as fast as workers can write them.
  const arrivals = next.rps * JOBS_PER_REQUEST * (flooding ? FLOOD_MULTIPLIER : 1);
  const capacity = databaseUp ? next.workers * JOBS_PER_WORKER : 0;
  next.backlog = Math.max(0, next.backlog + (arrivals - capacity) * dt);
  next.queue = Math.round(next.backlog + Math.min(arrivals, capacity || arrivals) * 0.3);
  next.writes = Math.round(Math.min(capacity, arrivals + next.backlog / Math.max(dt, 0.001)));

  // Extra workers stay until the backlog is gone, then scale back in.
  if (next.workers > BASELINE.workers && next.backlog === 0 && !flooding) next.workers = BASELINE.workers;

  // Monitoring: notice a breach, page, wait for the acknowledgement, apply the fix.
  const breach =
    next.errorRate > ALERTS.errorRate
      ? 'error rate above 5%'
      : next.queue > ALERTS.queue
        ? 'more than 200 jobs waiting'
        : next.latency > ALERTS.latency
          ? 'response time above 800 ms'
          : null;

  if (breach && !next.alert) {
    next.alert = { reason: breach, since: next.time };
    record(next, `Alert: ${breach}.`, 'alert');
  }

  if (next.alert && next.oncall === 'idle' && next.time - next.alert.since >= RESPONSE.page) {
    next.oncall = 'paged';
    next.oncallSince = next.time;
    record(next, 'On-call engineer paged.', 'alert');
  } else if (next.oncall === 'paged' && next.time - next.oncallSince >= RESPONSE.acknowledge) {
    next.oncall = 'acknowledged';
    next.oncallSince = next.time;
    record(next, 'Page acknowledged.');
  } else if (next.oncall === 'acknowledged' && broken && next.time - next.oncallSince >= RESPONSE.mitigate) {
    next.mitigated = true;
    if (kind !== 'api') next.workers = SCALED_WORKERS; // clear whatever backed up
    record(next, FAULTS[kind].fix, 'fix');
  }

  // Close the incident once everything has been healthy for a moment.
  const settled = !breach && next.backlog === 0 && (!next.fault || next.mitigated) && !flooding;
  if (!settled) next.healthySince = next.time;
  if (next.alert && settled && next.time - next.healthySince >= RESPONSE.settle) {
    record(next, 'Back to normal. Incident closed.', 'fix');
    next.alert = null;
    next.fault = null;
    next.mitigated = false;
    next.oncall = 'idle';
  }

  next.health = healthOf(next.fault, next.mitigated, next.backlog);
  return next;
}

export function isIncidentOpen(state) {
  return Boolean(state.fault || state.alert);
}
