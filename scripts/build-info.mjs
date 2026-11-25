// Runs after `vite build`. Writes dist/build-info.json with facts about this
// build, which the page shows in its footer strip: the commit it came from, the
// test results, and how much it ships. If the tests fail, so does the build.
import { execFileSync, spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';

// Reads the totals from the TAP summary that `node --test` prints.
export function parseTestSummary(output) {
  const count = (name) => Number(output.match(new RegExp(`^# ${name} (\\d+)`, 'm'))?.[1] ?? 0);
  return { passed: count('pass'), failed: count('fail') };
}

function commit() {
  try {
    const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return { sha };
  } catch {
    return null; // not a git checkout
  }
}

function bundleSize(directory) {
  const shipped = readdirSync(directory).filter((name) => /\.(js|css)$/.test(name));
  return { gzipBytes: shipped.reduce((total, name) => total + gzipSync(readFileSync(`${directory}/${name}`)).length, 0) };
}

function main() {
  const run = spawnSync(process.execPath, ['--test'], { encoding: 'utf8' });
  const tests = parseTestSummary(run.stdout ?? '');
  if (run.status !== 0 || tests.failed > 0) {
    process.stderr.write(run.stdout ?? '');
    throw new Error('Tests failed; refusing to write build info.');
  }

  const info = { commit: commit(), tests, bundle: bundleSize('dist/assets'), builtAt: new Date().toISOString() };
  writeFileSync('dist/build-info.json', `${JSON.stringify(info, null, 2)}\n`);
  console.log(`build-info: ${tests.passed} tests passed, ${Math.round(info.bundle.gzipBytes / 1000)} kB gzipped`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
