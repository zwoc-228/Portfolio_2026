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
          color="#cfd2d4"
          metalness={0.82}
          roughness={0.62}
          envMapIntensity={2.0}
        />
      </mesh>
    </group>
  )
}
