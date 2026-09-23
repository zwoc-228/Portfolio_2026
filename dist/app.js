import * as T from './assets/three.module.js';
import { createStudioEnvironment } from './studio-environment.js';
import { createModels } from './models.js';
import { HOME_TRANSFORMS } from './scene-layout.js';
import { createFloorReflection } from './floor-reflection.js';
import { names, cats, titles, subs, statements } from './content-data.js';
import { applyViewState, syncFilterButtons, renderIndex, showProjectDetail, hideProjectDetail, showInfo } from './ui-view.js';
import { createLiquidHeader } from './liquid-header.js';
import { createLiquidPanels } from './liquid-panels.js';
import { initUIMotion } from './ui-motion.js';
import { initSurfaceLightInteraction } from './ui-surface.js';
import { createFrameRuntime, FRAME_ACTIVE, FRAME_RENDER, FRAME_REFLECTION, FRAME_CAPTURE } from './frame-runtime.js';

const $ = (s) => document.querySelector(s);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
const easeInOutExpo = (t) => t <= 0 ? 0 : t >= 1 ? 1 : t < .5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;

let state = 'home';
let selected = 0;
let filter = 'All';
let renderer, scene, camera, floorReflection, runtime;
let liquidHeader, liquidPanels;
let models = [], home = [], hoverProfiles = [], homeHitBoxes = [], homeHeaderBoxes = [], architectureGlassPairs = [], architectureGlassDetailed = false, writingController = null;
let keyLight, keyCompanionLight;
let flashlight, flashlightTarget, beamHalo, beamParticles;
let transition = null, transitionFrame = 0;
let resizePending = false, resizeDeadline = 0;

const raycaster = new T.Raycaster();
const pointer = new T.Vector2();
const uiPanelRaycaster = new T.Raycaster();
const uiPanelNDC = new T.Vector2();
const floorPlane = new T.Plane(new T.Vector3(0, 1, 0), .016);
const glowHit = new T.Vector3();
const hitPoint = new T.Vector3();
const glowCurrent = new T.Vector3();
const glowTarget = new T.Vector3();
const beamDir = new T.Vector3();
const beamMid = new T.Vector3();
const beamUp = new T.Vector3(0, -1, 0);
const spotOrigin = new T.Vector3();
let pointerDirty = false, pointerClientX = 0, pointerClientY = 0;
let glowCurrentStrength = 0, glowTargetStrength = 0, hoveredModel = -1;
let spotAngleCurrent = T.MathUtils.degToRad(2.0), spotAngleTarget = T.MathUtils.degToRad(2.0), spotIntensityTarget = 0;
let particleTime = 0;
let panelReflectionHover = 0, hoverShadowTick = 0, wasLiftMoving = false;

let glassCaptureReady = false;
function drawFrame({ reflection = false, capture = false } = {}) {
  if (!renderer || !scene || !camera) return;
  if (reflection) floorReflection?.update(camera);
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);
  if (state === 'home') syncHomeLabelsToObjects();
  // Unseen-style rule: expensive screen capture is event-driven, not coupled to every visual tick.
  // Dust/twinkle can keep animating without copying the scene behind every glass surface again.
  if (capture || !glassCaptureReady) {
    liquidHeader?.captureBackground?.();
    liquidPanels?.captureBackground?.();
    glassCaptureReady = true;
  }
  liquidHeader?.renderOverlay?.();
  liquidPanels?.renderOverlay?.();
}

function markKeyShadowDirty() { if (keyLight) keyLight.shadow.needsUpdate = true; }
function markCompanionShadowDirty() { if (keyCompanionLight) keyCompanionLight.shadow.needsUpdate = true; }
function markStaticShadowsDirty() { markKeyShadowDirty(); markCompanionShadowDirty(); }


function getProjectedScreenBox(box) {
  if (!camera || !box) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const v = new T.Vector3();
  for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
    v.set(x,y,z).project(camera);
    const sx = (v.x * .5 + .5) * innerWidth;
    const sy = (1 - (v.y * .5 + .5)) * innerHeight;
    minX = Math.min(minX,sx); maxX = Math.max(maxX,sx);
    minY = Math.min(minY,sy); maxY = Math.max(maxY,sy);
  }
  if (![minX,minY,maxX,maxY].every(Number.isFinite)) return null;
  return { minX,minY,maxX,maxY,width:maxX-minX,height:maxY-minY,centerX:(minX+maxX)*.5 };
}

function syncHomeLabelsToObjects() {
  if (!camera || homeHeaderBoxes.length < 3) return;
  const labels = document.querySelectorAll('.object-label');
  homeHeaderBoxes.forEach((box,i) => {
    const label = labels[i];
    const r = getProjectedScreenBox(box);
    if (!label || !r) return;
    const gap = Math.max(14, Math.min(24, innerHeight * .022));
    label.style.left = `${T.MathUtils.clamp(r.centerX, 95, innerWidth - 95)}px`;
    label.style.top = `${T.MathUtils.clamp(r.maxY + gap, 90, innerHeight - 96)}px`;
  });
}

