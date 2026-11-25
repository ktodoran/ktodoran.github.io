import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ALERTS, BASELINE, createState, FAULTS, inject, isIncidentOpen, step } from './simulation.js';

const DT = 0.1;

function run(state, seconds, onStep) {
  let current = state;
  for (let i = 0; i < Math.round(seconds / DT); i += 1) {
    current = step(current, DT);
    onStep?.(current);
  }
  return current;
}

const texts = (state) => state.log.map((entry) => entry.text);

function assertNearBaseline(state) {
  assert.ok(Math.abs(state.rps - BASELINE.rps) < 40, `rps ${state.rps}`);
  assert.ok(Math.abs(state.latency - BASELINE.latency) < 15, `latency ${state.latency}`);
  assert.ok(state.errorRate < 0.002, `error rate ${state.errorRate}`);
  assert.equal(state.backlog, 0);
  assert.equal(state.workers, BASELINE.workers);
}

test('a healthy system stays healthy and quiet', () => {
  const end = run(createState(), 120, (state) => {
    assert.equal(state.alert, null);
    assert.equal(state.oncall, 'idle');
    assert.ok(state.backlog >= 0);
  });
  assertNearBaseline(end);
  assert.deepEqual(end.log, []);
});

for (const kind of Object.keys(FAULTS)) {
  test(`${kind} fault: alert, page, acknowledge, fix, recover`, () => {
    let peak = { errorRate: 0, queue: 0, latency: 0 };
    let sawPaged = false;
    let sawAcknowledged = false;

    const end = run(inject(createState(), kind), 60, (state) => {
      peak = {
        errorRate: Math.max(peak.errorRate, state.errorRate),
        queue: Math.max(peak.queue, state.queue),
        latency: Math.max(peak.latency, state.latency),
      };
      sawPaged ||= state.oncall === 'paged';
      sawAcknowledged ||= state.oncall === 'acknowledged';
      assert.ok(state.backlog >= 0);
    });

    // Something measurable actually broke.
    assert.ok(
      peak.errorRate > ALERTS.errorRate || peak.queue > ALERTS.queue || peak.latency > ALERTS.latency,
      JSON.stringify(peak),
    );
    assert.ok(sawPaged && sawAcknowledged);

    // The response happened in order.
    const log = texts(end);
    const order = [FAULTS[kind].start, 'On-call engineer paged.', 'Page acknowledged.', FAULTS[kind].fix, 'Back to normal. Incident closed.'];
    const positions = order.map((text) => log.indexOf(text));
    assert.ok(positions.every((position) => position >= 0), log.join(' | '));
    assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
    assert.ok(log.some((text) => text.startsWith('Alert:')));

    // And the system is back where it started.
    assert.equal(isIncidentOpen(end), false);
    assert.equal(end.oncall, 'idle');
    assertNearBaseline(end);
  });
}

test('the database fault backs the queue up because workers cannot write', () => {
  const during = run(inject(createState(), 'database'), 4);
  assert.equal(during.health.database, 'down');
  assert.equal(during.writes, 0);
  assert.ok(during.queue > 100, `queue ${during.queue}`);
});

test('nobody is paged before monitoring has raised an alert', () => {
  run(inject(createState(), 'api'), 30, (state) => {
    if (state.oncall !== 'idle') assert.notEqual(state.alert, null);
  });
});

test('a second fault is ignored while an incident is open', () => {
  const first = run(inject(createState(), 'database'), 2);
  const second = inject(first, 'api');
  assert.equal(second, first);
  assert.equal(second.fault.kind, 'database');
});

test('unknown faults are ignored', () => {
  const state = createState();
  assert.equal(inject(state, 'nope'), state);
});

test('step does not mutate the state it is given', () => {
  const state = inject(createState(), 'queue');
  const snapshot = JSON.stringify(state);
  step(state, DT);
  assert.equal(JSON.stringify(state), snapshot);
});
