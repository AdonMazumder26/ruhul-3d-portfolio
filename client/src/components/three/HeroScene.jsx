import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, Stars, useCursor } from '@react-three/drei'
import * as THREE from 'three'
import { buildShapes, GLYPH_SHAPES, SHAPE_ORDER } from './particleShapes.js'

const DEFAULT_COLORS = {
  cyan: '#67e8f9',
  orange: '#ff9d65',
  muted: '#a1a8b5',
  bg: '#0b0d12',
}

// Timing (seconds). "Lively": short holds, snappy morphs, visible twinkle.
const HOLD = 4.2
const MORPH = 2.4

const vertexShader = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute float aSeed;
  varying float vSeed;
  varying float vAlpha;

  // Smooth, slightly overshooting ease so the cloud "breathes" into shape.
  float ease(float t) {
    float s = 1.70158 * 0.35;
    t = clamp(t, 0.0, 1.0);
    return t < 0.5
      ? 0.5 * (4.0 * t * t * t)
      : 0.5 * ((2.0 * t - 2.0) * (2.0 * t - 2.0) * ((s + 1.0) * (2.0 * t - 2.0) + s) + 2.0);
  }

  void main() {
    vSeed = aSeed;
    // Stagger per-point so the morph sweeps through the cloud instead of snapping.
    float local = ease(clamp(uProgress * 1.35 - aSeed * 0.35, 0.0, 1.0));
    vec3 pos = mix(aFrom, aTo, local);

    // Mid-morph scatter: points swirl outward then settle.
    float scatter = sin(local * 3.14159);
    pos += normalize(pos + 0.0001) * scatter * (0.35 + aSeed * 0.45);

    // Gentle idle drift.
    pos.x += sin(uTime * 0.6 + aSeed * 12.0) * 0.025;
    pos.y += cos(uTime * 0.5 + aSeed * 9.0) * 0.025;
    pos.z += sin(uTime * 0.4 + aSeed * 7.0) * 0.025;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    float twinkle = 0.65 + 0.35 * sin(uTime * (1.5 + aSeed * 2.5) + aSeed * 40.0);
    gl_PointSize = uSize * uPixelRatio * twinkle * (8.0 / -mv.z);
    vAlpha = twinkle * (0.55 + 0.45 * (1.0 - scatter));
    gl_Position = projectionMatrix * mv;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vSeed;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float glow = smoothstep(0.5, 0.0, d);
    glow = pow(glow, 1.6);
    vec3 color = mix(uColorA, uColorB, smoothstep(0.35, 0.8, vSeed));
    gl_FragColor = vec4(color, glow * vAlpha);
  }