function getHomeHeaderScreenBounds() {
  if (!camera || homeHeaderBoxes.length < 2) return null;
  const boxes = [homeHeaderBoxes[0], homeHeaderBoxes[2]].filter(Boolean);
  if (boxes.length < 2) return null;
  let minX = Infinity, maxX = -Infinity;
  const v = new T.Vector3();
  for (const box of boxes) {
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
      v.set(x,y,z).project(camera);
      const sx = (v.x * .5 + .5) * innerWidth;
      minX = Math.min(minX, sx); maxX = Math.max(maxX, sx);
    }
  }
  if (!Number.isFinite(minX) || !Number.isFinite(maxX)) return null;
  const pad = Math.max(8, innerWidth * .006);
  return { left: minX - pad, right: maxX + pad };
}

function screenPointToFloor(x, y, out) {
  uiPanelNDC.set(x / innerWidth * 2 - 1, 1 - y / innerHeight * 2);
  uiPanelRaycaster.setFromCamera(uiPanelNDC, camera);
  return uiPanelRaycaster.ray.intersectPlane(floorPlane, out);
}

const panelHitL = new T.Vector3(), panelHitR = new T.Vector3(), panelHitC = new T.Vector3(), panelHitF = new T.Vector3();
function rectUnion(elements) {
  const rs = elements.filter(Boolean).filter(el => !el.hidden && el.getClientRects().length).map(el => el.getBoundingClientRect());
  if (!rs.length) return null;
  const left = Math.min(...rs.map(r => r.left)), right = Math.max(...rs.map(r => r.right));
  const top = Math.min(...rs.map(r => r.top)), bottom = Math.max(...rs.map(r => r.bottom));
  return { left, right, top, bottom, width:right-left, height:bottom-top };
}
function mapUIRectToFloor(slot, r, strength, hover = 0, pullPx = 150) {
  if (!r || r.width < 2 || r.height < 2 || !floorReflection?.setPanelReflection) {
    floorReflection?.setPanelReflection?.(slot,0,0,1,0,0,1,0,.5,0,0);
    return;
  }
  const y = Math.min(innerHeight - 3, r.bottom + 3);
  const lx = r.left + Math.min(14, r.width * .07);
  const rx = r.right - Math.min(14, r.width * .07);
  const cx = (r.left + r.right) * .5;
  const l = screenPointToFloor(lx, y, panelHitL);
  const rr = screenPointToFloor(rx, y, panelHitR);
  const c = screenPointToFloor(cx, y, panelHitC);
  const f = screenPointToFloor(cx, Math.min(innerHeight - 2, y + Math.min(pullPx, Math.max(82, r.height * .32))), panelHitF);
  if (!l || !rr || !c || !f) {
    floorReflection.setPanelReflection(slot,0,0,1,0,0,1,0,.5,0,0);
    return;
  }
  const dx = rr.x - l.x, dz = rr.z - l.z, len = Math.max(.05, Math.hypot(dx,dz));
  let nx = f.x - c.x, nz = f.z - c.z, depth = Math.max(.10, Math.hypot(nx,nz));
  nx /= depth; nz /= depth;
  floorReflection.setPanelReflection(slot,c.x,c.z,dx/len,dz/len,nx,nz,len*.50,depth,strength,hover);
}
function syncPanelFloorReflection() {
  if (!floorReflection?.setPanelReflection || !camera) return;
  if (state === 'home') { floorReflection.clearPanelReflections?.(); return; }
  const category = document.querySelector('.category-panel');
  mapUIRectToFloor(0, category && !category.hidden ? category.getBoundingClientRect() : null, state === 'preview' ? .22 : .16, panelReflectionHover, 150);

  const cards = [...document.querySelectorAll('.project-card')].filter(el => el.getClientRects().length).slice(0, 4);
  mapUIRectToFloor(1, rectUnion(cards), state === 'index' && cards.length ? .085 : 0, 0, 125);

  const detail = document.querySelector('#detail-card');
  mapUIRectToFloor(2, detail && !detail.hidden ? detail.getBoundingClientRect() : null, detail && !detail.hidden ? .13 : 0, 0, 165);
}

function resetTransientLighting() {
  glowCurrent.set(0,0,0); glowTarget.set(0,0,0);
  glowCurrentStrength = 0; glowTargetStrength = 0; hoveredModel = -1;
  spotIntensityTarget = 0; spotAngleTarget = spotAngleCurrent = T.MathUtils.degToRad(2.0);
  if (flashlight) { flashlight.intensity = 0; flashlight.visible = false; }
  if (beamHalo) { beamHalo.visible = false; if (beamHalo.material?.uniforms?.uOpacity) beamHalo.material.uniforms.uOpacity.value = 0; }
  if (beamParticles) { beamParticles.visible = false; if (beamParticles.material?.uniforms?.uOpacity) beamParticles.material.uniforms.uOpacity.value = 0; }
  floorReflection?.setGlow(0,0,0);
}

