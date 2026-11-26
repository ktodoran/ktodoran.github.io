import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import BreakControls from './BreakControls.jsx';
import Sparkline from './Sparkline.jsx';
import SystemDiagram from './SystemDiagram.jsx';
import BuildStrip from '../components/BuildStrip.jsx';
import { LAYOUTS } from './layout.js';
import { ALERTS, BASELINE, isIncidentOpen } from './simulation.js';
import { systemStore } from './systemStore.js';
import { showIncidentInTab } from './tabStatus.js';

// The wide layout is used whenever it can be drawn at this scale or larger.
const WIDE_MIN_SCALE = 0.8;

function fit(layout, box) {
  return Math.min(box.width / layout.width, box.height / layout.height);
}

function clock(seconds) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

function Metric({ label, short, value, unit, values, floor, ceiling, alert }) {
  return (
    <div className="metric" data-alert={alert}>
      <dt>
        <span className="metric-long">{label}</span>
        <span className="metric-short">{short}</span>
      </dt>
      <dd>
        {value}
        {unit && <span className="metric-unit">{unit}</span>}
      </dd>
      <Sparkline values={values} floor={floor} ceiling={ceiling} />
    </div>
  );
}

// The pinned side of the stage: live numbers, the diagram, and what just happened.
export default function SystemPanel({ lit, tracer, trace, onSelect }) {
  const panel = useRef(null);
  const frame = useRef(null);
  const [layout, setLayout] = useState(LAYOUTS.wide);
  const { state, history } = useSyncExternalStore(systemStore.subscribe, systemStore.getSnapshot);

  // Only simulate while the panel is on screen, and draw whichever arrangement
  // of the diagram comes out larger in the space available.
  useEffect(() => {
    const node = panel.current;
    const visibility = new IntersectionObserver(([entry]) => systemStore.setRunning(entry.isIntersecting));
    const size = new ResizeObserver(([entry]) => {
      const wide = fit(LAYOUTS.wide, entry.contentRect);
      setLayout(wide >= WIDE_MIN_SCALE || wide >= fit(LAYOUTS.compact, entry.contentRect) ? LAYOUTS.wide : LAYOUTS.compact);
    });
    visibility.observe(node);
    size.observe(frame.current);
    return () => {
      visibility.disconnect();
      size.disconnect();
      systemStore.setRunning(false);
    };
  }, []);

  const open = isIncidentOpen(state);
  useEffect(() => {
    showIncidentInTab(open);
    return () => showIncidentInTab(false);
  }, [open]);

  // Times in the log are shown from the start of the incident they belong to.
  const startIndex = state.log.findLastIndex((entry) => entry.level === 'fault');
  const incident = startIndex >= 0 ? state.log.slice(startIndex) : [];
  const startedAt = incident[0]?.at ?? 0;
  const errorPercent = state.errorRate * 100;

  return (
    <div className="system" ref={panel}>
      <dl className="metrics">
        <Metric
          label="Requests per second"
          short="Requests"
          value={Math.round(state.rps).toLocaleString('en-US')}
          values={history.rps}
          floor={BASELINE.rps * 0.7}
          ceiling={BASELINE.rps * 1.1}
        />
        <Metric
          label="Response time, p95"
          short="Response"
          value={Math.round(state.latency).toLocaleString('en-US')}
          unit="ms"
          values={history.latency}
          floor={0}
          ceiling={400}
          alert={state.latency > ALERTS.latency}
        />
        <Metric
          label="Error rate"
          short="Errors"
          value={errorPercent < 1 ? errorPercent.toFixed(2) : errorPercent.toFixed(1)}
          unit="%"
          values={history.errorRate}
          floor={0}
          ceiling={0.02}
          alert={state.errorRate > ALERTS.errorRate}
        />
        <Metric
          label="Jobs waiting"
          short="Waiting"
          value={state.queue.toLocaleString('en-US')}
          values={history.queue}
          floor={0}
          ceiling={80}
          alert={state.queue > ALERTS.queue}
        />
      </dl>

      {/* One line of status for narrow panels, where there is no room for the log. */}
      <p className={`status-line accent-${trace?.color ?? 'red'}`} role="status" data-state={trace ? 'trace' : open ? 'incident' : 'normal'}>
        {trace ? (
          <>
            <b>
              Step {trace.step} of {trace.total}, {trace.name}.
            </b>{' '}
            {trace.text}
          </>
        ) : open && incident.length > 0 ? (
          <>
            <b>Incident, {clock(state.time - startedAt)}.</b> {incident.at(-1).text}
          </>
        ) : (
          'All systems normal'
        )}
      </p>

      <div className="diagram-frame" ref={frame}>
        <SystemDiagram layout={layout} state={state} lit={lit} tracer={tracer} onSelect={onSelect} />
      </div>

      <div className="system-foot">
        {trace ? (
          <div className={`incident accent-${trace.color}`} role="status">
            <p className="incident-status trace-status">
              Step {trace.step} of {trace.total}
              <span>{trace.name}</span>
            </p>
            <p className="trace-text">{trace.text}</p>
          </div>
        ) : (
          <div className="incident" data-open={open}>
            <p className="incident-status">{open ? `Incident in progress, ${clock(state.time - startedAt)}` : 'All systems normal'}</p>
            {incident.length === 0 ? (
              <p className="incident-empty">This is a simulation running in your browser. Nothing has gone wrong yet.</p>
            ) : (
              <ol className="incident-log" role="log" aria-label="Incident log">
                {incident.slice(-6).map((entry) => (
                  <li key={entry.at} data-level={entry.level}>
                    <time>{clock(entry.at - startedAt)}</time>
                    {entry.text}
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
        <BreakControls />
      </div>

      <BuildStrip />
    </div>
  );
}
