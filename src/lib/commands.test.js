import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterCommands, score } from './commands.js';

const commands = [
  { id: 'experience', label: 'Experience' },
  { id: 'email', label: 'Copy email address', keywords: 'contact mail' },
  { id: 'resume', label: 'Open resume (PDF)', keywords: 'cv download' },
  { id: 'layer-data', label: 'Layer: Data', keywords: 'postgresql sql redis' },
];

test('an empty query returns every command in its original order', () => {
  assert.deepEqual(filterCommands(commands, '  '), commands);
});

test('characters must appear in order', () => {
  assert.equal(score('Experience', 'xpr') > 0, true);
  assert.equal(score('Experience', 'rpx'), 0);
});

test('a prefix match outranks a scattered match', () => {
  const [first] = filterCommands(commands, 'exp');
  assert.equal(first.id, 'experience');
});

test('keywords match, but rank below a label match', () => {
  assert.deepEqual(
    filterCommands(commands, 'cv').map((c) => c.id),
    ['resume'],
  );
  const ids = filterCommands(commands, 'mail').map((c) => c.id);
  assert.equal(ids[0], 'email');
});

test('matching ignores case and spaces in the query', () => {
  assert.equal(filterCommands(commands, 'LAYER data')[0].id, 'layer-data');
});

test('no match returns an empty list', () => {
  assert.deepEqual(filterCommands(commands, 'zzz'), []);
});

test('keywords need a real substring, not a scattered subsequence', () => {
  // "c…d" is scattered across "cv download", and no label contains it in order.
  assert.deepEqual(filterCommands(commands, 'cdz'), []);
  assert.deepEqual(
    filterCommands(commands, 'redis').map((c) => c.id),
    ['layer-data'],
  );
});