function applyWritingMaterialReveal(ctrl, reveal) {
  if (!ctrl) return;
  ctrl.revealCurrent = reveal;
  for (const mat of ctrl.materials || []) {
    if (mat.userData?.revealUniform) mat.userData.revealUniform.value = reveal;
    const a = mat.userData?.revealClosed, b = mat.userData?.revealOpen;
    if (!a || !b) continue;
    if (a.color !== undefined && b.color !== undefined) {
      const ca = new T.Color(a.color), cb = new T.Color(b.color);
      mat.color.copy(ca.lerp(cb, reveal));
    }
    if (a.roughness !== undefined && b.roughness !== undefined) mat.roughness = T.MathUtils.lerp(a.roughness, b.roughness, reveal);
    if (a.sheen !== undefined && b.sheen !== undefined) mat.sheen = T.MathUtils.lerp(a.sheen, b.sheen, reveal);
    if (a.clearcoat !== undefined && b.clearcoat !== undefined) mat.clearcoat = T.MathUtils.lerp(a.clearcoat, b.clearcoat, reveal);
    if (a.normalScale && b.normalScale) mat.normalScale.set(
      T.MathUtils.lerp(a.normalScale[0], b.normalScale[0], reveal),
      T.MathUtils.lerp(a.normalScale[1], b.normalScale[1], reveal)
    );
  }
}

function writingRevealTarget() {
  return state === 'preview' && selected === 0 ? 1 : 0;
}

function setArchitectureGlassDetail(detailed) {
  if (!architectureGlassPairs.length || architectureGlassDetailed === detailed) return;
  architectureGlassDetailed = detailed;
  for (const pair of architectureGlassPairs) pair.mesh.material = detailed ? pair.detail : pair.home;
  glassCaptureReady = false;
}

function updateWritingReveal(dt) {
  if (!writingController || transition) return false;
  const target = writingRevealTarget();
  const blend = reduced ? 1 : 1 - Math.pow(.84, dt * 60);
  const next = T.MathUtils.lerp(writingController.revealCurrent, target, blend);
  if (Math.abs(next - writingController.revealCurrent) <= .001) return false;
  applyWritingMaterialReveal(writingController, next);
  return true;
}

function updateBeam() {
  if (!flashlight || !flashlightTarget) return;
  const hover = hoveredModel >= 0 && state === 'home';
  spotAngleCurrent = T.MathUtils.lerp(spotAngleCurrent, spotAngleTarget, reduced ? 1 : .12);
  const originX = glowCurrent.x * .72 - .18;
  const originZ = glowCurrent.z * .74 + 2.15;
  spotOrigin.set(originX, 9.8, originZ);
  flashlight.position.lerp(spotOrigin, reduced ? 1 : .16);
  flashlightTarget.position.copy(glowCurrent);
  flashlight.angle = spotAngleCurrent;
  flashlight.intensity = T.MathUtils.lerp(flashlight.intensity, spotIntensityTarget * glowCurrentStrength, reduced ? 1 : .12);
  flashlight.visible = flashlight.intensity > .02;

  beamDir.subVectors(glowCurrent, flashlight.position);
  const dist = Math.max(.01, beamDir.length());
  beamDir.normalize();
  beamMid.copy(flashlight.position).addScaledVector(beamDir, dist * .5);
  const radius = Math.tan(spotAngleCurrent) * dist;

  if (beamHalo) {
    beamHalo.position.copy(beamMid);
    beamHalo.quaternion.setFromUnitVectors(beamUp, beamDir);
    beamHalo.scale.set(radius * 1.08, dist, radius * 1.08);
    // Restored full Round 22/26 volumetric strength: no visual subtraction.
    beamHalo.material.uniforms.uOpacity.value = T.MathUtils.lerp(beamHalo.material.uniforms.uOpacity.value, glowCurrentStrength * (hover ? .050 : .046), .12);
    beamHalo.visible = glowCurrentStrength > .01;
  }
  if (beamParticles) {
    beamParticles.position.copy(beamMid);
    beamParticles.quaternion.copy(beamHalo.quaternion);
    beamParticles.scale.set(radius * .82, dist, radius * .82);
    beamParticles.material.uniforms.uOpacity.value = T.MathUtils.lerp(beamParticles.material.uniforms.uOpacity.value, glowCurrentStrength * (hover ? .18 : .14), .12);
    beamParticles.material.uniforms.uTime.value = particleTime;
    beamParticles.visible = glowCurrentStrength > .02;
  }
}

function resolvePointer() {
  if (!pointerDirty || state !== 'home' || !camera) return;
  pointerDirty = false;
  pointer.set(pointerClientX / innerWidth * 2 - 1, -pointerClientY / innerHeight * 2 + 1);
  raycaster.setFromCamera(pointer, camera);

  // Use three coarse interaction volumes instead of triangle raycasts through every visible mesh.
  // The visual scene stays identical; only hit testing is simplified.
  let bestIndex = -1, bestDistance = Infinity;
  for (let i = 0; i < homeHitBoxes.length; i++) {
    const box = homeHitBoxes[i];
    if (!box) continue;
    const hit = raycaster.ray.intersectBox(box, hitPoint);
    if (!hit) continue;
    const d = raycaster.ray.origin.distanceToSquared(hitPoint);
    if (d < bestDistance) { bestDistance = d; bestIndex = i; }
  }
  renderer.domElement.style.cursor = bestIndex >= 0 ? 'pointer' : 'default';
  if (bestIndex >= 0) {
    const profile = hoverProfiles[bestIndex];
    if (profile) {
      setGlowTarget(profile.x, profile.y + .05, profile.z, 1, bestIndex, profile.angle, 3.1);
      return;
    }
  }
  if (raycaster.ray.intersectPlane(floorPlane, glowHit)) {
    setGlowTarget(glowHit.x, glowHit.y, glowHit.z, 1, -1, T.MathUtils.degToRad(1.95), 5.0);
  }
}
function setGlowTarget(x, y, z, strength, hoverIndex = -1, angle = T.MathUtils.degToRad(1.95), intensity = 5.0) {
  glowTarget.set(x, y, z);
  glowTargetStrength = strength;
  hoveredModel = hoverIndex;
  spotAngleTarget = angle;
  spotIntensityTarget = intensity;
  runtime?.request(FRAME_RENDER | FRAME_ACTIVE | FRAME_CAPTURE);
}

