export default function Lighting() {
  return (
    <>
      {/* Key light - large soft from upper-left */}
      <directionalLight
        position={[-4, 7, 5]}
        intensity={1.6}
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
      />
      {/* Fill light - weak from right */}
      <directionalLight
        position={[4, 4, 3]}
        intensity={0.55}
        color="#eef1f4"
      />
      {/* Ambient base - reduced to preserve directional shading */}
      <ambientLight intensity={0.3} color="#eef1f4" />
      {/* Hemisphere for sky/ground bounce */}
      <hemisphereLight
        color="#f0f2f5"
        groundColor="#c8ccd0"
        intensity={0.3}
      />
    </>
  )
}
