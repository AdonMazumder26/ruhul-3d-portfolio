import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Line, useCursor } from '@react-three/drei'
import * as THREE from 'three'

const CYAN = '#67e8f9'
const ORANGE = '#ff9d65'
const DIM = '#3a4354'

/** Pre-compute a hub position per group and a node position per skill. */
function buildLayout(groups) {
  const hubs = groups.map((group, index) => {
    const angle = (index / groups.length) * Math.PI * 2 - Math.PI / 2
    const radius = 2.6
    const y = Math.sin(index * 1.7) * 0.5
    return {
      id: group.id,
      label: group.label,
      color: group.color === 'orange' ? ORANGE : CYAN,
      position: new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius),
      skills: group.skills.map((skill, skillIndex) => {
        const local = (skillIndex / group.skills.length) * Math.PI * 2 + index
        const r = 0.85
        return {
          name: skill.name,
          note: skill.note,
          position: new THREE.Vector3(
            Math.cos(angle) * radius + Math.cos(local) * r,
            y + Math.sin(local * 1.3) * 0.45,
            Math.sin(angle) * radius + Math.sin(local) * r,
          ),
        }
      }),
    }
  })
  return hubs
}

function SkillNode({ skill, color, emphasised, onHover }) {
  const ref = useRef()
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  const active = emphasised || hovered

  useFrame((_, delta) => {
    if (!ref.current) return
    const target = hovered ? 1.8 : emphasised ? 1.25 : 1
    ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, target, Math.min(1, delta * 8)))
  })

  return (
    <group position={skill.position}>
      <mesh
        ref={ref}
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(true)
          onHover?.(skill)
        }}
        onPointerOut={() => {
          setHovered(false)
          onHover?.(null)
        }}
      >
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial
          color={active ? color : '#8b94a6'}
          emissive={active ? color : DIM}
          emissiveIntensity={active ? 0.8 : 0.2}
          roughness={0.35}
        />
      </mesh>
      {hovered ? (
        <Html center distanceFactor={8} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
          <div className="w-max max-w-[200px] rounded-md border border-border bg-bg/95 px-2.5 py-1.5 text-left shadow-lg backdrop-blur">
            <p className="font-mono text-[11px] text-text">{skill.name}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted">{skill.note}</p>
          </div>
        </Html>
      ) : null}
    </group>
  )
}

function Cluster({ hub, emphasised, muted, onHover }) {
  const points = useMemo(() => hub.skills.map((skill) => [hub.position, skill.position]), [hub])
  const opacity = muted ? 0.12 : emphasised ? 0.75 : 0.35

  return (
    <group>
      <mesh position={hub.position}>
        <icosahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial
          color={muted ? DIM : hub.color}
          emissive={muted ? DIM : hub.color}
          emissiveIntensity={emphasised ? 0.9 : 0.35}
          flatShading
        />
      </mesh>
      {points.map(([from, to], index) => (
        <Line key={index} points={[from, to]} color={muted ? DIM : hub.color} transparent opacity={opacity} lineWidth={1} />
      ))}
      {hub.skills.map((skill) => (
        <SkillNode key={skill.name} skill={skill} color={hub.color} emphasised={emphasised && !muted} onHover={onHover} />
      ))}
    </group>
  )
}

function Constellation({ groups, activeGroup, onHover }) {
  const hubs = useMemo(() => buildLayout(groups), [groups])
  const spokes = useMemo(() => hubs.map((hub) => [new THREE.Vector3(0, 0, 0), hub.position]), [hubs])
  const rig = useRef()

  // Rotate so the active cluster faces the camera; idle-spin otherwise.
  const activeIndex = hubs.findIndex((hub) => hub.id === activeGroup)
  const targetY = activeIndex >= 0 ? -((activeIndex / hubs.length) * Math.PI * 2 - Math.PI / 2) - Math.PI / 2 : null

  useFrame((state, delta) => {
    if (!rig.current) return
    const goal = targetY ?? state.clock.elapsedTime * 0.08
    rig.current.rotation.y = THREE.MathUtils.damp(rig.current.rotation.y, goal, 2.5, delta)
    rig.current.rotation.x = THREE.MathUtils.damp(rig.current.rotation.x, 0.28 + state.pointer.y * -0.08, 3, delta)
  })

  return (
    <group ref={rig}>
      <mesh>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial color="#202633" emissive={CYAN} emissiveIntensity={0.15} roughness={0.5} metalness={0.4} flatShading />
      </mesh>
      <mesh scale={1.5}>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshBasicMaterial color={CYAN} wireframe transparent opacity={0.12} />
      </mesh>
      {spokes.map((pair, index) => (
        <Line key={index} points={pair} color={DIM} transparent opacity={0.5} lineWidth={1} />
      ))}
      {hubs.map((hub) => (
        <Cluster
          key={hub.id}
          hub={hub}
          emphasised={activeGroup === hub.id}
          muted={Boolean(activeGroup) && activeGroup !== hub.id}
          onHover={onHover}
        />
      ))}
    </group>
  )
}

export default function SkillsConstellation({ groups, activeGroup, active = true, onHover, onReady }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.6, 8.4], fov: 42 }}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0)
        onReady?.()
      }}
      style={{ touchAction: 'pan-y' }}
      aria-hidden="true"
      tabIndex={-1}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} />
      <Constellation groups={groups} activeGroup={activeGroup} onHover={onHover} />
    </Canvas>
  )
}
