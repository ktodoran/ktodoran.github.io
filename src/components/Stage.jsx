import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BreakControls from '../system/BreakControls.jsx';
import SystemPanel from '../system/SystemPanel.jsx';
import { COMPONENT_LAYER } from '../system/layout.js';
import { education, experience, hero, layers, person, projects } from '../content/profile.js';
import { scrollToId, STACKED_QUERY } from '../lib/scroll.js';
import { onTraceRequested, requestTrace } from '../lib/trace.js';

// How long a trace stays on each stop.
const TRACE_STEP_MS = 1900;
const NO_FOCUS = { kind: 'none', index: -1 };

// The path one request takes, and the component the tracer rests on at each stop.
const TRACE = [
  { layer: 'interface', at: 'clients' },
  { layer: 'services', at: 'api' },
  { layer: 'ai', at: 'model' },
  { layer: 'data', at: 'database' },
  { layer: 'cloud', at: 'workers' },
  { layer: 'operations', at: 'monitoring' },
];

// Components that light up for a layer. Cloud is the region and everything in it.
function componentsOf(layerId) {
  if (layerId === 'cloud') {
    return ['region', ...Object.keys(COMPONENT_LAYER).filter((id) => id !== 'clients' && id !== 'oncall')];
  }
  return Object.keys(COMPONENT_LAYER).filter((id) => COMPONENT_LAYER[id] === layerId);
}

// All six layers, in order; the ones this job or project touched are lit.
function UsedLayers({ used, onJump }) {
  return (
    <ul className="role-layers" aria-label="Layers worked in">
      {layers.map((layer) =>
        used.includes(layer.id) ? (
          <li key={layer.id} className={`is-used accent-${layer.color}`}>
            <a href={`#layer-${layer.id}`} onClick={onJump(`layer-${layer.id}`)}>
              {layer.name}
            </a>
          </li>
        ) : (
          <li key={layer.id} aria-hidden="true">
            {layer.name}
          </li>
        ),
      )}
    </ul>
  );
}

