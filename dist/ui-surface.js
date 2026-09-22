export function initSurfaceLightInteraction() {
  const panel = document.querySelector('.category-panel');
  if (!panel) return;

  const update = (event) => {
    const r = panel.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const x = Math.max(0, Math.min(100, ((event.clientX - r.left) / r.width) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - r.top) / r.height) * 100));
    panel.style.setProperty('--mx', `${x.toFixed(2)}%`);
    panel.style.setProperty('--my', `${y.toFixed(2)}%`);
    panel.classList.add('is-lit');
  };

  const leave = () => {
    panel.style.setProperty('--mx', '50%');
    panel.style.setProperty('--my', '22%');
    panel.classList.remove('is-lit');
  };

  panel.addEventListener('pointermove', update, { passive: true });
  panel.addEventListener('pointerenter', update, { passive: true });
  panel.addEventListener('pointerleave', leave, { passive: true });
}
