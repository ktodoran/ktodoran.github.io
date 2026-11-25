import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeBuild } from './buildInfo.js';

const info = {
  commit: { sha: '3da5c13f00aa11bb22cc33dd44ee55ff66778899' },
  tests: { passed: 31, failed: 0 },
  bundle: { gzipBytes: 81_420 },
};
const run = {
  head_sha: info.commit.sha,
  run_started_at: '2026-11-25T08:00:00Z',
  updated_at: '2026-11-25T08:00:41Z',
  html_url: 'https://github.com/ktodoran/ktodoran.github.io/actions/runs/1',
};

test('describes a complete build', () => {
  const parts = describeBuild({ info, run });
  assert.deepEqual(
    parts.map((part) => part.text),
    ['commit 3da5c13', '31 tests passed', '81 kB shipped', 'deployed in 41 s'],
  );
  assert.match(parts[0].href, /commit\/3da5c13f00aa/);
  assert.equal(parts[3].href, run.html_url);
});

test('leaves out anything it cannot stand behind', () => {
  assert.deepEqual(describeBuild({ info: { commit: null, tests: { passed: 0, failed: 0 }, bundle: null }, run: null }), []);
  const failing = describeBuild({ info: { ...info, tests: { passed: 30, failed: 1 } }, run: null });
  assert.deepEqual(
    failing.map((part) => part.text),
    ['commit 3da5c13', '81 kB shipped'],
  );
});
