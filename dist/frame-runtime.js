export const FRAME_RENDER = 1;
export const FRAME_REFLECTION = 2;
export const FRAME_ACTIVE = 4;

export function createFrameRuntime(draw) {
  const clients = new Set();
  const gsap = globalThis.gsap;
  let running = false;
  let raf = 0;
  let last = 0;
  let pending = FRAME_RENDER;
  let paused = document.hidden;

  function normalizeNow(value) {
    // gsap.ticker passes seconds; requestAnimationFrame passes milliseconds.
    return gsap ? value * 1000 : value;
  }

  function stopDriver() {
    if (!running) return;
    running = false;
    if (gsap) gsap.ticker.remove(tick);
    else if (raf) cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
  }

  function startDriver() {
    if (running || paused) return;
    running = true;
    if (gsap) gsap.ticker.add(tick);
    else raf = requestAnimationFrame(tick);
  }

  function tick(rawNow) {
    if (!running || paused) return;
    if (!gsap) raf = 0;
    const now = normalizeNow(rawNow);
    const dt = last ? Math.min(0.05, Math.max(0.001, (now - last) / 1000)) : 1 / 60;
    last = now;

    let flags = pending;
    pending = 0;
    for (const client of clients) {
      const result = client(dt, now) || 0;
      flags |= result;
    }

    if (flags & (FRAME_RENDER | FRAME_REFLECTION)) {
      draw({ reflection: !!(flags & FRAME_REFLECTION), now, dt });
    }

    const keepAlive = !!(flags & FRAME_ACTIVE) || pending !== 0;
    if (!keepAlive) {
      stopDriver();
      return;
    }
    if (!gsap) raf = requestAnimationFrame(tick);
  }

  function request(flags = FRAME_RENDER) {
    pending |= flags;
    startDriver();
  }

  function add(client) {
    clients.add(client);
    return () => clients.delete(client);
  }

  function setPaused(next) {
    paused = !!next;
    if (paused) stopDriver();
    else if (pending) startDriver();
  }

  return {
    add,
    request,
    render() { request(FRAME_RENDER); },
    renderWithReflection() { request(FRAME_RENDER | FRAME_REFLECTION); },
    setPaused,
    dispose() { stopDriver(); clients.clear(); },
    get running() { return running; },
    get usesGSAP() { return !!gsap; },
  };
}
