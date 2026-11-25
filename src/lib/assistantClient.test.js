import { test } from 'node:test';
import assert from 'node:assert/strict';
import { askAssistant, AssistantError } from './assistantClient.js';

const ok = (body) => async () => ({ ok: true, status: 200, json: async () => body });

test('returns the trimmed reply', async () => {
  const reply = await askAssistant('https://example.test', [{ role: 'user', content: 'Hi' }], ok({ reply: '  Hello.  ' }));
  assert.equal(reply, 'Hello.');
});

test('sends only the most recent messages', async () => {
  let sent;
  const fetchImpl = async (_url, init) => {
    sent = JSON.parse(init.body);
    return { ok: true, status: 200, json: async () => ({ reply: 'ok' }) };
  };
  const history = Array.from({ length: 20 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `m${i}` }));

  await askAssistant('https://example.test', history, fetchImpl);

  assert.equal(sent.messages.length, 8);
  assert.equal(sent.messages.at(-1).content, 'm19');
});

test('maps rate limiting to a specific message', async () => {
  const limited = async () => ({ ok: false, status: 429, json: async () => ({}) });
  await assert.rejects(askAssistant('https://example.test', [], limited), (error) => {
    assert.equal(error instanceof AssistantError, true);
    assert.equal(error.status, 429);
    assert.match(error.message, /few minutes/);
    return true;
  });
});

test('network failures and malformed bodies become AssistantError', async () => {
  const offline = async () => {
    throw new TypeError('Failed to fetch');
  };
  await assert.rejects(askAssistant('https://example.test', [], offline), AssistantError);
  await assert.rejects(askAssistant('https://example.test', [], ok({ nope: true })), AssistantError);
});
