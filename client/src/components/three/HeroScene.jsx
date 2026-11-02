import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Html, Stars, useCursor } from '@react-three/drei'
import * as THREE from 'three'

const DEFAULT_COLORS = {
  surface: '#202633',
  cyan: '#67e8f9',
  orange: '#ff9d65',
  muted: '#a1a8b5',
  bg: '#0b0d12',
}

const SATELLITE_SHAPES = ['octahedron', 'box', 'dodecahedron']

function Planet({ detail, colors }) {
  const wire = useRef()
  useFrame((_, delta) => {
    if (wire.current) wire.current.rotation.y += delta * 0.04
  })
  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[1.45, detail]} />
        <meshStandardMaterial color="#3b465a" emissive="#0d1f27" roughness={0.5} metalness={0.2} flatShading />
      </mesh>
      <mesh ref={wire} scale={1.035}>
        <icosahedronGeometry args={[1.45, 1]} />
        <meshBasicMaterial color={colors.cyan} wireframe transparent opacity={0.12} />
      </mesh>
      <mesh scale={1.18}>
        <sphereGeometry args={[1.45, 32, 32]} />
        <meshBasicMaterial color={colors.cyan} transparent opacity={0.045} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  )
}

function OrbitRing({ radius, color, tilt, opacity = 0.55 }) {
  return (
    <mesh rotation={tilt}>
      <torusGeometry args={[radius, 0.008, 8, 160]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  )
}

/** Small seeded PRNG so geometry is stable across re-renders (and pure). */
function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function DustRing({ count, radius, color }) {
  const positions = useMemo(() => {
    const random = mulberry32(count * 31 + Math.round(radius * 100))
    const array = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      const angle = random() * Math.PI * 2
      const r = radius + (random() - 0.5) * 0.9
      array[i * 3] = Math.cos(angle) * r
      array[i * 3 + 1] = (random() - 0.5) * 0.12
      array[i * 3 + 2] = Math.sin(angle) * r
    }
    return array
  }, [count, radius])

  const ref = useRef()
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y -= delta * 0.03
  })

  return (
    <points ref={ref} rotation={[0.42, 0, 0.18]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.022} sizeAttenuation transparent opacity={0.7} depthWrite={false} />
    </points>
  )
}

function SatelliteShape({ shape }) {
  if (shape === 'box') return <boxGeometry args={[0.26, 0.26, 0.26]} />
  if (shape === 'dodecahedron') return <dodecahedronGeometry args={[0.18, 0]} />
  return <octahedronGeometry args={[0.2, 0]} />
}

function Satellite({ project, index, total, radius, tilt, onSelect, speed, colors }) {
  const group = useRef()
  const mesh = useRef()
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  const offset = (index / total) * Math.PI * 2
  const accent = index % 2 === 0 ? colors.cyan : colors.orange

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime() * speed + offset
    if (group.current) {
      group.current.position.set(Math.cos(t) * radius, 0, Math.sin(t) * radius)
    }
    if (mesh.current) {
      mesh.current.rotation.x += delta * 0.6
      mesh.current.rotation.y += delta * 0.4
      const target = hovered ? 1.45 : 1
      mesh.current.scale.setScalar(THREE.MathUtils.lerp(mesh.current.scale.x, target, 0.15))
    }
  })

  return (
    <group rotation={tilt}>
      <group ref={group}>
        <mesh
          ref={mesh}
          onPointerOver={(event) => {
            event.stopPropagation()
            setHovered(true)
          }}
          onPointerOut={() => setHovered(false)}
          onClick={(event) => {
            event.stopPropagation()
            onSelect?.(project.slug)
          }}
        >
          <SatelliteShape shape={SATELLITE_SHAPES[index % SATELLITE_SHAPES.length]} />
          <meshStandardMaterial
            color={hovered ? accent : '#2b3444'}
            emissive={accent}
            emissiveIntensity={hovered ? 0.9 : 0.25}
            roughness={0.4}
            metalness={0.5}
            flatShading
          />
        </mesh>
        {hovered ? (
          <Html center distanceFactor={9} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
            <div className="whitespace-nowrap rounded-md border border-border bg-bg/90 px-2.5 py-1.5 font-mono text-[11px] text-text shadow-lg backdrop-blur">
              <span className="text-cyan">→</span> {project.title}
            </div>
          </Html>
        ) : null}
      </group>
    </group>
  )
}