`

function ParticleCloud({ count, colors, initials }) {
  const material = useRef()
  const geometry = useRef()
  const spinGroup = useRef()
  const state = useRef({ index: 0, progress: 0, holding: HOLD * 0.5, spin: 0 })

  const shapes = useMemo(() => buildShapes(count, initials), [count, initials])

  const { from, to, seeds } = useMemo(() => {
    const seeds = new Float32Array(count)
    for (let i = 0; i < count; i += 1) seeds[i] = (i * 0.618033988749895) % 1
    return {
      from: Float32Array.from(shapes[SHAPE_ORDER[0]]),
      to: Float32Array.from(shapes[SHAPE_ORDER[1]]),
      seeds,
    }
  }, [count, shapes])

  // Created once; mutated only inside useFrame so the shader never recompiles.
  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uSize: { value: 2.1 },
      uColorA: { value: new THREE.Color() },
      uColorB: { value: new THREE.Color() },
    }),
    [],
  )

  const dpr = useThree((s) => s.viewport.dpr)

  useFrame((_, delta) => {
    const s = state.current
    // Go through the material ref: these objects are mutated per frame by design.
    const uniforms = material.current?.uniforms
    if (!uniforms || !geometry.current) return
    uniforms.uTime.value += delta
    uniforms.uPixelRatio.value = dpr
    // Theme colours can change at runtime; Color.set on equal strings is cheap.
    uniforms.uColorA.value.set(colors.cyan)
    uniforms.uColorB.value.set(colors.orange)

    // Volumetric shapes spin slowly; glyphs settle face-on so they can be read.
    const textPhase = GLYPH_SHAPES.has(SHAPE_ORDER[s.index]) || (s.progress > 0 && GLYPH_SHAPES.has(SHAPE_ORDER[(s.index + 1) % SHAPE_ORDER.length]))
    if (textPhase) {
      s.spin = ((s.spin + Math.PI) % (Math.PI * 2)) - Math.PI
      s.spin = THREE.MathUtils.damp(s.spin, 0, 1.5, delta)
    } else {
      s.spin += delta * 0.18
    }
    if (spinGroup.current) spinGroup.current.rotation.y = s.spin

    if (s.holding > 0) {
      s.holding -= delta
      return
    }
    s.progress = Math.min(1, s.progress + delta / MORPH)
    uniforms.uProgress.value = s.progress

    if (s.progress >= 1) {
      // Advance: current "to" becomes "from", next shape becomes "to".
      s.index = (s.index + 1) % SHAPE_ORDER.length
      const next = shapes[SHAPE_ORDER[(s.index + 1) % SHAPE_ORDER.length]]
      const fromAttr = geometry.current.getAttribute('aFrom')
      const toAttr = geometry.current.getAttribute('aTo')
      fromAttr.array.set(toAttr.array)
      toAttr.array.set(next)
      fromAttr.needsUpdate = true
      toAttr.needsUpdate = true
      s.progress = 0
      uniforms.uProgress.value = 0
      s.holding = HOLD
    }
  })

  return (
    <group ref={spinGroup}>
      <points frustumCulled={false}>
      <bufferGeometry ref={geometry}>
        <bufferAttribute attach="attributes-position" args={[from, 3]} />
        <bufferAttribute attach="attributes-aFrom" args={[from, 3]} />
        <bufferAttribute attach="attributes-aTo" args={[to, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
      </points>
    </group>
  )
}

const MARKER_SHAPES = ['octahedron', 'box', 'dodecahedron']

function MarkerShape({ shape }) {
  if (shape === 'box') return <boxGeometry args={[0.24, 0.24, 0.24]} />
  if (shape === 'dodecahedron') return <dodecahedronGeometry args={[0.17, 0]} />
  return <octahedronGeometry args={[0.19, 0]} />
}

/** Clickable project marker orbiting the cloud on a tilted ring. */
function Marker({ project, index, total, radius, tilt, speed, colors, onSelect }) {
  const group = useRef()
  const mesh = useRef()
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  const offset = (index / total) * Math.PI * 2
  const accent = index % 2 === 0 ? colors.cyan : colors.orange

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime() * speed + offset
    if (group.current) group.current.position.set(Math.cos(t) * radius, Math.sin(t * 2) * 0.18, Math.sin(t) * radius)
    if (mesh.current) {
      mesh.current.rotation.x += delta * 0.6
      mesh.current.rotation.y += delta * 0.4
      mesh.current.scale.setScalar(THREE.MathUtils.lerp(mesh.current.scale.x, hovered ? 1.5 : 1, 0.15))
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
          <MarkerShape shape={MARKER_SHAPES[index % MARKER_SHAPES.length]} />
          <meshStandardMaterial
            color={hovered ? accent : '#2b3444'}
            emissive={accent}
            emissiveIntensity={hovered ? 1 : 0.35}
            roughness={0.4}
            metalness={0.5}
            flatShading
          />
        </mesh>
        <mesh scale={hovered ? 2.6 : 2}>
          <sphereGeometry args={[0.19, 12, 12]} />
          <meshBasicMaterial color={accent} transparent opacity={hovered ? 0.16 : 0.07} depthWrite={false} />
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
    const t = state.clock.elapsedTime
    // Gentle sway instead of a full spin so glyph shapes stay readable.
    const targetX = (parallax ? state.pointer.y * -0.22 : 0) + Math.sin(t * 0.35) * 0.08
    const targetY = (parallax ? state.pointer.x * 0.32 : 0) + Math.sin(t * 0.22) * 0.28
    ref.current.rotation.x = THREE.MathUtils.damp(ref.current.rotation.x, targetX, 2.5, delta)
    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, targetY, 2.5, delta)
  })
  return <group ref={ref}>{children}</group>
}

function Scene({ projects, tier, compact, colors, stars, satellites, initials, onSelectProject }) {
  const count = tier === 'high' ? 6000 : 3200
  const starCount = !stars ? 0 : tier === 'high' ? 900 : 400
  const scale = compact ? 0.8 : 1
  const ringTilt = [0.5, 0, 0.2]

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 6]} intensity={2.2} color="#dffbff" />
      <pointLight position={[-4, -2, -3]} intensity={10} color={colors.orange} distance={14} />
      {starCount > 0 ? <Stars radius={60} depth={40} count={starCount} factor={2.5} saturation={0} fade speed={0.5} /> : null}

      <Rig parallax={tier !== 'low'}>
        <group scale={scale}>
          <ParticleCloud count={count} colors={colors} initials={initials} />
          {satellites
            ? projects.map((project, index) => (
                <Marker
                  key={project.slug}
                  project={project}
                  index={index}
                  total={projects.length}
                  radius={2.9 + (index % 2) * 0.35}
                  tilt={ringTilt}
                  speed={0.16 + index * 0.02}
                  colors={colors}
                  onSelect={onSelectProject}
                />
              ))
            : null}
        </group>
      </Rig>
    </>
  )
}

/**
 * Hero scene: a cloud of glowing particles that morphs between a sphere, a
 * torus knot, a code glyph and the owner's initials, with one clickable
 * marker per featured project orbiting it.
 */
export default function HeroScene({
  projects = [],
  tier = 'high',
  active = true,
  compact = false,
  colors: colorOverrides,
  stars = true,
  satellites = true,
  initials = 'R',
  onSelectProject,
  onReady,
  onError,
}) {
  const colors = useMemo(() => ({ ...DEFAULT_COLORS, ...(colorOverrides ?? {}) }), [colorOverrides])
  return (
    <Canvas
      dpr={[1, tier === 'high' ? 1.6 : 1.25]}
      camera={{ position: [0, 0.3, compact ? 8.6 : 7.8], fov: 40 }}
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
        initials={initials}
        onSelectProject={onSelectProject}
      />
    </Canvas>
  )
}
