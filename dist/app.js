import * as T from './assets/three.module.js';
import { createStudioEnvironment } from './studio-environment.js';
import { createModels } from './models.js';
import { HOME_TRANSFORMS } from './scene-layout.js';
import { createFloorReflection } from './floor-reflection.js';
import { names, cats, titles, subs } from './content-data.js';
import { applyViewState, syncFilterButtons, renderIndex, showInfo } from './ui-view.js';
import { createLiquidHeader } from './liquid-header.js';
import { createLiquidPanels } from './liquid-panels.js';
import { initUIMotion } from './ui-motion.js';
import { createFrameRuntime, FRAME_ACTIVE, FRAME_RENDER, FRAME_REFLECTION } from './frame-runtime.js';

const $ = (s) => document.querySelector(s);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
const easeInOutExpo = (t) => t <= 0 ? 0 : t >= 1 ? 1 : t < .5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;

let state = 'home';
let selected = 0;
let filter = 'All';
let renderer, scene, camera, floorReflection, runtime;
let liquidHeader, liquidPanels;
let models = [], home = [], hoverProfiles = [], writingController = null;
let keyLight, keyCompanionLight;
let flashlight, flashlightTarget, beamHalo, beamParticles;
let transition = null, transitionFrame = 0;
let resizePending = false, resizeDeadline = 0;

const raycaster = new T.Raycaster();
const pointer = new T.Vector2();
const floorPlane = new T.Plane(new T.Vector3(0, 1, 0), .016);
const glowHit = new T.Vector3();
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

function drawFrame({ reflection = false } = {}) {
  if (!renderer || !scene || !camera) return;
  if (reflection) floorReflection?.update(camera);
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);
  // Capture the same background for all glass surfaces before any glass overlay is drawn.
  liquidHeader?.captureBackground?.();
  liquidPanels?.captureBackground?.();
  liquidHeader?.renderOverlay?.();
  liquidPanels?.renderOverlay?.();
}

function markStaticShadowsDirty() {
  if (keyLight) keyLight.shadow.needsUpdate = true;
  if (keyCompanionLight) keyCompanionLight.shadow.needsUpdate = true;
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
    beamParticles.material.uniforms.uOpacity.value = T.MathUtils.lerp(beamParticles.material.uniforms.uOpacity.value, glowCurrentStrength * (hover ? .13 : .10), .12);
    beamParticles.material.uniforms.uTime.value = particleTime;
    beamParticles.visible = glowCurrentStrength > .02;
  }
}

