export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Below this width the 3D canvas is pinned to the top of the screen (see styles.css).
export const STACKED_QUERY = '(max-width: 899px)';

export function scrollToId(id) {
  const target = document.getElementById(id);
  if (!target) return;
  // Layers ask to be centred beside the canvas; when the canvas is pinned on top
  // instead, they start just below it (scroll-margin-top handles the offset).
  const stacked = window.matchMedia(STACKED_QUERY).matches;
  target.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: stacked ? 'start' : target.dataset.scrollBlock || 'start',
  });
}
