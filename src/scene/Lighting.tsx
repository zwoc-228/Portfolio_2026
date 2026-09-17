/**
 * Simplified studio: one soft key + weak fill + HDRI environment.
 * Ambient and hemisphere removed — they were flattening material contrast.
 * R3F r155+ uses physically-correct lighting units by default, so these
 * modest intensities are intentional, not dim.
 */
export default function Lighting() {
  return (
    <>
      {/* Key light - large soft from upper-left */}
      <directionalLight
        position={[-4, 7, 5]}
        intensity={0.9}
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
        intensity={0.2}
        color="#eef1f4"
      />
    </>
  )
}