function getTargets() {
  const mobile = innerWidth / innerHeight < 1;
  return models.map((m, i) => {
    if (state === 'home') return { x: home[i].x, z: home[i].z, y: 0, s: 1, r: home[i].r };
    if (state === 'preview' && i === selected) return { x: mobile ? 1 : 2.3, z: mobile ? 2.7 : 0, y: 0, s: mobile ? 1.2 : 1.65, r: home[i].r };
    return { x: i <= selected ? -18 : 18, z: 0, y: 0, s: 1, r: home[i].r };
  });
}

function startTransition() {
  if (!models.length) return;
  transitionFrame = 0;
  document.documentElement.dataset.sceneReady = 'false';
  document.body.classList.add('is-transitioning');
  transition = {
    elapsed: 0,
    duration: reduced ? 1 : state === 'index' ? 480 : 680,
    from: models.map(m => ({ x: m.position.x, y: m.position.y, z: m.position.z, s: m.scale.x, r: m.rotation.y })),
    to: getTargets(),
    writing: writingController ? { revealFrom: writingController.revealCurrent, revealTo: writingRevealTarget() } : null,
  };
  runtime?.request(FRAME_RENDER | FRAME_ACTIVE);
}

function updateTransition(dt) {
  if (!transition) return 0;
  transition.elapsed += dt * 1000;
  const t = Math.min(1, transition.elapsed / transition.duration);
  const k = easeInOutExpo(t);
  transitionFrame++;
  models.forEach((m, i) => {
    const a = transition.from[i], b = transition.to[i];
    m.position.set(T.MathUtils.lerp(a.x, b.x, k), T.MathUtils.lerp(a.y, b.y, k), T.MathUtils.lerp(a.z, b.z, k));
    m.scale.setScalar(T.MathUtils.lerp(a.s, b.s, k));
    m.rotation.y = T.MathUtils.lerp(a.r, b.r, k);
  });
  if (writingController && transition.writing) {
    applyWritingMaterialReveal(writingController, T.MathUtils.lerp(transition.writing.revealFrom, transition.writing.revealTo, k));
  }
  const finalFrame = t >= 1;
  // Keep both full-quality shadow maps, but stagger their refresh so two VSM updates never spike in the same frame.
  if (finalFrame) markStaticShadowsDirty();
  else if (transitionFrame % 6 === 0) markKeyShadowDirty();
  else if (transitionFrame % 6 === 3) markCompanionShadowDirty();
  // Keep the same ~20fps reflection cadence, shifted away from shadow refresh frames.
  const reflectionFrame = finalFrame || transitionFrame % 3 === 1;
  if (finalFrame) {
    transition = null;
    transitionFrame = 0;
    document.documentElement.dataset.sceneReady = 'true';
    document.body.classList.remove('is-transitioning');
  }
  return FRAME_RENDER | FRAME_CAPTURE | (reflectionFrame ? FRAME_REFLECTION : 0) | (!finalFrame ? FRAME_ACTIVE : 0);
}

function updateScene(dt, now) {
  let flags = 0;
  if (resizePending) {
    if (now >= resizeDeadline) {
      resizePending = false;
      layout(false);
      if (state !== 'home') startTransition();
      glassCaptureReady = false;
      flags |= FRAME_RENDER | FRAME_REFLECTION | FRAME_CAPTURE;
    } else {
      flags |= FRAME_ACTIVE;
    }
  }

  resolvePointer();
  particleTime += dt;
  const k = reduced ? 1 : 1 - Math.pow(.80, dt * 60);
  glowCurrent.lerp(glowTarget, k);
  glowCurrentStrength = T.MathUtils.lerp(glowCurrentStrength, glowTargetStrength, reduced ? 1 : 1 - Math.pow(.86, dt * 60));
  floorReflection?.setGlow(glowCurrent.x, glowCurrent.z, glowCurrentStrength * (hoveredModel >= 0 ? .12 : .22));

  let liftMoving = false;
  if (state === 'home' && !transition) {
    models.forEach((m, i) => {
      const targetY = i === hoveredModel ? .085 * glowCurrentStrength : 0;
      const before = m.position.y;
      m.position.y = T.MathUtils.lerp(m.position.y, targetY, reduced ? 1 : 1 - Math.pow(.86, dt * 60));
      if (Math.abs(m.position.y - before) > .00008 || Math.abs(m.position.y - targetY) > .0015) liftMoving = true;
    });
  }
  if (liftMoving) {
    hoverShadowTick++;
    if (hoverShadowTick % 2) markKeyShadowDirty(); else markCompanionShadowDirty();
    flags |= FRAME_RENDER | FRAME_REFLECTION | FRAME_ACTIVE;
  } else if (wasLiftMoving) {
    markStaticShadowsDirty();
    flags |= FRAME_RENDER | FRAME_REFLECTION;
  }
  wasLiftMoving = liftMoving;

  updateBeam();
  if (updateWritingReveal(dt)) flags |= FRAME_RENDER | FRAME_CAPTURE;
  flags |= updateTransition(dt);

  const glowUnsettled = pointerDirty || glowCurrent.distanceToSquared(glowTarget) > .00002 || Math.abs(glowCurrentStrength - glowTargetStrength) > .004 || Math.abs(spotAngleCurrent - spotAngleTarget) > .00025 || models.some((m, i) => state === 'home' && !transition && Math.abs(m.position.y - (i === hoveredModel ? .085 * glowCurrentStrength : 0)) > .002);
  if (glowUnsettled) flags |= FRAME_RENDER | FRAME_ACTIVE | FRAME_CAPTURE;
  else if (glowCurrentStrength > .015) flags |= FRAME_RENDER | FRAME_ACTIVE;
  return flags;
}

