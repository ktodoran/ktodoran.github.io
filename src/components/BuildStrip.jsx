import { useEffect, useState } from 'react';
import { describeBuild, loadBuild } from '../lib/buildInfo.js';

// One line of facts about the build you are looking at. Renders nothing when
// there are none, for example on a local dev server.
export default function BuildStrip({ className = '' }) {
  const [parts, setParts] = useState([]);

  useEffect(() => {
    let current = true;
    loadBuild().then((build) => {
      if (current && build) setParts(describeBuild(build));
    });
    return () => {
      current = false;
    };
  }, []);

  if (parts.length === 0) return null;

  return (
    <p className={`build-strip ${className}`}>
      <span className="build-strip-label">This build:</span>
      {parts.map((part, index) => (
        <span key={part.text}>
          {part.href ? <a href={part.href}>{part.text}</a> : part.text}
          {index < parts.length - 1 ? ',' : '.'}
        </span>
      ))}
    </p>
  );
}