function resolvePointer() {
  if (!pointerDirty || state !== 'home' || !camera) return;
  pointerDirty = false;
  pointer.set(pointerClientX / innerWidth * 2 - 1, -pointerClientY / innerHeight * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const objectHit = raycaster.intersectObjects(models, true)[0];
  renderer.domElement.style.cursor = objectHit ? 'pointer' : 'default';
  if (objectHit) {
    let root = objectHit.object;
    while (root.parent && !models.includes(root)) root = root.parent;
    const i = models.indexOf(root), profile = hoverProfiles[i];
    if (i >= 0 && profile) {
      setGlowTarget(profile.x, profile.y + .05, profile.z, 1, i, profile.angle, 3.1);
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
  const shadowFrame = finalFrame || transitionFrame % 5 === 0;
  const reflectionFrame = finalFrame || transitionFrame % 3 === 0;
  if (shadowFrame) markStaticShadowsDirty();
  if (finalFrame) {
    transition = null;
    transitionFrame = 0;
    document.documentElement.dataset.sceneReady = 'true';
    document.body.classList.remove('is-transitioning');
  }
  return FRAME_RENDER | (reflectionFrame ? FRAME_REFLECTION : 0) | (!finalFrame ? FRAME_ACTIVE : 0);
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

  if (state === 'home' && !transition) {
    models.forEach((m, i) => {
      const targetY = i === hoveredModel ? .085 * glowCurrentStrength : 0;
      m.position.y = T.MathUtils.lerp(m.position.y, targetY, reduced ? 1 : 1 - Math.pow(.86, dt * 60));
    });
  }

  updateBeam();
  if (updateWritingReveal(dt)) flags |= FRAME_RENDER;
  flags |= updateTransition(dt);

  const glowUnsettled = pointerDirty || glowCurrent.distanceToSquared(glowTarget) > .00002 || Math.abs(glowCurrentStrength - glowTargetStrength) > .004 || Math.abs(spotAngleCurrent - spotAngleTarget) > .00025 || models.some((m, i) => state === 'home' && !transition && Math.abs(m.position.y - (i === hoveredModel ? .085 * glowCurrentStrength : 0)) > .002);
  if (glowUnsettled || glowCurrentStrength > .015) flags |= FRAME_RENDER | FRAME_ACTIVE;
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
  liquidHeader?.syncLayout?.();
  liquidPanels?.syncLayout?.();
  if (request) runtime?.renderWithReflection();
}

function drawIndex() {
  renderIndex({ state, selected, filter, cats, titles, subs, onOpen: (title) => showInfo(title, 'This title and image reproduce the supplied visual reference. The original project text has not been supplied.') });
}
function handleFilter(nextFilter) {
  if (state === 'preview') { navigate('index', selected); filter = nextFilter; }
  else filter = nextFilter;
  drawIndex();
  syncFilterButtons(filter);
}
function navigate(s, i = selected, push = true) {
  state = s; selected = i; filter = 'All';
  if (s !== 'home') {
    hoveredModel = -1;
    setGlowTarget(glowTarget.x, glowTarget.y, glowTarget.z, 0, -1, spotAngleTarget, 0);
  }
  applyViewState({ state, selected, names, cats, filter, onFilter: handleFilter });
  drawIndex();
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
  $('#home-button').onclick = () => navigate('home');
  $('#archive').onclick = () => navigate('index', selected);
  $('#enter').onclick = () => navigate('index');
  $('#back').onclick = () => navigate(state === 'index' ? 'preview' : 'home');
  document.querySelectorAll('[data-category]').forEach(b => b.onclick = () => navigate('preview', +b.dataset.category));
  $('.close').onclick = () => $('#info').close();
  $('#info').addEventListener('click', e => { if (e.target === $('#info')) $('#info').close(); });
  document.querySelectorAll('[data-dialog]').forEach(b => b.onclick = () => showInfo(b.dataset.dialog === 'about' ? 'Yuanlong Zhu' : 'Contact', b.dataset.dialog === 'about' ? 'Thinking through Architecture and the World.' : 'Contact details will appear here when provided.'));
  window.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#info').open) navigate(state === 'index' ? 'preview' : 'home'); });
  window.addEventListener('popstate', () => readHash(false));
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
    const hit = raycaster.intersectObjects(models, true)[0];
    if (!hit) return;
    let root = hit.object;
    while (root.parent && !models.includes(root)) root = root.parent;
    const i = models.indexOf(root);
    if (i >= 0) navigate('preview', i);
  });
  renderer.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); $('#failure').hidden = false; });
  document.addEventListener('visibilitychange', () => {
    runtime.setPaused(document.hidden);
    if (!document.hidden) runtime.renderWithReflection();
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
    renderer = new T.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, lowPower ? 1.0 : 1.28));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.VSMShadowMap;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.20;
    $('#scene').append(renderer.domElement);

    scene = new T.Scene();
    scene.background = new T.Color(0xe3e6e8);
    camera = new T.PerspectiveCamera(27, 1, .1, 200);

    const pmrem = new T.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(createStudioEnvironment(), .04).texture;
    scene.environmentIntensity = 1.42;
    pmrem.dispose();

    const loader = new T.TextureLoader();
    const [deskMetalColor, deskMetalRough, deskMetalNormal, deskMetalMetalness, linen, paper, linenNormal, paperNormal, paperRough, print, writingPaperColor, writingPaperNormal, writingPaperRough, archMarbleColor, archMarbleNormal, archMarbleRough, archMetalColor, archMetalNormal, archMetalRough, archPlasticRough] = await Promise.all([
      loadTexture(loader, 'desk-metal-color.png', 18), loadTexture(loader, 'desk-metal-roughness.png', 18), loadTexture(loader, 'desk-metal-normal.png', 18), loadTexture(loader, 'desk-metal-metalness.png', 18),
      loadTexture(loader, 'linen-bump.png', 3), loadTexture(loader, 'paper-bump.png', 2), loadTexture(loader, 'linen-normal.png', 3), loadTexture(loader, 'paper-normal.png', 2), loadTexture(loader, 'paper-rough.png', 2), loadTexture(loader, 'research-print.png'),
      loadTexture(loader, 'writing-paper-color.png'), loadTexture(loader, 'writing-paper-normal.png'), loadTexture(loader, 'writing-paper-roughness.png'),
      loadTexture(loader, 'arch-marble-color.jpg'), loadTexture(loader, 'arch-marble-normal.jpg'), loadTexture(loader, 'arch-marble-rough.jpg'), loadTexture(loader, 'arch-metal-color.jpg'), loadTexture(loader, 'arch-metal-normal.jpg'), loadTexture(loader, 'arch-metal-rough.jpg'), loadTexture(loader, 'arch-plastic-rough.jpg')
    ]);
    deskMetalColor.colorSpace = T.SRGBColorSpace; writingPaperColor.colorSpace = T.SRGBColorSpace; print.colorSpace = T.SRGBColorSpace; archMarbleColor.colorSpace = T.SRGBColorSpace; archMetalColor.colorSpace = T.SRGBColorSpace; print.anisotropy = 8;
    for (const t of [writingPaperColor, writingPaperNormal, writingPaperRough]) { t.repeat.set(1,1); t.offset.set(0,0); t.center.set(.5,.5); t.rotation = 0; t.needsUpdate = true; }

    const ground = new T.Mesh(new T.PlaneGeometry(200, 200), new T.MeshPhysicalMaterial({
      color: 0xf4f6f7, map: deskMetalColor, envMap: scene.environment, envMapIntensity: 3.10,
      metalness: .97, metalnessMap: deskMetalMetalness, roughness: .43, roughnessMap: deskMetalRough,
      normalMap: deskMetalNormal, normalScale: new T.Vector2(.20, .20), clearcoat: .18, clearcoatRoughness: .30,
      anisotropy: .78, anisotropyRotation: 0
    }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -.016; ground.receiveShadow = true; scene.add(ground);

    scene.add(new T.HemisphereLight(0xf8fafb, 0x97a0a5, .22));
    keyLight = new T.DirectionalLight(0xfffcf7, 1.82); keyLight.position.set(-7.0, 10.8, 5.2); keyLight.castShadow = true; keyLight.shadow.mapSize.set(2048, 2048); Object.assign(keyLight.shadow.camera, { left: -8, right: 8, top: 6, bottom: -4, near: .1, far: 28 }); keyLight.shadow.bias = -.0001; keyLight.shadow.normalBias = .006; keyLight.shadow.radius = 4.2; keyLight.shadow.blurSamples = 8; keyLight.shadow.autoUpdate = false; keyLight.shadow.needsUpdate = true; scene.add(keyLight);
    keyCompanionLight = new T.DirectionalLight(0xf7fafc, .66); keyCompanionLight.position.set(-2.3, 8.5, 1.8); keyCompanionLight.castShadow = true; keyCompanionLight.shadow.mapSize.set(1024, 1024); Object.assign(keyCompanionLight.shadow.camera, { left: -7, right: 7, top: 5, bottom: -4, near: .1, far: 24 }); keyCompanionLight.shadow.bias = -.0001; keyCompanionLight.shadow.normalBias = .0055; keyCompanionLight.shadow.radius = 3.4; keyCompanionLight.shadow.blurSamples = 6; keyCompanionLight.shadow.autoUpdate = false; keyCompanionLight.shadow.needsUpdate = true; scene.add(keyCompanionLight);
    const fill = new T.DirectionalLight(0xeaf0f4, .22); fill.position.set(5.8, 7.0, -3.4); scene.add(fill);

    flashlightTarget = new T.Object3D(); scene.add(flashlightTarget);
    flashlight = new T.SpotLight(0xf6fbff, 0, 0, T.MathUtils.degToRad(2.0), .94, 0); flashlight.position.set(0, 9.8, 2.2); flashlight.target = flashlightTarget; flashlight.castShadow = false; scene.add(flashlight);
    const beamVert = `varying vec3 vPos;varying vec3 vNormalV;void main(){vPos=position;vNormalV=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
    const beamFrag = `uniform vec3 uColor;uniform float uOpacity;varying vec3 vPos;varying vec3 vNormalV;void main(){float h=clamp(.5-vPos.y,0.,1.);float vertical=smoothstep(.015,.18,h)*(1.-smoothstep(.80,.995,h));float facing=.46+.54*(1.-abs(vNormalV.z));float alpha=uOpacity*vertical*facing;gl_FragColor=vec4(uColor,alpha);}`;
    const beamMaterial = (color) => new T.ShaderMaterial({ uniforms: { uColor: { value: new T.Color(color) }, uOpacity: { value: 0 } }, vertexShader: beamVert, fragmentShader: beamFrag, transparent: true, depthWrite: false, depthTest: true, blending: T.AdditiveBlending, side: T.DoubleSide });
    beamHalo = new T.Mesh(new T.ConeGeometry(1, 1, 24, 1, true), beamMaterial(0xe9f3fb)); beamHalo.renderOrder = 1; scene.add(beamHalo);
    const dustCount = 22, dustPos = new Float32Array(dustCount * 3), dustSeed = new Float32Array(dustCount);
    for (let i = 0; i < dustCount; i++) { const h = Math.random(), a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * h * .92; dustPos[i*3] = Math.cos(a) * r; dustPos[i*3+1] = .5 - h; dustPos[i*3+2] = Math.sin(a) * r; dustSeed[i] = Math.random(); }
    const dustGeom = new T.BufferGeometry(); dustGeom.setAttribute('position', new T.BufferAttribute(dustPos, 3)); dustGeom.setAttribute('aSeed', new T.BufferAttribute(dustSeed, 1));
    const dustMat = new T.ShaderMaterial({ uniforms: { uOpacity: { value: 0 }, uTime: { value: 0 }, uColor: { value: new T.Color(0xf1f8fd) } }, vertexShader: `attribute float aSeed;uniform float uTime;varying float vSeed;void main(){vSeed=aSeed;vec3 p=position;p.y+=sin(uTime*.55+aSeed*18.)*.009;vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=(1.0+aSeed*1.7)*(20./max(1.,-mv.z));gl_Position=projectionMatrix*mv;}`, fragmentShader: `uniform float uOpacity;uniform vec3 uColor;varying float vSeed;void main(){float d=length(gl_PointCoord-.5);float soft=1.-smoothstep(.12,.5,d);float twinkle=.55+.45*sin(vSeed*31.);gl_FragColor=vec4(uColor,uOpacity*soft*twinkle);}`, transparent: true, depthWrite: false, depthTest: true, blending: T.AdditiveBlending });
    beamParticles = new T.Points(dustGeom, dustMat); beamParticles.renderOrder = 3; scene.add(beamParticles);

    floorReflection = createFloorReflection(renderer, scene, ground);
    runtime = createFrameRuntime(drawFrame);
    runtime.add(updateScene);
    liquidHeader = createLiquidHeader({ renderer, camera, floorReflection, runtime });
    liquidPanels = createLiquidPanels({ renderer, runtime });

    const [linenColor, linenRough, paperColor, steelRough] = await Promise.all([loadTexture(loader, 'linen-color.png', 3), loadTexture(loader, 'linen-rough.png', 3), loadTexture(loader, 'paper-color.png', 2), loadTexture(loader, 'steel-rough.png')]);
    for (const t of [linenColor, paperColor]) { t.colorSpace = T.SRGBColorSpace; t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); }

    models = createModels({ linen, paper, print, linenNormal, paperNormal, paperRough, linenColor, linenRough, paperColor, steelRough, writingPaperColor, writingPaperNormal, writingPaperRough, archMarbleColor, archMarbleNormal, archMarbleRough, archMetalColor, archMetalNormal, archMetalRough, archPlasticRough });
    models.forEach((m, i) => {
      const f = HOME_TRANSFORMS[i]; m.scale.set(f[2], f[3], f[5]);
      const root = new T.Group(); root.add(m); root.position.set(f[0], 0, f[1]); root.rotation.y = f[4];
      if (i === 0 && m.userData.writingController) { writingController = m.userData.writingController; applyWritingMaterialReveal(writingController, 0); }
      models[i] = root; home.push({ x: f[0], z: f[1], r: f[4] }); scene.add(root);
    });
    hoverProfiles = models.map(m => { const box = new T.Box3().setFromObject(m), center = new T.Vector3(), size = new T.Vector3(); box.getCenter(center); box.getSize(size); const horizontal = Math.max(size.x, size.z) * .54 + .18, approxDist = Math.max(4.7, 9.8 - center.y); return { x: center.x, y: center.y, z: center.z, angle: T.MathUtils.clamp(Math.atan(horizontal / approxDist) * 1.02, T.MathUtils.degToRad(4.9), T.MathUtils.degToRad(9.4)) }; });

    bindUI(); bindSceneInput(); layout(false); readHash(false);

    // Trionn-style warm-up: compile shaders and upload resources before the first settled interaction.
    renderer.compile(scene, camera);
    markStaticShadowsDirty();
    floorReflection.update(camera);
    drawFrame({ reflection: false });
    runtime.renderWithReflection();

    document.fonts.ready.then(() => { liquidHeader?.syncLayout(); liquidPanels?.syncLayout(); runtime.renderWithReflection(); });
    const idle = globalThis.requestIdleCallback || ((fn) => setTimeout(fn, 50));
    idle(() => { renderer.compile(scene, camera); runtime.render(); }, { timeout: 400 });
  } catch (e) {
    console.error(e);
    $('#failure').hidden = false;
    try { readHash(false); } catch {}
  }
}

init();