function layout(request = true) {
  if (!camera || !renderer) return;
  const w = innerWidth, h = innerHeight, a = w / h;
  renderer.setSize(w, h);
  camera.aspect = a;
  const refAspect = 1672 / 941;
  const refVFov = T.MathUtils.degToRad(27);
  let fov;
  if (a < 1) fov = 55;
  else {
    const matchedVFov = 2 * Math.atan(Math.tan(refVFov / 2) * (refAspect / a));
    fov = T.MathUtils.clamp(T.MathUtils.radToDeg(matchedVFov), 22.6, 27);
  }
  camera.fov = fov;
  camera.position.set(0, 9, 13);
  camera.lookAt(0, .35, 0);
  camera.updateProjectionMatrix();
  if (a < 1) { camera.position.multiplyScalar(1.55); camera.lookAt(0, .2, 0); }
  syncHomeLabelsToObjects();
  liquidHeader?.syncLayout?.();
  liquidPanels?.syncLayout?.();
  setTimeout(syncPanelFloorReflection, 16);
  if (request) runtime?.renderWithReflection();
}

function drawIndex() {
  renderIndex({ state, selected, filter, cats, titles, subs, onOpen: (item) => { showProjectDetail(item); setTimeout(syncPanelFloorReflection, 20); runtime?.request(FRAME_RENDER | FRAME_CAPTURE); } });
}
function handleFilter(nextFilter) {
  hideProjectDetail();
  if (state === 'preview') { navigate('index', selected); filter = nextFilter; }
  else filter = nextFilter;
  drawIndex();
  syncFilterButtons(filter);
}
function navigate(s, i = selected, push = true) {
  hideProjectDetail();
  state = s; selected = i; filter = 'All';
  setArchitectureGlassDetail(s === 'preview' && i === 1);
  if (s !== 'home') {
    hoveredModel = -1;
    setGlowTarget(glowTarget.x, glowTarget.y, glowTarget.z, 0, -1, spotAngleTarget, 0);
  }
  applyViewState({ state, selected, names, cats, statements, filter, onFilter: handleFilter });
  drawIndex();
  setTimeout(syncPanelFloorReflection, 16);
  if (push) history.pushState({ state, selected }, '', state === 'home' ? '#home' : '#' + names[i].toLowerCase() + '/' + state);
  startTransition();
}
function readHash(push = false) {
  const h = location.hash.slice(1).split('/');
  const i = names.findIndex(x => x.toLowerCase() === h[0]);
  navigate(i >= 0 && ['preview', 'index'].includes(h[1]) ? h[1] : 'home', Math.max(0, i), push);
}

function bindUI() {
  $('#brand').onclick = () => navigate('home');
  $('#archive').onclick = () => navigate('index', selected);
  $('#enter').onclick = () => navigate('index');
  $('#back').onclick = () => navigate(state === 'index' ? 'preview' : 'home');
  document.querySelectorAll('[data-category]').forEach(b => b.onclick = () => navigate('preview', +b.dataset.category));
  $('.close').onclick = () => $('#info').close();
  $('#detail-close').onclick = () => { hideProjectDetail(); setTimeout(syncPanelFloorReflection, 190); runtime?.request(FRAME_RENDER | FRAME_CAPTURE); };
  $('#info').addEventListener('click', e => { if (e.target === $('#info')) $('#info').close(); });
  document.querySelectorAll('[data-dialog]').forEach(b => b.onclick = () => showInfo(b.dataset.dialog === 'about' ? 'Yuanlong Zhu' : 'Contact', b.dataset.dialog === 'about' ? 'Thinking through Architecture and the World.' : 'Contact details will appear here when provided.'));
  window.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || $('#info').open) return;
    if (document.body.classList.contains('detail-open')) { hideProjectDetail(); setTimeout(syncPanelFloorReflection, 190); runtime?.request(FRAME_RENDER | FRAME_CAPTURE); return; }
    navigate(state === 'index' ? 'preview' : 'home');
  });
  window.addEventListener('popstate', () => readHash(false));
  window.addEventListener('ui-panel-light', (e) => { panelReflectionHover = e.detail?.active ? 1 : 0; syncPanelFloorReflection(); runtime?.request(FRAME_RENDER); });
  let wheelTime = 0;
  window.addEventListener('wheel', e => {
    if (state === 'home' && Math.abs(e.deltaY) > 25 && performance.now() - wheelTime > 1000) {
      wheelTime = performance.now();
      navigate('preview', Math.min(2, Math.max(0, Math.floor(e.clientX / innerWidth * 3))));
    }
  }, { passive: true });
}

