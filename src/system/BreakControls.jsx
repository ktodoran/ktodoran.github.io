import { useSyncExternalStore } from 'react';
import { FAULTS, isIncidentOpen } from './simulation.js';
import { systemStore } from './systemStore.js';

// The three things a visitor can do to the system.
export default function BreakControls({ className = '' }) {
  const { state } = useSyncExternalStore(systemStore.subscribe, systemStore.getSnapshot);
  const busy = isIncidentOpen(state);

  return (
    <div className={`break ${className}`}>
      <p className="break-label">{busy ? 'Incident in progress' : 'Break something'}</p>
      <div className="break-buttons">
        {Object.entries(FAULTS).map(([kind, fault]) => (
          <button key={kind} type="button" className="button-ghost" disabled={busy} onClick={() => systemStore.inject(kind)}>
            {fault.label}
          </button>
        ))}
      </div>
    </div>
  );
}
