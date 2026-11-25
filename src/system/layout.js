// Geometry for the system diagram, in SVG user units. Two arrangements: a wide
// one for the desktop panel and a compact one for the strip pinned on phones.
// Each component belongs to one of the six layers in content/profile.js.

export const COMPONENT_LAYER = {
  clients: 'interface',
  model: 'ai',
  api: 'services',
  queue: 'services',
  workers: 'services',
  cache: 'data',
  database: 'data',
  monitoring: 'operations',
  oncall: 'operations',
};

export const COMPONENT_NAME = {
  clients: 'Clients',
  api: 'API',
  model: 'Model',
  queue: 'Queue',
  workers: 'Workers',
  cache: 'Cache',
  database: 'Database',
  monitoring: 'Monitoring',
  oncall: 'On call',
};

// Which component each edge runs between. Requests travel them in this direction.
const EDGES = [
  ['clients', 'api'],
  ['api', 'model'],
  ['api', 'queue'],
  ['api', 'cache'],
  ['queue', 'workers'],
  ['cache', 'database'],
  ['workers', 'database'],
];

const wide = {
  width: 700,
  height: 478,
  node: { width: 132, height: 62 },
  showDetail: true,
  region: { x: 176, y: 8, width: 524, height: 396 },
  nodes: {
    clients: { x: 0, y: 173 },
    api: { x: 200, y: 173 },
    model: { x: 378, y: 59 },
    queue: { x: 378, y: 173 },
    cache: { x: 378, y: 287 },
    workers: { x: 548, y: 173 },
    database: { x: 548, y: 287 },
    monitoring: { x: 378, y: 360, width: 302, height: 32 },
    oncall: { x: 548, y: 426, height: 50 },
  },
  paths: {
    'clients>api': 'M132 204 H200',
    'api>model': 'M332 192 C356 192 354 90 378 90',
    'api>queue': 'M332 204 H378',
    'api>cache': 'M332 216 C356 216 354 318 378 318',
    'queue>workers': 'M510 204 H548',
    'cache>database': 'M510 318 H548',
    'workers>database': 'M614 235 V287',
  },
  // Thin dotted lines: everything reports to monitoring, which pages on call.
  taps: 'M444 235 V287 M444 349 V360 M614 349 V360',
  page: 'M614 392 V426',
};

const compact = {
  width: 390,
  height: 270,
  node: { width: 104, height: 44 },
  showDetail: false,
  region: null,
  nodes: {
    clients: { x: 0, y: 4 },
    api: { x: 143, y: 4 },
    model: { x: 286, y: 4 },
    cache: { x: 0, y: 82 },
    queue: { x: 143, y: 82 },
    workers: { x: 286, y: 82 },
    database: { x: 286, y: 160 },
    monitoring: { x: 0, y: 232, width: 247, height: 30 },
    oncall: { x: 286, y: 225 },
  },
  paths: {
    'clients>api': 'M104 26 H143',
    'api>model': 'M247 26 H286',
    'api>queue': 'M195 48 V82',
    'api>cache': 'M160 48 C160 66 80 62 70 82',
    'queue>workers': 'M247 104 H286',
    'cache>database': 'M52 126 V182 H286',
    'workers>database': 'M338 126 V160',
  },
  taps: '',
  page: 'M247 247 H286',
};

function build(layout) {
  return {
    ...layout,
    edges: EDGES.map(([from, to]) => ({ id: `${from}>${to}`, from, to, d: layout.paths[`${from}>${to}`] })),
    box: (id) => ({ ...layout.node, ...layout.nodes[id] }),
  };
}

export const LAYOUTS = { wide: build(wide), compact: build(compact) };
