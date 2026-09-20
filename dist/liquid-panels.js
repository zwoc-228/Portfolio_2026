import * as T from './assets/three.module.js';
import { RoundedBoxGeometry } from './assets/RoundedBoxGeometry.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp01 = (v) => Math.max(0, Math.min(1, v));

function visibleElement(el) {
  if (!el) return false;
  if (el.matches('dialog')) return !!el.open;
  if (el.hidden || !el.getClientRects().length) return false;
  const style = getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0.01;
}

function makePanelMaterial(environment, tone = 0) {
  const tint = tone === 1 ? 0xe5eef2 : tone === 2 ? 0xf4f8fa : 0xeaf3f7;
  return new T.MeshPhysicalMaterial({
    color: tint,
    envMap: environment,
    envMapIntensity: tone === 2 ? 1.95 : 1.62,
    roughness: tone === 2 ? 0.075 : 0.11,
    metalness: 0,
    transmission: 0.965,
    dispersion: tone === 2 ? 0.075 : 0.045,
    ior: 1.16,
    thickness: tone === 2 ? 1.1 : 0.86,
    transparent: true,
    opacity: tone === 2 ? 0.78 : 0.66,
    attenuationDistance: tone === 2 ? 1.35 : 1.85,
    attenuationColor: new T.Color(tone === 1 ? 0xdbe9ef : 0xe5f2f7),
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    sheen: 0.36,
    sheenRoughness: 0.42,
    sheenColor: new T.Color(0xf6fbff),
    depthWrite: false,
  });
}

function screenRectToWorld(rect, camera, depth, outPos, outScale) {
  const vw = innerWidth;
  const vh = innerHeight;
  const aspect = camera.aspect;
  const fov = T.MathUtils.degToRad(camera.fov);
  const worldH = 2 * Math.tan(fov * 0.5) * depth;
  const worldW = worldH * aspect;

  const cx = rect.left + rect.width * 0.5;
  const cy = rect.top + rect.height * 0.5;
  const nx = cx / vw * 2 - 1;
  const ny = 1 - cy / vh * 2;

  const forward = new T.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
  const right = new T.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).normalize();
  const up = new T.Vector3(0, 1, 0).applyQuaternion(camera.quaternion).normalize();

  outPos.copy(camera.position)
    .addScaledVector(forward, depth)
    .addScaledVector(right, nx * worldW * 0.5)
    .addScaledVector(up, ny * worldH * 0.5);

  outScale.set(rect.width / vw * worldW, rect.height / vh * worldH, 1);
}

