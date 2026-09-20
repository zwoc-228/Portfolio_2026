import * as T from './assets/three.module.js';
import { RoundedBoxGeometry } from './assets/RoundedBoxGeometry.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smooth = (t) => t * t * (3 - 2 * t);

function makeCausticTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const band = ctx.createLinearGradient(0, 128, 1024, 128);
  band.addColorStop(0.00, 'rgba(255,255,255,0.00)');
  band.addColorStop(0.12, 'rgba(209,236,255,0.20)');
  band.addColorStop(0.50, 'rgba(255,255,255,0.74)');
  band.addColorStop(0.88, 'rgba(209,236,255,0.20)');
  band.addColorStop(1.00, 'rgba(255,255,255,0.00)');
  ctx.fillStyle = band;
  ctx.fillRect(0, 86, 1024, 84);

  const ridge = ctx.createLinearGradient(0, 128, 1024, 128);
  ridge.addColorStop(0.00, 'rgba(255,255,255,0.00)');
  ridge.addColorStop(0.18, 'rgba(255,255,255,0.05)');
  ridge.addColorStop(0.50, 'rgba(255,255,255,0.26)');
  ridge.addColorStop(0.82, 'rgba(255,255,255,0.05)');
  ridge.addColorStop(1.00, 'rgba(255,255,255,0.00)');
  ctx.fillStyle = ridge;
  ctx.fillRect(0, 118, 1024, 20);

  const orb = ctx.createRadialGradient(512, 128, 8, 512, 128, 70);
  orb.addColorStop(0.00, 'rgba(255,255,255,0.76)');
  orb.addColorStop(0.24, 'rgba(236,247,255,0.52)');
  orb.addColorStop(0.60, 'rgba(199,226,246,0.14)');
  orb.addColorStop(1.00, 'rgba(255,255,255,0.00)');
  ctx.fillStyle = orb;
  ctx.beginPath();
  ctx.ellipse(512, 128, 94, 42, 0, 0, Math.PI * 2);
  ctx.fill();

  const tex = new T.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = T.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

function makeStreakTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 1024, 128);

  const streak = ctx.createLinearGradient(0, 64, 1024, 64);
  streak.addColorStop(0.00, 'rgba(255,255,255,0.00)');
  streak.addColorStop(0.18, 'rgba(208,238,255,0.08)');
  streak.addColorStop(0.34, 'rgba(255,255,255,0.42)');
  streak.addColorStop(0.50, 'rgba(255,255,255,0.86)');
  streak.addColorStop(0.66, 'rgba(255,255,255,0.42)');
  streak.addColorStop(0.82, 'rgba(208,238,255,0.08)');
  streak.addColorStop(1.00, 'rgba(255,255,255,0.00)');
  ctx.fillStyle = streak;
  ctx.fillRect(0, 52, 1024, 24);

  const tex = new T.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = T.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

