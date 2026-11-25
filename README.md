# ktodoran.github.io

Source for my personal site: <https://ktodoran.github.io>

The page is built around a small simulated service that runs in the browser. You can watch requests move through
it, break it, and see monitoring notice, the on-call page go out, and the system recover. Each part of the system
links to the part of my work that lives there.

## What's in here

- **The simulation** (`src/system/simulation.js`). Pure functions, no DOM: traffic, a job queue, workers, a
  database, and the alerting and on-call loop around them. Faults are not scripted to a timeline. A fault changes
  what the system can do, the numbers follow, monitoring notices, and the response plays out from there. It is
  covered by unit tests.
- **The diagram** (`src/system`). An SVG that re-renders its labels a few times a second from the simulation, with
  the moving requests animated outside React. It has two layouts and picks the one that fits its container.
- **The content** (`src/content/profile.js`). Every word on the page lives in one file. Scrolling through a layer
  or a job lights the parts of the system it relates to.
- **Trace a request.** A button (and a palette command) follows one request through the system, stop by stop.
- **Command palette** (`src/components/CommandPalette.jsx`). <kbd>⌘K</kbd> / <kbd>Ctrl K</kbd> or <kbd>/</kbd>.
  Built on the native `<dialog>` element. The matching logic is a pure function with tests.
- **Build strip** (`scripts/build-info.mjs`, `src/lib/buildInfo.js`). The line under the diagram is real: the
  commit, test count and shipped size are written at build time, and the deploy time is read from the public
  GitHub Actions API.
- **Assistant** (`src/components/Assistant.jsx`, `assistant/`). A question-and-answer box grounded on my resume.
  The browser talks to a small AWS Lambda, which holds the OpenAI key and calls the model. It is left out of the
  build until an endpoint is configured.

## Run it

```sh
npm install
npm run dev      # http://localhost:5173
npm test         # node --test, no extra test framework
npm run build    # tests, then output in dist/
```

Node 22 or newer.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which tests, builds and publishes `dist/` to GitHub Pages.
In the repository settings, Pages → Source must be set to **GitHub Actions**.

## Assistant backend

Optional. See [`assistant/README.md`](assistant/README.md) for the deploy steps. Once it is deployed, set the
function URL as the `ASSISTANT_URL` repository variable and re-run the workflow.

## Layout

```
index.html               Vite entry and meta tags
src/
  App.jsx                Page composition and the command list
  content/profile.js     All copy
  components/            Header, stage, assistant, contact, palette, build strip
  system/                The simulation, its store, and the diagram
  lib/                   Pure helpers and their tests
  styles.css             All styles
scripts/build-info.mjs   Writes dist/build-info.json after the build
assistant/               Lambda handler, SAM template, tests
public/                  Favicon, social image, resume
```
