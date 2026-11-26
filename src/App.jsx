import { useCallback, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import Stage from './components/Stage.jsx';
import Assistant from './components/Assistant.jsx';
import Contact from './components/Contact.jsx';
import BuildStrip from './components/BuildStrip.jsx';
import CommandPalette from './components/CommandPalette.jsx';
import { layers, person, projects } from './content/profile.js';
import { scrollToId } from './lib/scroll.js';
import { requestTrace } from './lib/trace.js';

// Set at build time. The assistant is left out entirely until an endpoint exists.
const ASSISTANT_URL = import.meta.env.VITE_ASSISTANT_URL || '';

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  const commands = useMemo(() => {
    const go = (id) => () => scrollToId(id);
    const open = (href) => () => window.open(href, '_blank', 'noopener');

    return [
      { id: 'top', group: 'Go to', label: 'Top of page', keywords: 'home start', run: go('top') },
      ...layers.map((layer) => ({
        id: `layer-${layer.id}`,
        group: 'Go to',
        label: `Layer: ${layer.name}`,
        keywords: layer.skills.join(' '),
        run: go(`layer-${layer.id}`),
      })),
      { id: 'projects', group: 'Go to', label: 'Projects', keywords: 'open source code portfolio', run: go('projects') },
      { id: 'experience', group: 'Go to', label: 'Experience', keywords: 'work history jobs career', run: go('experience') },
      ...(ASSISTANT_URL
        ? [{ id: 'ask', group: 'Go to', label: 'Ask about my work', keywords: 'ai assistant chat question', run: go('ask') }]
        : []),
      { id: 'contact', group: 'Go to', label: 'Contact', keywords: 'reach hire', run: go('contact') },
      { id: 'trace', group: 'Actions', label: 'Trace a request through the system', keywords: 'demo play animate', run: requestTrace },
      {
        id: 'copy-email',
        group: 'Actions',
        label: 'Copy email address',
        keywords: 'contact mail',
        run: () => navigator.clipboard?.writeText(person.email),
        confirm: 'Email address copied',
      },
      { id: 'email', group: 'Actions', label: 'Email Kyle', keywords: 'contact mail message', run: () => (window.location.href = `mailto:${person.email}`) },
      { id: 'resume', group: 'Actions', label: 'Open resume (PDF)', keywords: 'cv download', run: open(person.resume) },
      { id: 'linkedin', group: 'Actions', label: 'Open LinkedIn', keywords: 'profile', run: open(person.linkedin) },
      { id: 'github', group: 'Actions', label: 'Open GitHub', keywords: 'code repositories', run: open(person.github) },
      ...projects.map((project) => ({
        id: `project-${project.name}`,
        group: 'Actions',
        label: `Open ${project.name} on GitHub`,
        keywords: 'code repository project',
        run: open(project.link.href),
      })),
      { id: 'source', group: 'Actions', label: 'View this site’s source', keywords: 'code repository react', run: open(person.source) },
    ];
  }, []);

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="progress" aria-hidden="true" />
      <Header hasAssistant={Boolean(ASSISTANT_URL)} onOpenPalette={openPalette} />
      <main id="main">
        <Stage />
        {ASSISTANT_URL && <Assistant url={ASSISTANT_URL} />}
        <Contact />
      </main>
      <footer className="site-footer">
        <div className="wrap site-footer-inner">
          <p>© {new Date().getFullYear()} Kyle Todoran</p>
          <p>
            Built with React. <a href={person.source}>Read the source</a>
          </p>
          <BuildStrip className="build-strip-footer" />
        </div>
      </footer>
      <CommandPalette open={paletteOpen} commands={commands} onOpen={openPalette} onClose={closePalette} />
    </>
  );
}
