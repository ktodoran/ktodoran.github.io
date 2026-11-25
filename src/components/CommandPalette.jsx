import { useEffect, useMemo, useRef, useState } from 'react';
import { filterCommands } from '../lib/commands.js';

function isTyping(target) {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
}

// Keyboard-first navigation: Cmd/Ctrl+K or "/" opens it from anywhere.
// Built on <dialog>, which supplies the focus trap, Escape handling and backdrop.
export default function CommandPalette({ open, commands, onOpen, onClose }) {
  const dialog = useRef(null);
  const list = useRef(null);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const [notice, setNotice] = useState('');

  const results = useMemo(() => filterCommands(commands, query), [commands, query]);
  const selected = Math.min(cursor, Math.max(results.length - 1, 0));

  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (open) onClose();
        else onOpen();
      } else if (event.key === '/' && !open && !isTyping(event.target)) {
        event.preventDefault();
        onOpen();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpen, onClose]);

  useEffect(() => {
    const node = dialog.current;
    if (open && !node.open) {
      setQuery('');
      setCursor(0);
      node.showModal();
    } else if (!open && node.open) {
      node.close();
    }
  }, [open]);

  useEffect(() => {
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [selected, results]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(''), 2200);
    return () => clearTimeout(timer);
  }, [notice]);

  const run = (command) => {
    onClose();
    // Let the dialog close and return focus before scrolling or navigating.
    requestAnimationFrame(() => {
      command.run();
      if (command.confirm) setNotice(command.confirm);
    });
  };

  const onInputKey = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setCursor((selected + 1) % Math.max(results.length, 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setCursor((selected - 1 + results.length) % Math.max(results.length, 1));
    } else if (event.key === 'Enter' && results[selected]) {
      event.preventDefault();
      run(results[selected]);
    }
  };

  return (
    <>
      <dialog
        ref={dialog}
        className="palette"
        aria-label="Command palette"
        onClose={onClose}
        onClick={(event) => {
          if (event.target === dialog.current) onClose();
        }}
      >
        <div className="palette-inner">
          <input
            className="palette-input"
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={results[selected] ? `palette-${results[selected].id}` : undefined}
            aria-label="Search sections and actions"
            placeholder="Jump to a section or run an action"
            autoComplete="off"
            spellCheck="false"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCursor(0);
            }}
            onKeyDown={onInputKey}
          />
          <ul className="palette-list" id="palette-list" role="listbox" aria-label="Results" ref={list}>
            {results.map((command, index) => (
              <li
                key={command.id}
                id={`palette-${command.id}`}
                role="option"
                aria-selected={index === selected}
                onMouseMove={() => setCursor(index)}
                onClick={() => run(command)}
              >
                <span>{command.label}</span>
                <span className="palette-group">{command.group}</span>
              </li>
            ))}
            {results.length === 0 && <li className="palette-empty">Nothing matches “{query}”.</li>}
          </ul>
          <p className="palette-help">
            <kbd>↑</kbd>
            <kbd>↓</kbd> to move, <kbd>Enter</kbd> to run, <kbd>Esc</kbd> to close
          </p>
        </div>
      </dialog>
      <p className="toast" role="status" data-visible={Boolean(notice)}>
        {notice}
      </p>
    </>
  );
}