function createPanel(scene, camera, environment, spec) {
  const geometry = new RoundedBoxGeometry(1, 1, 0.10, 5, 0.095);
  const material = makePanelMaterial(environment, spec.tone || 0);
  const mesh = new T.Mesh(geometry, material);
  mesh.renderOrder = 18 + (spec.order || 0);
  mesh.visible = false;

  const shell = new T.Mesh(
    geometry,
    new T.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.11,
      blending: T.AdditiveBlending,
      depthWrite: false,
      side: T.BackSide,
    })
  );
  shell.renderOrder = mesh.renderOrder + 1;
  shell.visible = false;

  const rim = new T.Mesh(
    new T.PlaneGeometry(1, 0.08),
    new T.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.11,
      blending: T.AdditiveBlending,
      depthWrite: false,
    })
  );
  rim.renderOrder = mesh.renderOrder + 2;
  rim.visible = false;

  scene.add(mesh, shell, rim);

  const pos = new T.Vector3();
  const scale = new T.Vector3();
  let reveal = 0;
  let target = 0;
  let velocity = 0;
  let active = false;

  function syncRect() {
    const el = document.querySelector(spec.selector);
    active = visibleElement(el);
    target = active ? 1 : 0;
    if (!el || !active) return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    screenRectToWorld(rect, camera, spec.depth || 9.1, pos, scale);
    mesh.position.copy(pos);
    mesh.quaternion.copy(camera.quaternion);
    shell.position.copy(pos);
    shell.quaternion.copy(camera.quaternion);
    rim.position.copy(pos);
    rim.quaternion.copy(camera.quaternion);
    const fwd = new T.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
    rim.position.addScaledVector(fwd, -0.060);
    mesh.userData.targetScale = scale.clone();
  }

  function step(dt) {
    if (reducedMotion) {
      reveal = target;
      velocity = 0;
    } else {
      const stiffness = 30;
      const damping = 10.5;
      velocity += (target - reveal) * stiffness * dt;
      velocity *= Math.exp(-damping * dt);
      reveal += velocity * dt;
      reveal = clamp01(reveal);
      if (Math.abs(target - reveal) < 0.001 && Math.abs(velocity) < 0.001) {
        reveal = target;
        velocity = 0;
      }
    }

    const s = mesh.userData.targetScale || scale;
    const intro = 0.92 + reveal * 0.08;
    const drift = (1 - reveal) * (spec.slide || 0.18);
    const right = new T.Vector3(1,0,0).applyQuaternion(camera.quaternion);
    const up = new T.Vector3(0,1,0).applyQuaternion(camera.quaternion);
    const base = pos.clone().addScaledVector(spec.axis === 'x' ? right : up, spec.direction === -1 ? -drift : drift);
    mesh.position.copy(base);
    shell.position.copy(base);
    rim.position.copy(base);
    const fwd = new T.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
    rim.position.addScaledVector(fwd, -0.060);

    mesh.scale.set(Math.max(0.001, s.x * intro), Math.max(0.001, s.y * intro), 1);
    shell.scale.set(mesh.scale.x * 1.013, mesh.scale.y * 1.016, 1.05);
    rim.scale.set(mesh.scale.x * 0.88, Math.max(0.006, mesh.scale.y * 0.075), 1);

    material.opacity = (spec.tone === 2 ? 0.78 : 0.66) * reveal;
    shell.material.opacity = 0.11 * reveal;
    rim.material.opacity = 0.13 * reveal;
    mesh.visible = shell.visible = rim.visible = reveal > 0.003;
    return Math.abs(reveal - target) > 0.001 || Math.abs(velocity) > 0.001;
  }

  return { syncRect, step, dispose() {
    scene.remove(mesh, shell, rim);
    geometry.dispose(); material.dispose(); shell.material.dispose(); rim.geometry.dispose(); rim.material.dispose();
  }};
}

export function createLiquidPanels({ scene, camera, environment, invalidate }) {
  const specs = [
    { selector: '.category-panel', depth: 9.0, tone: 1, axis: 'x', direction: -1, slide: 0.22, order: 0 },
    { selector: '.index-content', depth: 9.12, tone: 0, axis: 'y', direction: 1, slide: 0.20, order: 1 },
    { selector: '#info', depth: 8.8, tone: 2, axis: 'y', direction: 1, slide: 0.15, order: 2 },
  ];
  const panels = specs.map((spec) => createPanel(scene, camera, environment, spec));
  let raf = 0;
  let last = 0;
  let dirty = true;

  function sync() {
    dirty = false;
    panels.forEach((p) => p.syncRect());
    wake();
  }

  function frame(now) {
    raf = 0;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    if (dirty) panels.forEach((p) => p.syncRect());
    const moving = panels.some((p) => p.step(dt));
    invalidate?.(false);
    if (moving) raf = requestAnimationFrame(frame);
  }

  function wake() { if (!raf) raf = requestAnimationFrame(frame); }

  const mo = new MutationObserver(() => { dirty = true; sync(); });
  mo.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class', 'hidden', 'open'] });
  const ro = new ResizeObserver(() => { dirty = true; sync(); });
  document.querySelectorAll('.category-panel,.index-content,#info').forEach((el) => ro.observe(el));
  window.addEventListener('resize', sync, { passive: true });
  sync();

  return {
    syncLayout: sync,
    dispose() {
      mo.disconnect(); ro.disconnect(); window.removeEventListener('resize', sync);
      if (raf) cancelAnimationFrame(raf);
      panels.forEach((p) => p.dispose());
    }
  };
}
