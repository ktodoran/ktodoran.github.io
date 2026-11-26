import { scrollToId } from '../lib/scroll.js';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

export default function Header({ hasAssistant, onOpenPalette }) {
  const links = [
    { id: 'stack', label: 'System' },
    { id: 'projects', label: 'Projects' },
    { id: 'experience', label: 'Experience' },
    ...(hasAssistant ? [{ id: 'ask', label: 'Ask' }] : []),
    { id: 'contact', label: 'Contact' },
  ];

  const jump = (id) => (event) => {
    event.preventDefault();
    scrollToId(id);
  };

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a className="site-name" href="#top" onClick={jump('top')}>
          Kyle Todoran
        </a>
        <nav aria-label="Sections">
          <ul className="site-nav">
            {links.map((link) => (
              <li key={link.id}>
                <a href={`#${link.id}`} onClick={jump(link.id)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <button type="button" className="palette-trigger" onClick={onOpenPalette} aria-haspopup="dialog">
          <span>Search</span>
          <kbd>{isMac ? '⌘K' : 'Ctrl K'}</kbd>
        </button>
      </div>
    </header>
  );
}
