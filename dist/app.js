import * as T from './assets/three.module.js';
import {PALETTE} from './palette.js';
import { createStudioEnvironment } from './studio-environment.js';
import { createContactShadows } from './contact-shadows.js';
import { createModels } from './models.js';
import { HOME_TRANSFORMS } from './scene-layout.js';
import { createFloorReflection } from './floor-reflection.js';
import { createUIReflectionProxies } from './ui-reflection-proxies.js';
import { names, cats, titles, subs, statements } from './content-data.js';
import { applyViewState, syncFilterButtons, renderIndex, showProjectDetail, hideProjectDetail, showInfo } from './ui-view.js';
import { createLiquidHeader } from './liquid-header.js';
import { createLiquidPanels } from './liquid-panels.js';
import { initUIMotion } from './ui-motion.js';
import { initSurfaceLightInteraction } from './ui-surface.js';
import { createFrameRuntime, FRAME_ACTIVE, FRAME_RENDER, FRAME_REFLECTION } from './frame-runtime.js';

const $ = (s) => document.querySelector(s);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
const easeInOutExpo = (t) => t <= 0 ? 0 : t >= 1 ? 1 : t < .5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;

let state = 'home';
let selected = 0;
let filter = 'All';
let renderer, scene, camera, floorReflection, runtime, uiReflectionProxies;
let liquidHeader, liquidPanels;
let models = [], home = [], hoverProfiles = [], homeHitBoxes = [], homeHeaderBoxes = [], contactShadows = null;
let keyLight, keyCompanionLight;
let flashlight, flashlightTarget, beamHalo, beamParticles;
let transition = null;
let resizePending = false, resizeDeadline = 0;

const raycaster = new T.Raycaster();
const pointer = new T.Vector2();
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
let panelReflectionHover = 0, wasLiftMoving = false;

function drawFrame({ reflection = false } = {}) {
  if (!renderer || !scene || !camera) return;
  syncContactShadows();
  scene.updateMatrixWorld(true);
  if (reflection) floorReflection?.update(camera);
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);
  if (state === 'home') syncHomeLabelsToObjects();

}

function markKeyShadowDirty() { if (keyLight) keyLight.shadow.needsUpdate = true; }
function markStaticShadowsDirty() { markKeyShadowDirty(); }


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

function visibleUIRect(el,clip=null){
  if(!el||el.hidden||!el.getClientRects().length)return null;
  const style=getComputedStyle(el),opacity=Number(style.opacity);
  if(style.visibility==='hidden'||style.display==='none'||opacity<.01)return null;
  const r=el.getBoundingClientRect();
  const left=Math.max(r.left,clip?.left??0),right=Math.min(r.right,clip?.right??innerWidth);
  const top=Math.max(r.top,clip?.top??0),bottom=Math.min(r.bottom,clip?.bottom??innerHeight);
  if(right-left<2||bottom-top<2)return null;
  return {left,right,top,bottom,width:right-left,height:bottom-top,opacity};
}

function syncPanelFloorReflection() {
  if (!camera || !floorReflection) return;
  // DOM cards now receive reflection through real 3D proxy geometry in the mirror pass.
  // This removes the previous screen-space smear whose direction/length could not obey
  // the floor plane, camera perspective or card height.
  const categoryRect=state!=='home'?visibleUIRect(document.querySelector('.category-panel')):null;
  const index=document.querySelector('#index-content'),indexRect=state==='index'?visibleUIRect(index):null;
  const cardRects=indexRect?[...index.querySelectorAll('.project-card')].map(el=>visibleUIRect(el,indexRect)).filter(Boolean).slice(0,4):[];
  const detailRect=visibleUIRect(document.querySelector('#detail-card'));

  uiReflectionProxies?.sync({
    category: categoryRect,
    cards: cardRects,
    detail: detailRect,
    hover: panelReflectionHover
  });
  if (state === 'home') floorReflection.clearPanelReflections?.();
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

function syncContactShadows() { contactShadows?.update(); }


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
  runtime?.request(FRAME_RENDER | FRAME_ACTIVE);
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
  // Remove stale planar content before the first moved frame. Together with per-frame reflection
  // updates below, this prevents the old HOME architecture silhouette from hanging on the desk.
  floorReflection?.clear?.();
  document.documentElement.dataset.sceneReady = 'false';
  document.body.classList.add('is-transitioning');
  transition = {
    elapsed: 0,
    duration: reduced ? 1 : state === 'index' ? 480 : 680,
    from: models.map(m => ({ x: m.position.x, y: m.position.y, z: m.position.z, s: m.scale.x, r: m.rotation.y })),
    to: getTargets(),
  };
  runtime?.request(FRAME_RENDER | FRAME_ACTIVE);
}

