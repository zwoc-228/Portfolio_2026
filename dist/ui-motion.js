const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const gsap = globalThis.gsap;

function fadeNodes(nodes, { y = 8, duration = 420, stagger = 36 } = {}) {
  if (!nodes.length || reduced || !gsap) return;
  gsap.killTweensOf(nodes);
  gsap.set(nodes, { autoAlpha: 0, y });
  gsap.to(nodes, {
    autoAlpha: 1,
    y: 0,
    duration: duration / 1000,
    stagger: stagger / 1000,
    ease: 'power2.out',
    clearProps: 'transform,opacity,visibility'
  });
}

function animateHomeLabels() {
  fadeNodes([...document.querySelectorAll('.object-label')], { y: 7, duration: 460, stagger: 45 });
}

function animateDialog() {
  const body = document.querySelector('#info-body');
  if (body) fadeNodes([...body.children], { y: 6, duration: 320, stagger: 38 });
}

export function initUIMotion() {
  let wasHome = document.body.classList.contains('home');
  const bodyObserver = new MutationObserver(() => {
    const isHome = document.body.classList.contains('home');
    if (isHome && !wasHome) queueMicrotask(animateHomeLabels);
    wasHome = isHome;
  });
  bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  const dialog = document.querySelector('#info');
  const dialogObserver = dialog ? new MutationObserver(() => {
    if (dialog.open) queueMicrotask(animateDialog);
  }) : null;
  dialogObserver?.observe(dialog, { attributes: true, attributeFilter: ['open'] });

  queueMicrotask(animateHomeLabels);
  return () => { bodyObserver.disconnect(); dialogObserver?.disconnect(); };
}
