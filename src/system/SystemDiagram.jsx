import { useEffect, useMemo, useRef, useState } from 'react';
import { COMPONENT_DEPTH, COMPONENT_LAYER, COMPONENT_NAME } from './layout.js';
import { systemStore } from './systemStore.js';

const PER_EDGE = 3; // requests drawn on each edge
const SAMPLES = 48; // points sampled along each edge path
const INTRO_MS = 1600; // how long the load-in styles stay applied

function detailFor(id, state) {
  switch (id) {
    case 'clients':
      return 'Web and mobile';
    case 'api':
      return state.health.api === 'down' ? 'Slow to respond' : `${Math.round(state.latency)} ms at p95`;
    case 'model':
      return 'Suggests only';
    case 'queue':
      return `${state.queue.toLocaleString('en-US')} jobs waiting`;
    case 'workers':
      return `${state.workers} running`;
    case 'cache':
      return '96% of reads';
    case 'database':
      return state.health.database === 'down' ? 'Not responding' : `${state.writes} writes/s`;
    case 'monitoring':
      return state.alert ? 'Alert firing' : 'Logs, metrics, alerts';
    case 'oncall':
      return state.oncall === 'paged' ? 'Paged' : state.oncall === 'acknowledged' ? 'On it' : 'Nothing open';
    default:
      return '';
  }
}

function statusOf(id, state) {
  if (id === 'monitoring') return state.alert ? 'down' : 'ok';
  if (id === 'oncall') return state.oncall === 'idle' ? 'ok' : state.oncall === 'paged' ? 'down' : 'degraded';
  return state.health[id];
}

