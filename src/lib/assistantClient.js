// Client for the assistant endpoint (see /assistant for the Lambda behind it).

export const MAX_QUESTION_LENGTH = 500;
const HISTORY_LIMIT = 8;

export class AssistantError extends Error {
  constructor(message, { status } = {}) {
    super(message);
    this.name = 'AssistantError';
    this.status = status;
  }
}

function messageFor(status) {
  if (status === 429) return 'That’s a lot of questions in a short time. Give it a few minutes and try again.';
  if (status === 400) return 'That question couldn’t be processed. Try rephrasing it.';
  return 'The assistant isn’t responding right now. My resume and email are just below.';
}

export async function askAssistant(url, messages, fetchImpl = fetch) {
  let response;
  try {
    response = await fetchImpl(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: messages.slice(-HISTORY_LIMIT) }),
    });
  } catch {
    throw new AssistantError(messageFor());
  }

  if (!response.ok) throw new AssistantError(messageFor(response.status), { status: response.status });

  const data = await response.json().catch(() => null);
  if (!data || typeof data.reply !== 'string' || !data.reply.trim()) throw new AssistantError(messageFor());

  return data.reply.trim();
}
