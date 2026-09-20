const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initGlassUI(root = document) {
  const surfaces = [...root.querySelectorAll('[data-glass]')];
  if (!surfaces.length) return;

  for (const el of surfaces) {
    el.style.setProperty('--glass-x', '50%');
    el.style.setProperty('--glass-y', '0%');

    if (reducedMotion) continue;

    let frame = 0;
    let clientX = 0;
    let clientY = 0;

    const commit = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--glass-x', `${Math.max(0, Math.min(100, x)).toFixed(2)}%`);
      el.style.setProperty('--glass-y', `${Math.max(0, Math.min(100, y)).toFixed(2)}%`);
    };

    el.addEventListener('pointermove', (event) => {
      clientX = event.clientX;
      clientY = event.clientY;
      if (!frame) frame = requestAnimationFrame(commit);
    }, { passive: true });

    el.addEventListener('pointerleave', () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      el.style.setProperty('--glass-x', '50%');
      el.style.setProperty('--glass-y', '0%');
    }, { passive: true });
  }
}