function updateTransition(dt) {
  if (!transition) return 0;
  transition.elapsed += dt * 1000;
  const t = Math.min(1, transition.elapsed / transition.duration);
  const k = easeInOutExpo(t);
  models.forEach((m, i) => {
    const a = transition.from[i], b = transition.to[i];
    m.position.set(T.MathUtils.lerp(a.x, b.x, k), T.MathUtils.lerp(a.y, b.y, k), T.MathUtils.lerp(a.z, b.z, k));
    m.scale.setScalar(T.MathUtils.lerp(a.s, b.s, k));
    m.rotation.y = T.MathUtils.lerp(a.r, b.r, k);
  });

  syncContactShadows();
  const finalFrame = t >= 1;
  // All spatial passes use this frame’s transforms; never stagger moving shadows.
  markStaticShadowsDirty();
  if (finalFrame) {
    transition = null;
      document.documentElement.dataset.sceneReady = 'true';
    document.body.classList.remove('is-transitioning');
  }
  return FRAME_RENDER | FRAME_REFLECTION | (!finalFrame ? FRAME_ACTIVE : 0);
}

function updateScene(dt, now) {
  let flags = 0;
  if (resizePending) {
    if (now >= resizeDeadline) {
      resizePending = false;
      layout(false);
      if (state !== 'home') startTransition();
      flags |= FRAME_RENDER | FRAME_REFLECTION;
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
  syncContactShadows();
  if (liftMoving) {
    markStaticShadowsDirty();
    flags |= FRAME_RENDER | FRAME_REFLECTION | FRAME_ACTIVE;
  } else if (wasLiftMoving) {
    markStaticShadowsDirty();
    flags |= FRAME_RENDER | FRAME_REFLECTION;
  }
  wasLiftMoving = liftMoving;

  updateBeam();
  flags |= updateTransition(dt);

  const glowUnsettled = pointerDirty || glowCurrent.distanceToSquared(glowTarget) > .00002 || Math.abs(glowCurrentStrength - glowTargetStrength) > .004 || Math.abs(spotAngleCurrent - spotAngleTarget) > .00025 || models.some((m, i) => state === 'home' && !transition && Math.abs(m.position.y - (i === hoveredModel ? .085 * glowCurrentStrength : 0)) > .002);
  if (glowUnsettled) flags |= FRAME_RENDER | FRAME_ACTIVE;
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
  renderIndex({ state, selected, filter, cats, titles, subs, onOpen: (item) => { showProjectDetail(item); setTimeout(syncPanelFloorReflection, 20); runtime?.request(FRAME_RENDER); } });
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
function readHash(push = false, immediate = false) {
  const h = location.hash.slice(1).split('/');
  const i = names.findIndex(x => x.toLowerCase() === h[0]);
  const nextState = i >= 0 && ['preview', 'index'].includes(h[1]) ? h[1] : 'home';
  const nextSelected = Math.max(0, i);
  if (!immediate) {
    navigate(nextState, nextSelected, push);
    return;
  }

  // Initial page load must not manufacture a transition from HOME to HOME.  The old
  // route path started the frame runtime while textures/models were still settling,
  // which exposed a stretched default WebGL frame before the real scene appeared.
  hideProjectDetail();
  state = nextState;
  selected = nextSelected;
  filter = 'All';
  applyViewState({ state, selected, names, cats, statements, filter, onFilter: handleFilter });
  drawIndex();
  const targets = getTargets();
  models.forEach((m, index) => {
    const t = targets[index];
    m.position.set(t.x, t.y, t.z);
    m.scale.setScalar(t.s);
    m.rotation.y = t.r;
  });
  document.body.classList.remove('is-transitioning');
  transition = null;
  syncContactShadows();
  if (push) history.pushState({ state, selected }, '', state === 'home' ? '#home' : '#' + names[selected].toLowerCase() + '/' + state);
}

function bindUI() {
  $('#brand').onclick = () => navigate('home');
  $('#archive').onclick = () => navigate('index', selected);
  $('#enter').onclick = () => navigate('index');
  $('#back').onclick = () => navigate(state === 'index' ? 'preview' : 'home');
  document.querySelectorAll('[data-category]').forEach(b => b.onclick = () => navigate('preview', +b.dataset.category));
  $('.close').onclick = () => $('#info').close();
  $('#detail-close').onclick = () => { hideProjectDetail(); setTimeout(syncPanelFloorReflection, 190); runtime?.request(FRAME_RENDER); };
  $('#info').addEventListener('click', e => { if (e.target === $('#info')) $('#info').close(); });
  document.querySelectorAll('[data-dialog]').forEach(b => b.onclick = () => showInfo(b.dataset.dialog === 'about' ? 'Yuanlong Zhu' : 'Contact', b.dataset.dialog === 'about' ? 'Thinking through Architecture and the World.' : 'Contact details will appear here when provided.'));
  window.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || $('#info').open) return;
    if (document.body.classList.contains('detail-open')) { hideProjectDetail(); setTimeout(syncPanelFloorReflection, 190); runtime?.request(FRAME_RENDER); return; }
    navigate(state === 'index' ? 'preview' : 'home');
  });
  window.addEventListener('popstate', () => readHash(false));
  window.addEventListener('ui-panel-light', (e) => { panelReflectionHover = e.detail?.active ? 1 : 0; syncPanelFloorReflection(); runtime?.request(FRAME_RENDER | FRAME_REFLECTION); });
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
  renderer.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); runtime.setPaused(true); $('#failure').hidden = false; });
  renderer.domElement.addEventListener('webglcontextrestored', () => {
    floorReflection.clear();markStaticShadowsDirty();
    $('#failure').hidden=true;runtime.setPaused(document.hidden);runtime.request(FRAME_RENDER|FRAME_REFLECTION);
  });
  document.addEventListener('visibilitychange', () => {
    runtime.setPaused(document.hidden);
    if (!document.hidden) runtime.renderWithReflection();
  });
  window.addEventListener('pageshow', () => {
    resetTransientLighting();
    floorReflection?.clear?.();
    syncPanelFloorReflection();
    runtime?.request(FRAME_RENDER | FRAME_REFLECTION);
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
    bindUI();
    initUIMotion();
    initSurfaceLightInteraction();
    renderer = new T.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, lowPower ? 1.0 : 1.28));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.VSMShadowMap;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;
    $('#scene').append(renderer.domElement);

    scene = new T.Scene();
    scene.background = new T.Color(0xdfe5e5);
    camera = new T.PerspectiveCamera(27, innerWidth / Math.max(1, innerHeight), .1, 200);
    // Size and aim the renderer before any runtime client can request a frame.  This
    // removes the old 300×150 default-canvas stretch that appeared as horizontal bands.
    renderer.setSize(innerWidth, innerHeight, false);
    camera.position.set(0, 9, 13);
    camera.lookAt(0, .35, 0);
    camera.updateProjectionMatrix();

    const pmrem = new T.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(createStudioEnvironment(), .04).texture;
    scene.environmentIntensity = 1.22;
    pmrem.dispose();

    const loader = new T.TextureLoader();
    const deskMetalNormal=await loadTexture(loader, 'desk-metal-normal.png',18);

    const ground = new T.Mesh(new T.PlaneGeometry(200, 200), new T.MeshPhysicalMaterial({
      color: PALETTE.desk, envMap: scene.environment, envMapIntensity: 1.32,
      metalness: .76, roughness: .36,
      normalMap: deskMetalNormal, normalScale: new T.Vector2(.011, .011), clearcoat: .036, clearcoatRoughness: .38,
      anisotropy: .50, anisotropyRotation: 0
    }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -.016; ground.receiveShadow = true; scene.add(ground);

    scene.add(new T.HemisphereLight(0xfcfdfd, 0x95a0a5, .36));
    keyLight = new T.DirectionalLight(0xfcfeff, .90); keyLight.position.set(-6.7, 10.2, 5.6); keyLight.castShadow = true; keyLight.shadow.mapSize.set(2048, 2048); Object.assign(keyLight.shadow.camera, { left: -8, right: 8, top: 6, bottom: -4, near: .1, far: 28 }); keyLight.shadow.bias = -.00008; keyLight.shadow.normalBias = .0048; keyLight.shadow.radius = 6.2; keyLight.shadow.blurSamples = 10; keyLight.shadow.autoUpdate = false; keyLight.shadow.needsUpdate = true; scene.add(keyLight);
    keyCompanionLight = new T.DirectionalLight(0xf7fbfd, .28); keyCompanionLight.position.set(3.8, 7.6, 1.6); keyCompanionLight.castShadow = false; scene.add(keyCompanionLight);
    const fill = new T.DirectionalLight(0xecf2f4, .24); fill.position.set(6.4, 6.4, -4.4); scene.add(fill);

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
    runtime.setPaused(true);
    uiReflectionProxies = createUIReflectionProxies({ scene, camera, floorReflection });
    runtime.add(updateScene);
    liquidHeader = createLiquidHeader({ scene, camera, floorReflection, runtime });
    liquidPanels = createLiquidPanels({ runtime, onLayout: syncPanelFloorReflection });

    models = createModels();
    models.forEach((m, i) => {
      const f = HOME_TRANSFORMS[i]; m.scale.set(f[2], f[3], f[5]);
      const root = new T.Group(); root.add(m); root.position.set(f[0], 0, f[1]); root.rotation.y = f[4];
      models[i] = root; home.push({ x: f[0], z: f[1], r: f[4] }); scene.add(root);
    });
    homeHeaderBoxes = models.map(m => new T.Box3().setFromObject(m).clone());
    hoverProfiles = models.map(m => { const box = new T.Box3().setFromObject(m), center = new T.Vector3(), size = new T.Vector3(); box.getCenter(center); box.getSize(size); const horizontal = Math.max(size.x, size.z) * .54 + .18, approxDist = Math.max(4.7, 9.8 - center.y); return { x: center.x, y: center.y, z: center.z, angle: T.MathUtils.clamp(Math.atan(horizontal / approxDist) * 1.02, T.MathUtils.degToRad(4.9), T.MathUtils.degToRad(9.4)) }; });
    homeHitBoxes = models.map(m => new T.Box3().setFromObject(m).expandByScalar(.08));

    const modelNames=['writing','architecture','research'];
    const json=async url=>{const r=await fetch(url);if(!r.ok)throw Error('Missing '+url);return r.json();};
    const [atlases,uvSets,contactLayout,contactMaps]=await Promise.all([
      Promise.all(modelNames.map(n=>loader.loadAsync(`assets/${n}-studio-baked.jpg`))),
      Promise.all(modelNames.map(n=>json(`assets/${n}-bake-uv.json`))),
      json('assets/contact-ao-layout.json'),
      Promise.all(modelNames.map(n=>loader.loadAsync(`assets/${n}-contact-ao.png`)))
    ]);
    const oldMaterials=new Set();
    models.forEach((root,i)=>{
      const atlas=atlases[i];atlas.colorSpace=T.SRGBColorSpace;atlas.channel=1;atlas.anisotropy=Math.min(16,renderer.capabilities.getMaxAnisotropy());
      const studioMaterial=new T.MeshBasicMaterial({map:atlas,color:0xffffff,side:T.DoubleSide});studioMaterial.name='Cycles baked handmade studio';
      const useBakedAtlas=i===1;
      root.traverse(o=>{
        if(!o.isMesh)return;const uv=uvSets[i][o.name];if(o.geometry.index)o.geometry=o.geometry.toNonIndexed();
        if(!uv||uv.length!==o.geometry.attributes.position.count*2)throw Error('Baked UV mismatch: '+o.name);
        o.geometry.setAttribute('uv1',new T.Float32BufferAttribute(uv,2));
        o.receiveShadow=false;
        // Thin paper layers are grounded by the baked AO/contact pass. Letting every
        // 2–8 mm sheet cast VSM shadows produced the dark perimeter seams seen in R44.
        // Keep shadows only on structural pieces and the metal clip.
        if(i===0){
          o.castShadow=/cover|spine|bookmark/i.test(o.name);
        }else if(i===2){
          o.castShadow=/paperclip/i.test(o.name);
        }else{
          o.castShadow=true;
        }
        if(useBakedAtlas){
          oldMaterials.add(o.material);
          o.material=studioMaterial;
        }else{
          if(Array.isArray(o.material)){
            o.material=o.material.map(m=>{m.side=T.DoubleSide;m.envMap=scene.environment;m.envMapIntensity=.44;m.needsUpdate=true;return m;});
          }else if(o.material){
            o.material.side=T.DoubleSide;
            o.material.envMap=scene.environment;
            o.material.envMapIntensity=.50;
            if(/paper|cover|sheet|gathering|clip|spine/i.test(o.name)){
              o.material.roughness=Math.min(.90, (o.material.roughness ?? .7) + .025);
            }
            o.material.needsUpdate=true;
          }
        }
      });
    });
    oldMaterials.forEach(m=>m.dispose());
    contactShadows=createContactShadows(scene,models,contactLayout,contactMaps,floorReflection);
    floorReflection.setTransientObjects([flashlight,beamHalo,beamParticles,...contactShadows.meshes,...liquidHeader.transientObjects]);

    bindSceneInput();
    layout(false);
    readHash(false, true);

    // Wait for the local display fonts before exposing the first frame so header/label
    // measurements cannot shift after the scene is visible.
    try { await document.fonts.ready; } catch {}
    liquidHeader?.syncLayout();
    liquidPanels?.syncLayout();
    syncHomeLabelsToObjects();
    syncPanelFloorReflection();

    // First settled frame: explicitly reset all transient beam state and clear reflection history
    // before any planar/glass capture. This prevents stale first-load or bfcache beam ghosts.
    resetTransientLighting();
    floorReflection.clear();
    renderer.compile(scene, camera);
    markStaticShadowsDirty();
    drawFrame({ reflection: true });

    // Expose only the complete warmed scene, then start the event-driven runtime.
    document.documentElement.dataset.sceneReady = 'true';
    runtime.setPaused(document.hidden);
    runtime.request(FRAME_RENDER | FRAME_REFLECTION | FRAME_ACTIVE);
    setTimeout(() => {
      document.documentElement.dataset.boot = 'ready';
    }, reduced ? 0 : 36);

  } catch (e) {
    console.error(e);
    document.documentElement.dataset.boot = 'ready';
    $('#failure').hidden = false;
    try { readHash(false); } catch {}
  }
}

init();