// Hero, the six layers, projects and the work history, with the live system
// pinned alongside. Whatever block is in focus decides what the diagram lights:
// a layer lights its components, a project or job lights every layer it touched.
export default function Stage() {
  const heroRef = useRef(null);
  const layerRefs = useRef([]);
  const roleRefs = useRef([]);
  const projectRefs = useRef([]);
  const tracing = useRef(false);
  const [focus, setFocus] = useState(NO_FOCUS);
  const [traceStep, setTraceStep] = useState(-1);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      // A trace drives the diagram itself until it ends or the reader scrolls away.
      if (tracing.current) {
        if (window.scrollY > 240) setTraceStep(-1);
        return;
      }

      const viewport = window.innerHeight;
      // On small screens the diagram is pinned to the top, so "in focus" sits lower.
      const focusLine = viewport * (window.matchMedia(STACKED_QUERY).matches ? 0.7 : 0.5);

      let next = NO_FOCUS;
      let nearest = Infinity;
      const consider = (kind) => (node, index) => {
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - focusLine);
        if (distance < nearest) {
          nearest = distance;
          next = { kind, index };
        }
      };
      layerRefs.current.forEach(consider('layer'));
      projectRefs.current.forEach(consider('project'));
      roleRefs.current.forEach(consider('role'));

      const firstLayer = layerRefs.current[0]?.getBoundingClientRect();
      if (!firstLayer || firstLayer.top >= viewport * 0.8) next = NO_FOCUS;

      setFocus((current) => (current.kind === next.kind && current.index === next.index ? current : next));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // A trace follows one request through the system, one stop at a time.
  const startTrace = useCallback(() => {
    if (tracing.current) return;
    window.scrollTo({ top: 0, behavior: 'auto' });
    tracing.current = true;
    setFocus(NO_FOCUS);
    setTraceStep(0);
  }, []);

  useEffect(() => onTraceRequested(startTrace), [startTrace]);

  useEffect(() => {
    if (traceStep < 0) {
      tracing.current = false;
      return undefined;
    }
    const timer = setTimeout(() => setTraceStep(traceStep + 1 < TRACE.length ? traceStep + 1 : -1), TRACE_STEP_MS);
    return () => clearTimeout(timer);
  }, [traceStep]);

  const isTracing = traceStep >= 0;
  const traceStop = isTracing ? TRACE[traceStep] : null;
  const traceLayer = traceStop ? layers.find((layer) => layer.id === traceStop.layer) : null;

  // The set of components to light, or null to light everything.
  const lit = useMemo(() => {
    if (traceStop) return new Set(componentsOf(traceStop.layer));
    if (focus.kind === 'layer') return new Set(componentsOf(layers[focus.index].id));
    if (focus.kind === 'project') return new Set(projects[focus.index].layers.flatMap(componentsOf));
    if (focus.kind === 'role') return new Set(experience[focus.index].layers.flatMap(componentsOf));
    return null;
  }, [focus, traceStop]);

  const selectLayer = (layerId) => scrollToId(`layer-${layerId}`);
  const jump = (id) => (event) => {
    event.preventDefault();
    scrollToId(id);
  };

  return (
    <div className="stage">
      <div className="stage-visual">
        <SystemPanel
          lit={lit}
          tracer={traceStop?.at ?? null}
          trace={
            isTracing
              ? { step: traceStep + 1, total: TRACE.length, name: traceLayer.name, text: traceLayer.trace, color: traceLayer.color }
              : null
          }
          onSelect={selectLayer}
        />
      </div>

      <div className="stage-copy">
        <section className="hero" id="top" ref={heroRef}>
          <h1>
            {hero.headline.map((phrase, index) => (
              <Fragment key={phrase}>
                {index > 0 && ' '}
                <span>{phrase}</span>
              </Fragment>
            ))}
          </h1>
          <p className="lead">{hero.lead}</p>
          <p className="lead">{hero.availability}</p>
          <p className="hero-actions">
            <a className="button" href={`mailto:${person.email}`}>
              Email me
            </a>
            <a href={person.resume}>Resume (PDF)</a>
            <a href={person.linkedin}>LinkedIn</a>
            <a href={person.github}>GitHub</a>
          </p>
          <p className="hero-play">
            <button type="button" className="button-ghost" onClick={requestTrace} disabled={isTracing}>
              {isTracing ? 'Tracing a request' : 'Trace a request through the system'}
            </button>
            <span>or scroll to walk through it</span>
          </p>
          <BreakControls className="break-inline" />
        </section>

        <section id="stack" aria-labelledby="stack-title">
          <h2 id="stack-title" className="visually-hidden">
            The system, layer by layer
          </h2>
          {layers.map((layer, index) => (
            <article
              key={layer.id}
              id={`layer-${layer.id}`}
              data-scroll-block="center"
              className={`stop layer accent-${layer.color}${focus.kind === 'layer' && focus.index === index ? ' is-active' : ''}`}
              ref={(node) => {
                layerRefs.current[index] = node;
              }}
            >
              <p className="layer-count">
                Layer {index + 1} of {layers.length}
              </p>
              <h3>{layer.name}</h3>
              <p className="layer-summary">{layer.summary}</p>
              <ul className="chips" aria-label={`${layer.name} skills`}>
                {layer.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
              <ul className="proof">
                {layer.proof.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section id="projects" aria-labelledby="projects-title">
          <h2 id="projects-title" className="stage-heading">
            Projects
          </h2>
          {projects.map((project, index) => (
            <article
              key={project.name}
              className={`stop role${focus.kind === 'project' && focus.index === index ? ' is-active' : ''}`}
              ref={(node) => {
                projectRefs.current[index] = node;
              }}
            >
              <p className="role-dates">{project.kind}</p>
              <h3>{project.name}</h3>
              <p>{project.body}</p>
              <ul className="points">
                {project.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <p>
                {project.demo && (
                  <>
                    <a href={project.demo.href}>{project.demo.label}</a>
                    {' · '}
                  </>
                )}
                <a href={project.link.href}>{project.link.label}</a>
              </p>
              <UsedLayers used={project.layers} onJump={jump} />
            </article>
          ))}
        </section>

        <section id="experience" aria-labelledby="experience-title">
          <h2 id="experience-title" className="stage-heading">
            Experience
          </h2>
          {experience.map((role, index) => (
            <article
              key={role.dates}
              className={`stop role${focus.kind === 'role' && focus.index === index ? ' is-active' : ''}`}
              ref={(node) => {
                roleRefs.current[index] = node;
              }}
            >
              <p className="role-dates">{role.dates}</p>
              <h3>
                {role.title} <span className="role-org">{role.org}</span>
              </h3>
              <p>{role.body}</p>
              {role.points && (
                <ul className="points">
                  {role.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              )}
              {role.link && (
                <p>
                  <a href={role.link.href}>{role.link.label}</a>
                </p>
              )}
              <UsedLayers used={role.layers} onJump={jump} />
            </article>
          ))}

          <div className="education">
            <h2 id="education-title" className="stage-heading">
              Education
            </h2>
            <p className="role-dates">{education.dates}</p>
            <h3>
              {education.title} <span className="role-org">{education.org}</span>
            </h3>
          </div>
        </section>
      </div>
    </div>
  );
}