function bindSceneInput() {
  renderer.domElement.addEventListener('pointermove', e => {
    if (state !== 'home') return;
    pointerClientX = e.clientX; pointerClientY = e.clientY; pointerDirty = true;
    runtime.request(FRAME_RENDER | FRAME_ACTIVE);
  }, { passive: true });
  renderer.domElement.addEventListener('pointerleave', () => {
    pointerDirty = false;
    if (state === 'home') setGlowTarget(glowTarget.x, glowTarget.y, glowTarget.z, 0, -1, T.MathUtils.degToRad(1.95), 0);
  });
  renderer.domElement.addEventListener('click', e => {
    if (state !== 'home') return;
    pointer.set(e.clientX / innerWidth * 2 - 1, -e.clientY / innerHeight * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    let bestIndex = -1, bestDistance = Infinity;
    for (let i = 0; i < homeHitBoxes.length; i++) {
      const hit = raycaster.ray.intersectBox(homeHitBoxes[i], hitPoint);
      if (!hit) continue;
      const d = raycaster.ray.origin.distanceToSquared(hitPoint);
      if (d < bestDistance) { bestDistance = d; bestIndex = i; }
    }
    if (bestIndex >= 0) navigate('preview', bestIndex);
  });
  renderer.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); $('#failure').hidden = false; });
  document.addEventListener('visibilitychange', () => {
    runtime.setPaused(document.hidden);
    if (!document.hidden) runtime.renderWithReflection();
  });
  window.addEventListener('pageshow', () => {
    resetTransientLighting();
    floorReflection?.clear?.();
    glassCaptureReady = false;
    syncPanelFloorReflection();
    runtime?.request(FRAME_RENDER | FRAME_REFLECTION | FRAME_CAPTURE);
  });
  window.addEventListener('resize', () => {
    resizePending = true;
    resizeDeadline = performance.now() + 70;
    runtime.request(FRAME_ACTIVE);
  }, { passive: true });
}

async function loadTexture(loader, name, repeat = 1) {
  const t = await loader.loadAsync('assets/' + name);
  t.wrapS = t.wrapT = T.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = Math.min(16, renderer.capabilities.getMaxAnisotropy());
  return t;
}

