export default function InfinitePlane() {
  return (
    <group>
      {/* Main floor - matte brushed aluminum */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial
          color="#d5d6d4"
          metalness={0.72}
          roughness={0.8}
          envMapIntensity={2.4}
        />
      </mesh>
    </group>
  )
}
