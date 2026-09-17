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
          color="#cdd2d7"
          metalness={0.78}
          roughness={0.72}
        />
      </mesh>
    </group>
  )
}