function Rig({ children, parallax }) {
  const ref = useRef()
  useFrame((state, delta) => {
    if (!ref.current) return
    const targetX = parallax ? state.pointer.y * -0.14 : 0
    const targetY = parallax ? state.pointer.x * 0.22 : 0
    ref.current.rotation.x = THREE.MathUtils.damp(ref.current.rotation.x, targetX, 3, delta)
    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, targetY + state.clock.elapsedTime * 0.02, 3, delta)
  })
  return <group ref={ref}>{children}</group>
}

function Scene({ projects, tier, onSelectProject, compact, colors, stars, satellites }) {
  const detail = tier === 'high' ? 2 : 1
  const starCount = !stars ? 0 : tier === 'high' ? 1400 : tier === 'medium' ? 700 : 0
  const dustCount = tier === 'high' ? 520 : 260
  const orbitTilt = [0.42, 0, 0.18]
  const outerTilt = [0.62, 0.3, -0.25]
  const scale = compact ? 0.78 : 1

  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#9fd9e6', colors.bg, 0.5]} />
      <directionalLight position={[3, 4, 6]} intensity={3} color="#dffbff" />
      <pointLight position={[-5, -3, -2]} intensity={18} color={colors.orange} distance={14} />
      {starCount > 0 ? <Stars radius={60} depth={40} count={starCount} factor={3} saturation={0} fade speed={0.35} /> : null}

      <Rig parallax={tier !== 'low'}>
        <Float speed={1.1} rotationIntensity={0.15} floatIntensity={0.35}>
          <group scale={scale}>
            <Planet detail={detail} colors={colors} />
            <OrbitRing radius={2.5} color={colors.cyan} tilt={orbitTilt} />
            <OrbitRing radius={3.3} color={colors.orange} tilt={outerTilt} opacity={0.28} />
            <DustRing count={dustCount} radius={2.5} color={colors.muted} />
            {satellites
              ? projects.map((project, index) => (
                  <Satellite
                    key={project.slug}
                    project={project}
                    index={index}
                    total={projects.length}
                    radius={index === 1 ? 3.3 : 2.5}
                    tilt={index === 1 ? outerTilt : orbitTilt}
                    speed={index === 1 ? 0.14 : 0.2}
                    onSelect={onSelectProject}
                    colors={colors}
                  />
                ))
              : null}
          </group>
        </Float>
      </Rig>
    </>
  )
}

/**
 * Hero scene: a stylized digital planet with orbit rings and one satellite per
 * featured project. Satellites are clickable landmarks; the same projects are
 * always available as HTML in the Projects section.
 */
export default function HeroScene({
  projects = [],
  tier = 'high',
  active = true,
  compact = false,
  colors: colorOverrides,
  stars = true,
  satellites = true,
  onSelectProject,
  onReady,
  onError,
}) {
  const colors = useMemo(() => ({ ...DEFAULT_COLORS, ...(colorOverrides ?? {}) }), [colorOverrides])
  return (
    <Canvas
      dpr={[1, tier === 'high' ? 1.6 : 1.25]}
      camera={{ position: [0, 0.5, compact ? 8.2 : 7.4], fov: 40 }}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: tier !== 'low', alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0)
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          event.preventDefault()
          onError?.(new Error('WebGL context lost'))
        })
        onReady?.()
      }}
      style={{ touchAction: 'pan-y' }}
      aria-hidden="true"
      tabIndex={-1}
    >
      <Scene
        projects={projects}
        tier={tier}
        compact={compact}
        colors={colors}
        stars={stars}
        satellites={satellites}
        onSelectProject={onSelectProject}
      />
    </Canvas>
  )
}