// The running system. `state` re-renders the labels a few times a second;
// the requests moving along the edges are animated outside React.
export default function SystemDiagram({ layout, state, lit, tracer, onSelect }) {
  const svg = useRef(null);
  const dots = useRef([]);

  // On first load the diagram switches on in the order a request travels.
  // The sequence itself is CSS; this only takes its styles away afterwards.
  const [intro, setIntro] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIntro(false), INTRO_MS);
    return () => clearTimeout(timer);
  }, []);

  // Sample every edge path once, so the animation loop is plain array lookups.
  const tracks = useRef([]);
  useEffect(() => {
    tracks.current = layout.edges.map((edge) => {
      const path = svg.current.querySelector(`[data-edge="${edge.id}"]`);
      const length = path.getTotalLength();
      return Array.from({ length: SAMPLES + 1 }, (_, i) => path.getPointAtLength((i / SAMPLES) * length));
    });
  }, [layout]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let last = performance.now();
    let clock = 0;

    const draw = (now) => {
      frame = requestAnimationFrame(draw);
      const system = systemStore.peek();
      // Requests crawl when the API is slow.
      const speed = system.health.api === 'down' ? 0.12 : 0.34;
      // The first frame's timestamp can predate `last`, so never step backwards.
      clock += Math.min(Math.max(now - last, 0) / 1000, 0.1) * speed;
      last = now;

      layout.edges.forEach((edge, e) => {
        const track = tracks.current[e];
        if (!track) return;
        // A request can't get into a component that is down: it stalls and fails.
        const blocked = system.health[edge.to] === 'down' && edge.to !== 'api';
        for (let i = 0; i < PER_EDGE; i += 1) {
          const dot = dots.current[e * PER_EDGE + i];
          if (!dot) continue;
          const progress = (clock + i / PER_EDGE + e * 0.137) % 1;
          const reach = blocked ? Math.min(progress, 0.62) : progress;
          const point = track[Math.round(reach * SAMPLES)];
          dot.setAttribute('transform', `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})`);
          dot.dataset.failed = blocked;
          // Fade in and out at the ends, and fade away where a request stalls.
          const fade = Math.min(progress / 0.12, (1 - progress) / 0.12, 1);
          dot.style.opacity = blocked && progress > 0.62 ? Math.max(0, 1 - (progress - 0.62) / 0.2) : fade;
        }
      });
    };

    const sync = () => {
      cancelAnimationFrame(frame);
      last = performance.now();
      if (!reduced.matches) frame = requestAnimationFrame(draw);
    };
    sync();
    reduced.addEventListener('change', sync);
    return () => {
      cancelAnimationFrame(frame);
      reduced.removeEventListener('change', sync);
    };
  }, [layout]);

  const isLit = (id) => !lit || lit.has(id);
  const nodes = useMemo(() => Object.keys(layout.nodes), [layout]);
  const tracerBox = tracer ? layout.box(tracer) : null;

  return (
    <svg
      ref={svg}
      className="diagram"
      data-intro={intro || undefined}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      role="group"
      aria-label="A diagram of a running service. Each part links to the skills behind it."
    >
      <defs>
        <radialGradient id="request-glow">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.55" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>

      {layout.region && (
        <g className="region" data-focus={Boolean(lit?.has('region'))} style={{ '--depth': 1 }}>
          <rect {...layout.region} rx="18" />
          <text x={layout.region.x + 20} y={layout.region.y + 26} className="region-name">
            Cloud
          </text>
          <text x={layout.region.x + 64} y={layout.region.y + 26} className="node-detail">
            AWS, defined in code
          </text>
        </g>
      )}

      <g className="edges">
        {layout.edges.map((edge) => (
          <path
            key={edge.id}
            data-edge={edge.id}
            d={edge.d}
            pathLength="1"
            data-lit={isLit(edge.from) && isLit(edge.to)}
            style={{ '--depth': COMPONENT_DEPTH[edge.from] + 0.5 }}
          />
        ))}
        {layout.taps && <path className="tap" d={layout.taps} style={{ '--depth': COMPONENT_DEPTH.monitoring }} />}
        <path
          className="page"
          d={layout.page}
          pathLength="1"
          data-status={statusOf('oncall', state)}
          style={{ '--depth': COMPONENT_DEPTH.monitoring + 0.5 }}
        />
      </g>

      <g className="requests" aria-hidden="true">
        {layout.edges.flatMap((edge, e) =>
          Array.from({ length: PER_EDGE }, (_, i) => (
            <g
              key={`${edge.id}:${i}`}
              ref={(node) => {
                dots.current[e * PER_EDGE + i] = node;
              }}
              data-lit={isLit(edge.from) && isLit(edge.to)}
              style={{ opacity: 0 }}
            >
              <circle r="9" fill="url(#request-glow)" />
              <circle r="2.6" className="request-core" />
            </g>
          )),
        )}
      </g>

      {nodes.map((id) => {
        const box = layout.box(id);
        const slim = box.height < 40;
        return (
          <a
            key={id}
            href={`#layer-${COMPONENT_LAYER[id]}`}
            className="node"
            data-status={statusOf(id, state)}
            data-lit={isLit(id)}
            data-focus={Boolean(lit?.has(id))}
            style={{ '--depth': COMPONENT_DEPTH[id] }}
            aria-label={`${COMPONENT_NAME[id]}: ${detailFor(id, state)}. Go to the ${COMPONENT_LAYER[id]} layer.`}
            onClick={(event) => {
              event.preventDefault();
              onSelect(COMPONENT_LAYER[id]);
            }}
          >
            <rect x={box.x} y={box.y} width={box.width} height={box.height} rx={slim ? 10 : 12} />
            {id === 'oncall' && <circle className="node-lamp" cx={box.x + 17} cy={box.y + box.height / 2} r="4" />}
            <text
              className="node-name"
              x={box.x + (id === 'oncall' ? 31 : 16)}
              y={box.y + (slim || !layout.showDetail ? box.height / 2 + 5 : id === 'oncall' ? 22 : 27)}
            >
              {COMPONENT_NAME[id]}
            </text>
            {layout.showDetail && (
              <text
                className="node-detail"
                x={slim ? box.x + 116 : box.x + (id === 'oncall' ? 31 : 16)}
                y={slim ? box.y + box.height / 2 + 4 : box.y + (id === 'oncall' ? 39 : 46)}
              >
                {detailFor(id, state)}
              </text>
            )}
          </a>
        );
      })}

      {tracerBox && (
        <g className="tracer" style={{ transform: `translate(${tracerBox.x + tracerBox.width - 14}px, ${tracerBox.y + 14}px)` }} aria-hidden="true">
          <circle r="16" fill="url(#request-glow)" />
          <circle r="4" className="tracer-core" />
        </g>
      )}
    </svg>
  );
}
