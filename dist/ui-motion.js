const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateNodes(nodes, { y = 14, duration = 620, stagger = 45, scale = 1 } = {}) {
  if (reduced) return;
  nodes.forEach((node, i) => {
    node.animate([
      { opacity: 0, transform: `translate3d(0,${y}px,0) scale(${scale})`, filter: 'blur(3px)' },
      { opacity: 1, transform: 'translate3d(0,0,0) scale(1)', filter: 'blur(0px)' }
    ], {
      duration,
      delay: i * stagger,
      easing: 'cubic-bezier(.16,1,.3,1)',
      fill: 'both'
    });
  });
}

function animateHomeLabels() {
  animateNodes([...document.querySelectorAll('.object-label')], { y: 10, duration: 700, stagger: 70, scale: .985 });
}

function animatePreview() {
  const panel = document.querySelector('.category-panel');
  if (!panel) return;
  animateNodes([...panel.children], { y: 16, duration: 650, stagger: 42, scale: .992 });
}

function animateIndex() {
  const content = document.querySelector('.index-content');
  if (!content) return;
  const cards = [...content.querySelectorAll('.writing-row,.gallery button')];
  animateNodes(cards, { y: 22, duration: 720, stagger: 55, scale: .985 });
}

function animateDialog() {
  const body = document.querySelector('#info-body');
  if (!body) return;
  animateNodes([...body.children], { y: 12, duration: 520, stagger: 70, scale: .99 });
}

export function initUIMotion() {
  let previous = document.body.className;
  const bodyObserver = new MutationObserver(() => {
    const state = document.body.className;
    if (state === previous) return;
    previous = state;
    queueMicrotask(() => {
      if (document.body.classList.contains('home')) animateHomeLabels();
      else if (document.body.classList.contains('preview')) animatePreview();
      else if (document.body.classList.contains('index')) animateIndex();
    });
  });
  bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  const dialog = document.querySelector('#info');
  const dialogObserver = dialog ? new MutationObserver(() => {
    if (dialog.open) requestAnimationFrame(animateDialog);
  }) : null;
  if (dialogObserver) dialogObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] });

  requestAnimationFrame(animateHomeLabels);

  return () => {
    bodyObserver.disconnect();
    dialogObserver?.disconnect();
  };
}
