export function initSurfaceLightInteraction() {
  const panel = document.querySelector('.category-panel');
  if (!panel) return;

  let lastNotified = false;
  const notify = (active) => {
    if (active === lastNotified) return;
    lastNotified = active;
    window.dispatchEvent(new CustomEvent('ui-panel-light', { detail: { active } }));
  };

  const update = (event) => {
    const r = panel.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const x = Math.max(0, Math.min(100, ((event.clientX - r.left) / r.width) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - r.top) / r.height) * 100));
    panel.style.setProperty('--mx', `${x.toFixed(2)}%`);
    panel.style.setProperty('--my', `${y.toFixed(2)}%`);
    panel.classList.add('is-lit');
    notify(true);
  };

  const leave = () => {
    panel.style.setProperty('--mx', '50%');
    panel.style.setProperty('--my', '20%');
    panel.classList.remove('is-lit');
    notify(false);
  };

  panel.addEventListener('pointermove', update, { passive: true });
  panel.addEventListener('pointerenter', update, { passive: true });
  panel.addEventListener('pointerleave', leave, { passive: true });
}
