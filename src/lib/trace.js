// Lets anything on the page (the hero button, the command palette) start a
// request trace without holding a reference to the stage component.
const bus = new EventTarget();

export function requestTrace() {
  bus.dispatchEvent(new Event('trace'));
}

export function onTraceRequested(listener) {
  bus.addEventListener('trace', listener);
  return () => bus.removeEventListener('trace', listener);
}
