import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseTestSummary } from './build-info.mjs';

test('reads the totals from a node --test summary', () => {
  const output = ['ok 1 - something', '1..31', '# tests 31', '# suites 0', '# pass 30', '# fail 1', '# duration_ms 140.2'].join('\n');
  assert.deepEqual(parseTestSummary(output), { passed: 30, failed: 1 });
});

test('reports zero when there is no summary', () => {
  assert.deepEqual(parseTestSummary('garbage'), { passed: 0, failed: 0 });
});
