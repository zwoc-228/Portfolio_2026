import { Environment, Lightformer } from '@react-three/drei'

/**
 * Direct lights do ONE job: grounding (cast shadows + contact).
 * Material appearance / reflection shape comes from StudioEnvironment
 * (Lightformer cards rendered once into the env map, frames=1).
 * No ambient / hemisphere — they flattened material contrast.
 */
export default function Lighting() {
  return (
    <>
      {/* Key light - large soft from upper-left (primary shadows) */}
      <directionalLight
        position={[-4, 7, 5]}
        intensity={1.5}
        color="#f8f6f2"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.001}
        shadow-normalBias={0.02}
      />
      {/* Fill light - weak from right */}
      <directionalLight
        position={[4, 4, 3]}
        intensity={0.18}
        color="#eef1f4"
      />
    </>
  )
}

/**
 * Reflection-controlled product-photography studio.
 * For reflective materials the SHAPE of the light source is the texture:
 * acrylic and brushed metal become beautiful because they reflect
 * well-designed cards — never via exposure/envIntensity cranking.
 *
 * Static (frames=1, resolution=256): rendered once, ~free at runtime.
 * scene.environmentRotation (?envrot=) still applies on top.
 */
export function StudioEnvironment() {
  return (
    <Environment resolution={256} frames={1}>
      {/* Base: dim neutral room so shadows never crush */}
      <color attach="background" args={['#3a3d40']} />
      {/* A. VERY LARGE vertical softbox, camera-left.
          Broad bright brushed-metal reflection on floor-left. */}
      <Lightformer
        form="rect"
        intensity={3.2}
        color="#fdfbf7"
        position={[-5, 2.5, 2]}
        rotation-y={Math.PI / 2}
        scale={[4, 6, 1]}
      />
      {/* B. LARGE overhead/front softbox.
          Book cover, paper, model-board highlights. */}
      <Lightformer
        form="rect"
        intensity={2.0}
        color="#ffffff"
        position={[0.5, 5, 3]}
        rotation-x={Math.PI / 2}
        scale={[6, 4, 1]}
      />
      {/* C. LONG narrow reflection strip.
          Acrylic edge definition. */}
      <Lightformer
        form="rect"
        intensity={4.0}
        color="#ffffff"
        position={[2.5, 2, -1]}
        rotation-y={-Math.PI / 3}
        scale={[0.6, 4, 1]}
      />
      {/* D. SMALL rear/right kicker.
          Separates transparent / translucent pieces. */}
      <Lightformer
        form="rect"
        intensity={1.2}
        color="#eef1f4"
        position={[4, 1.5, -2.5]}
        rotation-y={-Math.PI / 2}
        scale={[1.5, 1.5, 1]}
      />
      {/* E. Dark flag card — readable dark edges in clear acrylic. */}
      <Lightformer
        form="rect"
        intensity={0.35}
        color="#141619"
        position={[-1, 2, -5]}
        scale={[5, 2, 1]}
      />
    </Environment>
  )
}
