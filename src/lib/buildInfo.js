// Facts about the build that produced the page being viewed. `build-info.json`
// is written by scripts/build-info.mjs after `vite build`; the deploy time comes
// from the public GitHub Actions API at runtime.

const REPO = 'ktodoran/ktodoran.github.io';

let pending;

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} responded with ${response.status}`);
  return response.json();
}

export function loadBuild() {
  pending ??= (async () => {
    const info = await getJson(`${import.meta.env.BASE_URL}build-info.json`).catch(() => null);
    if (!info) return null;

    // Only report a deploy if the latest successful run is for this exact commit.
    const runs = info.commit
      ? await getJson(`https://api.github.com/repos/${REPO}/actions/runs?branch=main&status=success&per_page=1`).catch(() => null)
      : null;
    const run = runs?.workflow_runs?.[0];
    return { info, run: run && run.head_sha === info.commit.sha ? run : null };
  })();
  return pending;
}

// Turns the raw facts into the short phrases shown on the page.
export function describeBuild({ info, run }) {
  const parts = [];

  if (info.commit) {
    parts.push({ text: `commit ${info.commit.sha.slice(0, 7)}`, href: `https://github.com/${REPO}/commit/${info.commit.sha}` });
  }
  if (info.tests?.passed > 0 && info.tests.failed === 0) {
    parts.push({ text: `${info.tests.passed} tests passed` });
  }
  if (info.bundle?.gzipBytes > 0) {
    parts.push({ text: `${Math.round(info.bundle.gzipBytes / 1000)} kB shipped` });
  }
  if (run) {
    const seconds = Math.round((new Date(run.updated_at) - new Date(run.run_started_at)) / 1000);
    if (seconds > 0) parts.push({ text: `deployed in ${seconds} s`, href: run.html_url });
  }
  return parts;
}