async function init() {
  try {
    initUIMotion();
    initSurfaceLightInteraction();
    renderer = new T.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, lowPower ? 1.0 : 1.28));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.VSMShadowMap;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    $('#scene').append(renderer.domElement);

    scene = new T.Scene();
    scene.background = new T.Color(0xd8dde0);
    camera = new T.PerspectiveCamera(27, 1, .1, 200);

    const pmrem = new T.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(createStudioEnvironment(), .04).texture;
    scene.environmentIntensity = 1.05;
    pmrem.dispose();

    const loader = new T.TextureLoader();
    const [deskMetalColor, deskMetalRough, deskMetalNormal, deskMetalMetalness, linen, paper, linenNormal, paperNormal, paperRough, print, writingPaperColor, writingPaperNormal, writingPaperRough, archMarbleNormal, archMetalColor, archMetalNormal, archMetalRough, archPlasticRough] = await Promise.all([
      loadTexture(loader, 'desk-metal-color.png', 18), loadTexture(loader, 'desk-metal-roughness.png', 18), loadTexture(loader, 'desk-metal-normal.png', 18), loadTexture(loader, 'desk-metal-metalness.png', 18),
      loadTexture(loader, 'linen-bump.png', 3), loadTexture(loader, 'paper-bump.png', 2), loadTexture(loader, 'linen-normal.png', 3), loadTexture(loader, 'paper-normal.png', 2), loadTexture(loader, 'paper-rough.png', 2), loadTexture(loader, 'research-print.png'),
      loadTexture(loader, 'writing-paper-color.png'), loadTexture(loader, 'writing-paper-normal.png'), loadTexture(loader, 'writing-paper-roughness.png'),
      loadTexture(loader, 'arch-marble-normal.jpg'), loadTexture(loader, 'arch-metal-color.jpg'), loadTexture(loader, 'arch-metal-normal.jpg'), loadTexture(loader, 'arch-metal-rough.jpg'), loadTexture(loader, 'arch-plastic-rough.jpg')
    ]);
    deskMetalColor.colorSpace = T.SRGBColorSpace; writingPaperColor.colorSpace = T.SRGBColorSpace; print.colorSpace = T.SRGBColorSpace; archMetalColor.colorSpace = T.SRGBColorSpace; print.anisotropy = 8;
    for (const t of [writingPaperColor, writingPaperNormal, writingPaperRough]) { t.repeat.set(1,1); t.offset.set(0,0); t.center.set(.5,.5); t.rotation = 0; t.needsUpdate = true; }

    const ground = new T.Mesh(new T.PlaneGeometry(200, 200), new T.MeshPhysicalMaterial({
      color: 0xd7dcde, map: deskMetalColor, envMap: scene.environment, envMapIntensity: 1.42,
      metalness: .94, metalnessMap: deskMetalMetalness, roughness: .47, roughnessMap: deskMetalRough,
      normalMap: deskMetalNormal, normalScale: new T.Vector2(.18, .18), clearcoat: .045, clearcoatRoughness: .42,
      anisotropy: .92, anisotropyRotation: 0
    }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -.016; ground.receiveShadow = true; scene.add(ground);

    scene.add(new T.HemisphereLight(0xf8fafb, 0x879197, .34));
    keyLight = new T.DirectionalLight(0xfffcf7, .82); keyLight.position.set(-7.0, 10.8, 5.2); keyLight.castShadow = true; keyLight.shadow.mapSize.set(2048, 2048); Object.assign(keyLight.shadow.camera, { left: -8, right: 8, top: 6, bottom: -4, near: .1, far: 28 }); keyLight.shadow.bias = -.0001; keyLight.shadow.normalBias = .006; keyLight.shadow.radius = 5.2; keyLight.shadow.blurSamples = 8; keyLight.shadow.autoUpdate = false; keyLight.shadow.needsUpdate = true; scene.add(keyLight);
    keyCompanionLight = new T.DirectionalLight(0xf7fafc, .28); keyCompanionLight.position.set(-2.3, 8.5, 1.8); keyCompanionLight.castShadow = true; keyCompanionLight.shadow.mapSize.set(1024, 1024); Object.assign(keyCompanionLight.shadow.camera, { left: -7, right: 7, top: 5, bottom: -4, near: .1, far: 24 }); keyCompanionLight.shadow.bias = -.0001; keyCompanionLight.shadow.normalBias = .0055; keyCompanionLight.shadow.radius = 5.0; keyCompanionLight.shadow.blurSamples = 6; keyCompanionLight.shadow.autoUpdate = false; keyCompanionLight.shadow.needsUpdate = true; scene.add(keyCompanionLight);
    const fill = new T.DirectionalLight(0xeaf0f4, .24); fill.position.set(5.8, 7.0, -3.4); scene.add(fill);

    flashlightTarget = new T.Object3D(); scene.add(flashlightTarget);
    flashlight = new T.SpotLight(0xf6fbff, 0, 0, T.MathUtils.degToRad(2.0), .94, 0); flashlight.position.set(0, 9.8, 2.2); flashlight.target = flashlightTarget; flashlight.castShadow = false; scene.add(flashlight);
    const beamVert = `varying vec3 vPos;varying vec3 vNormalV;void main(){vPos=position;vNormalV=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
    const beamFrag = `uniform vec3 uColor;uniform float uOpacity;varying vec3 vPos;varying vec3 vNormalV;void main(){float h=clamp(.5-vPos.y,0.,1.);float vertical=smoothstep(.015,.18,h)*(1.-smoothstep(.80,.995,h));float facing=.46+.54*(1.-abs(vNormalV.z));float alpha=uOpacity*vertical*facing;gl_FragColor=vec4(uColor,alpha);}`;
    const beamMaterial = (color) => new T.ShaderMaterial({ uniforms: { uColor: { value: new T.Color(color) }, uOpacity: { value: 0 } }, vertexShader: beamVert, fragmentShader: beamFrag, transparent: true, depthWrite: false, depthTest: true, blending: T.AdditiveBlending, side: T.DoubleSide });
    beamHalo = new T.Mesh(new T.ConeGeometry(1, 1, 24, 1, true), beamMaterial(0xe9f3fb)); beamHalo.renderOrder = 1; scene.add(beamHalo);
    const dustCount = 36, dustPos = new Float32Array(dustCount * 3), dustSeed = new Float32Array(dustCount);
    for (let i = 0; i < dustCount; i++) { const h = Math.random(), a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * h * .92; dustPos[i*3] = Math.cos(a) * r; dustPos[i*3+1] = .5 - h; dustPos[i*3+2] = Math.sin(a) * r; dustSeed[i] = Math.random(); }
    const dustGeom = new T.BufferGeometry(); dustGeom.setAttribute('position', new T.BufferAttribute(dustPos, 3)); dustGeom.setAttribute('aSeed', new T.BufferAttribute(dustSeed, 1));
    const dustMat = new T.ShaderMaterial({ uniforms: { uOpacity: { value: 0 }, uTime: { value: 0 }, uColor: { value: new T.Color(0xf1f8fd) } }, vertexShader: `attribute float aSeed;uniform float uTime;varying float vSeed;void main(){vSeed=aSeed;vec3 p=position;p.y+=sin(uTime*.55+aSeed*18.)*.009;vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=(1.25+aSeed*2.35)*(26./max(1.,-mv.z));gl_Position=projectionMatrix*mv;}`, fragmentShader: `uniform float uOpacity;uniform vec3 uColor;varying float vSeed;void main(){float d=length(gl_PointCoord-.5);float soft=1.-smoothstep(.12,.5,d);float twinkle=.55+.45*sin(vSeed*31.);gl_FragColor=vec4(uColor,uOpacity*soft*twinkle);}`, transparent: true, depthWrite: false, depthTest: true, blending: T.AdditiveBlending });
    beamParticles = new T.Points(dustGeom, dustMat); beamParticles.renderOrder = 3; scene.add(beamParticles);
    flashlight.visible = false; beamHalo.visible = false; beamParticles.visible = false;

    floorReflection = createFloorReflection(renderer, scene, ground);
    floorReflection.setTransientObjects([flashlight, beamHalo, beamParticles]);
    floorReflection.clear();
    runtime = createFrameRuntime(drawFrame);
    runtime.add(updateScene);
    liquidHeader = createLiquidHeader({ renderer, camera, floorReflection, runtime, getBounds: getHomeHeaderScreenBounds });
    liquidPanels = createLiquidPanels({ renderer, runtime });

    const [linenColor, linenRough, paperColor, steelRough] = await Promise.all([loadTexture(loader, 'linen-color.png', 3), loadTexture(loader, 'linen-rough.png', 3), loadTexture(loader, 'paper-color.png', 2), loadTexture(loader, 'steel-rough.png')]);
    for (const t of [linenColor, paperColor]) { t.colorSpace = T.SRGBColorSpace; t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); }

    models = createModels({ linen, paper, print, linenNormal, paperNormal, paperRough, linenColor, linenRough, paperColor, steelRough, writingPaperColor, writingPaperNormal, writingPaperRough, archMarbleNormal, archMetalColor, archMetalNormal, archMetalRough, archPlasticRough });
    models.forEach((m, i) => {
      const f = HOME_TRANSFORMS[i]; m.scale.set(f[2], f[3], f[5]);
      const root = new T.Group(); root.add(m); root.position.set(f[0], 0, f[1]); root.rotation.y = f[4];
      if (i === 0 && m.userData.writingController) { writingController = m.userData.writingController; applyWritingMaterialReveal(writingController, 0); }
      models[i] = root; home.push({ x: f[0], z: f[1], r: f[4] }); scene.add(root);
    });
    homeHeaderBoxes = models.map(m => new T.Box3().setFromObject(m).clone());
    // Unseen-style perceptual LOD: keep the acrylic/glass appearance on the HOME maquette without
    // paying Three.js's full transmission prepass on every pointer frame. The true transmission
    // materials are restored for the Architecture preview, where the optical detail is visible.
    models[1].traverse(obj => {
      if (!obj.isMesh || !obj.material || !(obj.material.transmission > 0)) return;
      const detail = obj.material;
      const homeMat = detail.clone();
      homeMat.name = detail.name + ' · HOME optical proxy';
      homeMat.transmission = 0;
      homeMat.transparent = true;
      homeMat.depthWrite = false;
      if (/clear/i.test(detail.name)) homeMat.opacity = .22;
      else if (/smoked/i.test(detail.name)) homeMat.opacity = .50;
      else homeMat.opacity = .58;
      obj.material = homeMat;
      architectureGlassPairs.push({ mesh: obj, detail, home: homeMat });
    });
    architectureGlassDetailed = false;
    hoverProfiles = models.map(m => { const box = new T.Box3().setFromObject(m), center = new T.Vector3(), size = new T.Vector3(); box.getCenter(center); box.getSize(size); const horizontal = Math.max(size.x, size.z) * .54 + .18, approxDist = Math.max(4.7, 9.8 - center.y); return { x: center.x, y: center.y, z: center.z, angle: T.MathUtils.clamp(Math.atan(horizontal / approxDist) * 1.02, T.MathUtils.degToRad(4.9), T.MathUtils.degToRad(9.4)) }; });
    homeHitBoxes = models.map(m => new T.Box3().setFromObject(m).expandByScalar(.08));

    bindUI(); bindSceneInput(); layout(false); readHash(false);

    // First settled frame: explicitly reset all transient beam state and clear reflection history
    // before any planar/glass capture. This prevents stale first-load or bfcache beam ghosts.
    resetTransientLighting();
    floorReflection.clear();
    // Trionn-style warm-up: compile shaders and upload resources before the first settled interaction.
    renderer.compile(scene, camera);
    markStaticShadowsDirty();
    floorReflection.update(camera);
    drawFrame({ reflection: false });
    runtime.renderWithReflection();

    document.fonts.ready.then(() => { liquidHeader?.syncLayout(); liquidPanels?.syncLayout(); glassCaptureReady = false; runtime.request(FRAME_RENDER | FRAME_REFLECTION | FRAME_CAPTURE); });
    const idle = globalThis.requestIdleCallback || ((fn) => setTimeout(fn, 50));
    idle(() => {
      // Warm the expensive detailed Architecture transmission shaders off the critical interaction path.
      const shouldBeDetailed = state === 'preview' && selected === 1;
      if (!shouldBeDetailed) setArchitectureGlassDetail(true);
      renderer.compile(scene, camera);
      if (!shouldBeDetailed) setArchitectureGlassDetail(false);
      runtime.request(FRAME_RENDER | FRAME_CAPTURE);
    }, { timeout: 600 });
  } catch (e) {
    console.error(e);
    $('#failure').hidden = false;
    try { readHash(false); } catch {}
  }
}

init();
