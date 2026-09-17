export default function Lighting() {
  return (
    <>
      {/* Key light - large soft from upper-left */}
      <directionalLight
        position={[-4, 6, 4]}
        intensity={2.0}
        color="#f5f2ee"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.001}
      />
      {/* Fill light - weak from right */}
      <directionalLight
        position={[3, 4, 3]}
        intensity={0.7}
        color="#eef0f2"
      />
      {/* Ambient base */}
      <ambientLight intensity={0.6} color="#eaecf0" />
      {/* Hemisphere for sky/ground bounce */}
      <hemisphereLight
        color="#eef0f2"
        groundColor="#c0c4c8"
        intensity={0.5}
      />
    </>
  )
}
