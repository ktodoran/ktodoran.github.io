import { person } from '../content/profile.js';

// While an incident is open the browser tab says so: the title changes and the
// icon turns red. Both go back when the system recovers.

const INCIDENT_TITLE = `Incident in progress — ${person.name}`;

const INCIDENT_ICON = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#e2293f"/>' +
    '<g fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">' +
    '<path d="M6 11l10-4 10 4-10 4z"/><path d="M6 16l10 4 10-4"/><path d="M6 21l10 4 10-4"/></g></svg>',
)}`;

let normal = null; // the tab as it was before the incident

export function showIncidentInTab(open) {
  const icon = document.querySelector('link[rel="icon"]');
  if (open && !normal) {
    normal = { title: document.title, icon: icon?.getAttribute('href') };
    document.title = INCIDENT_TITLE;
    icon?.setAttribute('href', INCIDENT_ICON);
  } else if (!open && normal) {
    document.title = normal.title;
    if (normal.icon) icon?.setAttribute('href', normal.icon);
    normal = null;
  }
}
