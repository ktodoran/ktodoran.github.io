import { useEffect, useRef, useState } from 'react';
import { assistant, person } from '../content/profile.js';
import { askAssistant, MAX_QUESTION_LENGTH } from '../lib/assistantClient.js';

// Grounded Q&A over my resume. The model call happens in a Lambda (see
// /assistant); this component only ever talks to that endpoint.
export default function Assistant({ url }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const log = useRef(null);

  useEffect(() => {
    const node = log.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, pending, error]);

  const ask = async (text) => {
    const question = text.trim().slice(0, MAX_QUESTION_LENGTH);
    if (!question || pending) return;

    const history = [...messages, { role: 'user', content: question }];
    setMessages(history);
    setDraft('');
    setError('');
    setPending(true);

    try {
      const reply = await askAssistant(url, history);
      setMessages([...history, { role: 'assistant', content: reply }]);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="block" id="ask" aria-labelledby="ask-title">
      <div className="wrap">
        <h2 id="ask-title">Ask about my work</h2>
        <p className="block-intro">{assistant.intro}</p>

        <div className="ask-panel">
          <div className="ask-log" ref={log} role="log" aria-live="polite" aria-label="Conversation">
            {messages.length === 0 && (
              <ul className="ask-suggestions" aria-label="Suggested questions">
                {assistant.suggestions.map((suggestion) => (
                  <li key={suggestion}>
                    <button type="button" onClick={() => ask(suggestion)}>
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {messages.map((message, index) => (
              <p key={index} className={`ask-message ask-${message.role}`}>
                <span className="visually-hidden">{message.role === 'user' ? 'You asked: ' : 'Answer: '}</span>
                {message.content}
              </p>
            ))}
            {pending && <p className="ask-message ask-assistant ask-pending">Thinking</p>}
            {error && (
              <p className="ask-error">
                {error} <a href={person.resume}>Resume (PDF)</a>
              </p>
            )}
          </div>

          <form
            className="ask-form"
            onSubmit={(event) => {
              event.preventDefault();
              ask(draft);
            }}
          >
            <label className="visually-hidden" htmlFor="ask-input">
              Your question
            </label>
            <input
              id="ask-input"
              type="text"
              value={draft}
              maxLength={MAX_QUESTION_LENGTH}
              placeholder="Ask a question about my experience"
              autoComplete="off"
              onChange={(event) => setDraft(event.target.value)}
            />
            <button type="submit" className="button" disabled={pending || !draft.trim()}>
              Ask
            </button>
          </form>
        </div>

        <p className="ask-note">An AI model writes these answers and it can be wrong. My resume is the source of truth.</p>
      </div>
    </section>
  );
}