export function createLiquidHeader({ scene, camera, environment, invalidate }) {
  const headerEl = document.querySelector('.site-header');
  if (!headerEl || !scene || !camera) return null;

  const rightButtons = [...headerEl.querySelectorAll('nav > button:not(#home-button)')];
  const textNodes = [
    headerEl.querySelector('#brand'),
    headerEl.querySelector('.coordinates'),
    headerEl.querySelector('.profession'),
    ...rightButtons,
  ].filter(Boolean);
  const orbButton = headerEl.querySelector('#home-button');

  headerEl.dataset.mode = 'collapsed';
  headerEl.style.setProperty('--reveal', '0');

  const glassMaterial = new T.MeshPhysicalMaterial({
    color: 0xf2f8fb,
    envMap: environment,
    envMapIntensity: 1.68,
    metalness: 0.0,
    roughness: 0.058,
    transmission: 1.0,
    dispersion: 0.085,
    ior: 1.145,
    thickness: 1.18,
    transparent: true,
    opacity: 0.76,
    attenuationDistance: 1.22,
    attenuationColor: new T.Color(0xe5f4ff),
    clearcoat: 1.0,
    clearcoatRoughness: 0.045,
    reflectivity: 0.92,
    sheen: 0.55,
    sheenRoughness: 0.30,
    sheenColor: new T.Color(0xf5fbff),
  });

  const shellMaterial = new T.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.18,
    side: T.BackSide,
    blending: T.AdditiveBlending,
    depthWrite: false,
  });

  const glowMaterial = new T.MeshBasicMaterial({
    color: 0xfafcff,
    transparent: true,
    opacity: 0.95,
    blending: T.AdditiveBlending,
    depthWrite: false,
  });

  const pillGeometry = new RoundedBoxGeometry(13.45, 0.72, 0.30, 6, 0.33);
  const pill = new T.Mesh(pillGeometry, glassMaterial);
  const pillShell = new T.Mesh(pillGeometry, shellMaterial);
  pillShell.scale.set(1.016, 1.028, 1.028);
  pill.renderOrder = 12;
  pillShell.renderOrder = 13;

  const core = new T.Mesh(
    new T.SphereGeometry(0.225, 48, 40),
    new T.MeshPhysicalMaterial({
      color: 0xfbfeff,
      envMap: environment,
      envMapIntensity: 2.35,
      roughness: 0.018,
      transmission: 1.0,
      dispersion: 0.12,
      ior: 1.165,
      thickness: 1.62,
      transparent: true,
      opacity: 0.94,
      attenuationDistance: 0.42,
      attenuationColor: new T.Color(0xdcf2ff),
      clearcoat: 1.0,
      clearcoatRoughness: 0.008,
    })
  );
  core.renderOrder = 14;

  const sparkle = new T.Mesh(new T.SphereGeometry(0.054, 18, 18), glowMaterial);
  sparkle.renderOrder = 15;

  const rimGlow = new T.Mesh(
    new T.PlaneGeometry(13.2, 0.18),
    new T.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.14,
      blending: T.AdditiveBlending,
      depthWrite: false,
    })
  );
  rimGlow.position.set(0, 0.16, 0.12);
  rimGlow.renderOrder = 16;

  const group = new T.Group();
  group.name = 'LiquidHeaderGlass';
  group.add(pill, pillShell, core, sparkle, rimGlow);
  scene.add(group);

  const causticTexture = makeCausticTexture();
  const causticMat = new T.MeshBasicMaterial({
    map: causticTexture,
    color: 0xeaf7ff,
    transparent: true,
    opacity: 0,
    blending: T.AdditiveBlending,
    depthWrite: false,
  });
  const caustic = new T.Mesh(new T.PlaneGeometry(1, 1), causticMat);
  caustic.rotation.x = -Math.PI / 2;
  caustic.position.set(0, -0.0145, -5.26);
  caustic.renderOrder = 4;
  scene.add(caustic);

  const streakTexture = makeStreakTexture();
  const streakMat = new T.MeshBasicMaterial({
    map: streakTexture,
    color: 0xf3fbff,
    transparent: true,
    opacity: 0,
    blending: T.AdditiveBlending,
    depthWrite: false,
  });
  const streak = new T.Mesh(new T.PlaneGeometry(1, 1), streakMat);
  streak.rotation.x = -Math.PI / 2;
  streak.position.set(0.18, -0.0142, -5.34);
  streak.renderOrder = 5;
  scene.add(streak);

  const shadow = new T.Mesh(
    new T.PlaneGeometry(1, 1),
    new T.MeshBasicMaterial({
      color: 0x162028,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, -0.0157, -5.18);
  shadow.renderOrder = 3;
  scene.add(shadow);

  const worldForward = new T.Vector3();
  const worldUp = new T.Vector3();
  const worldPos = new T.Vector3();

  let target = 0;
  let current = 0;
  let velocity = 0;
  let wobble = 0;
  let raf = 0;
  let last = 0;
  let hovering = false;
  let focusWithin = false;

  function applyDom(reveal, wobbleStrength) {
    const eased = smooth(reveal);
    const expandedWidth = Math.min(window.innerWidth - 56, 1680);
    const width = 60 + (expandedWidth - 60) * eased;
    headerEl.style.width = `${width}px`;
    headerEl.style.height = `${58 + 6 * eased}px`;
    headerEl.style.setProperty('--reveal', eased.toFixed(4));
    headerEl.dataset.mode = eased > 0.52 ? 'expanded' : 'collapsed';

    textNodes.forEach((node, index) => {
      const drift = (1 - eased) * (index < 3 ? 13 : 9) + wobbleStrength * 6;
      node.style.opacity = eased.toFixed(4);
      node.style.transform = `translateY(${drift.toFixed(3)}px)`;
      node.style.pointerEvents = eased > 0.72 ? 'auto' : 'none';
    });

    if (orbButton) {
      orbButton.style.pointerEvents = 'auto';
      orbButton.style.setProperty('--orb-travel', `${eased.toFixed(4)}`);
      orbButton.style.setProperty('--orb-scale-x', `${(1 + wobbleStrength * 0.045).toFixed(4)}`);
      orbButton.style.setProperty('--orb-scale-y', `${(1 - wobbleStrength * 0.055).toFixed(4)}`);
    }
  }

  function applyScene(reveal, wobbleStrength) {
    const eased = smooth(reveal);
    const dist = window.innerWidth / window.innerHeight < 1 ? 11.8 : 11.2;
    const halfHeight = Math.tan(T.MathUtils.degToRad(camera.fov) * 0.5) * dist;
    worldForward.set(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
    worldUp.set(0, 1, 0).applyQuaternion(camera.quaternion).normalize();

    worldPos.copy(camera.position)
      .addScaledVector(worldForward, dist)
      .addScaledVector(worldUp, halfHeight * 0.84);

    group.position.copy(worldPos);
    group.quaternion.copy(camera.quaternion);

    const stretchX = 1 + wobbleStrength * 0.08;
    const squashY = 1 - wobbleStrength * 0.05;
    const scaleX = (0.070 + eased * 1.005) * stretchX;
    group.scale.set(1, 1, 1);
    pill.scale.set(scaleX, (1.0 + eased * 0.03) * squashY, 1.0 + wobbleStrength * 0.04);
    pillShell.scale.set(scaleX * 1.016, (1.028 + eased * 0.02) * squashY, 1.028 + wobbleStrength * 0.04);
    rimGlow.scale.set(scaleX * 0.98, 1 + wobbleStrength * 0.16, 1);

    const orbX = T.MathUtils.lerp(0, 6.08, eased);
    core.position.set(orbX, wobbleStrength * 0.02, 0.03);
    core.scale.set(1 + wobbleStrength * 0.09, 1 - wobbleStrength * 0.08, 1 + wobbleStrength * 0.05);
    sparkle.position.set(orbX - 0.065, 0.076 + wobbleStrength * 0.01, 0.125);

    glassMaterial.roughness = T.MathUtils.lerp(0.045, 0.074, eased);
    glassMaterial.thickness = T.MathUtils.lerp(1.76, 1.12, eased);
    glassMaterial.envMapIntensity = T.MathUtils.lerp(2.28, 1.68, eased);
    glassMaterial.opacity = T.MathUtils.lerp(0.88, 0.76, eased);
    shellMaterial.opacity = T.MathUtils.lerp(0.24, 0.18, eased);
    rimGlow.material.opacity = T.MathUtils.lerp(0.20, 0.14, eased) + wobbleStrength * 0.06;

    caustic.position.set(0, -0.0145, T.MathUtils.lerp(-4.92, -5.26, eased));
    caustic.scale.set(T.MathUtils.lerp(0.54, 11.8, eased) * (1 + wobbleStrength * 0.10), T.MathUtils.lerp(0.21, 1.42, eased) * (1 - wobbleStrength * 0.05), 1);
    caustic.material.opacity = T.MathUtils.lerp(0.10, 0.26, eased) + wobbleStrength * 0.07;

    streak.position.set(T.MathUtils.lerp(0.05, 0.22, eased), -0.0142, T.MathUtils.lerp(-5.08, -5.36, eased));
    streak.scale.set(T.MathUtils.lerp(0.34, 7.8, eased) * (1 + wobbleStrength * 0.12), T.MathUtils.lerp(0.11, 0.34, eased), 1);
    streak.material.opacity = T.MathUtils.lerp(0.00, 0.17, eased) + wobbleStrength * 0.04;

    shadow.position.set(0, -0.0157, T.MathUtils.lerp(-5.02, -5.18, eased));
    shadow.scale.set(T.MathUtils.lerp(0.42, 9.6, eased), T.MathUtils.lerp(0.16, 0.56, eased), 1);
    shadow.material.opacity = T.MathUtils.lerp(0.07, 0.12, eased);
  }

  function step(now) {
    raf = 0;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;

    if (reducedMotion) {
      current = target;
      velocity = 0;
      wobble = 0;
    } else {
      const stiffness = 26;
      const damping = 9.5;
      const accel = (target - current) * stiffness;
      velocity += accel * dt;
      velocity *= Math.exp(-damping * dt);
      current += velocity * dt;
      current = clamp01(current);
      wobble = T.MathUtils.lerp(wobble, Math.min(1, Math.abs(velocity) * 3.2), 1 - Math.pow(0.20, dt * 60));
      if (Math.abs(target - current) < 0.0008 && Math.abs(velocity) < 0.0008) {
        current = target;
        velocity = 0;
        wobble *= 0.72;
      }
    }

    applyDom(current, wobble);
    applyScene(current, wobble);
    invalidate?.(true);
    if (Math.abs(current - target) > 0.0008 || Math.abs(velocity) > 0.0008 || wobble > 0.002 || hovering || focusWithin) {
      raf = requestAnimationFrame(step);
    }
  }

  function wake() {
    if (!raf) raf = requestAnimationFrame(step);
  }

  function setTarget(value) {
    target = clamp01(value);
    wake();
  }

  const onEnter = () => { hovering = true; setTarget(1); };
  const onLeave = () => { hovering = false; if (!focusWithin) setTarget(0); };
  const onFocusIn = () => { focusWithin = true; setTarget(1); };
  const onFocusOut = () => {
    focusWithin = headerEl.contains(document.activeElement);
    if (!focusWithin && !hovering) setTarget(0);
  };

  headerEl.addEventListener('pointerenter', onEnter);
  headerEl.addEventListener('pointerleave', onLeave);
  headerEl.addEventListener('focusin', onFocusIn);
  headerEl.addEventListener('focusout', onFocusOut);

  applyDom(0, 0);
  applyScene(0, 0);

  return {
    syncLayout() {
      applyScene(current, wobble);
      applyDom(current, wobble);
    },
    expand() { setTarget(1); },
    collapse() { if (!hovering && !focusWithin) setTarget(0); },
    dispose() {
      headerEl.removeEventListener('pointerenter', onEnter);
      headerEl.removeEventListener('pointerleave', onLeave);
      headerEl.removeEventListener('focusin', onFocusIn);
      headerEl.removeEventListener('focusout', onFocusOut);
      if (raf) cancelAnimationFrame(raf);
      scene.remove(group);
      scene.remove(caustic);
      scene.remove(streak);
      scene.remove(shadow);
      pillGeometry.dispose();
      glassMaterial.dispose();
      shellMaterial.dispose();
      rimGlow.geometry.dispose();
      rimGlow.material.dispose();
      core.geometry.dispose();
      core.material.dispose();
      sparkle.geometry.dispose();
      sparkle.material.dispose();
      caustic.geometry.dispose();
      caustic.material.map.dispose();
      caustic.material.dispose();
      streak.geometry.dispose();
      streak.material.map.dispose();
      streak.material.dispose();
      shadow.geometry.dispose();
      shadow.material.dispose();
    }
  };
}
