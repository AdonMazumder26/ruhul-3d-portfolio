import { useEffect, useMemo, useRef } from 'react'
import { perlin3 } from '../../lib/noise.js'
import { useInView } from '../../hooks/useInView.js'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'
import { useTheme } from '../theme/themeContext.js'

const NOISE_SCALE = 0.0032
const TIME_SCALE = 0.12
const STREAKS_DESKTOP = 170
const STREAKS_MOBILE = 90

const hexToRgb = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16)
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`
}

function flatten(groups) {
  return groups.flatMap((group) =>
    group.skills.map((skill) => ({
      id: `${group.id}:${skill.name}`,
      name: skill.name,
      note: skill.note,
      groupId: group.id,
      tone: group.color === 'orange' ? 'orange' : 'cyan',
    })),
  )
}

/** Static layout for reduced motion / no JS animation: tidy clusters per category. */
function StaticField({ groups, activeGroup, onHover }) {
  return (
    <div className="absolute inset-0 flex flex-wrap content-center items-center justify-center gap-x-6 gap-y-5 p-6">
      {groups.map((group) => {
        const muted = activeGroup && activeGroup !== group.id
        return (
          <div key={group.id} className={`flex max-w-[260px] flex-wrap justify-center gap-2 transition-opacity ${muted ? 'opacity-30' : ''}`}>
            {group.skills.map((skill) => (
              <button
                key={skill.name}
                type="button"
                className={`skill-chip skill-chip--${group.color === 'orange' ? 'orange' : 'cyan'}`}
                onMouseEnter={() => onHover?.(skill)}
                onMouseLeave={() => onHover?.(null)}
                onFocus={() => onHover?.(skill)}
                onBlur={() => onHover?.(null)}
              >
                {skill.name}
              </button>
            ))}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Skill chips drifting along a Perlin-noise flow field over a canvas of soft
 * streaks. Selecting a category pulls its chips into a cluster at the centre
 * and parks the rest around the edge.
 */
export function SkillsFlowField({ groups, activeGroup, onHover }) {
  const reduced = usePrefersReducedMotion()
  const { theme } = useTheme()
  const chips = useMemo(() => flatten(groups), [groups])
  const [containerRef, inView] = useInView({ rootMargin: '120px' })
  const canvasRef = useRef(null)
  const chipRefs = useRef(new Map())
  const activeRef = useRef(activeGroup)
  const hoveredRef = useRef(null)
  const layerRef = useRef(null)
  const animated = !reduced && theme.skills.animated

  useEffect(() => {
    activeRef.current = activeGroup
  }, [activeGroup])

  // Colour palette for the canvas, refreshed when the theme changes.
  const palette = useMemo(
    () => ({
      surface: theme.colors.surface,
      cyan: hexToRgb(theme.colors.accent),
      orange: hexToRgb(theme.colors.accentAlt),
    }),
    [theme.colors],
  )
  const paletteRef = useRef(palette)
  useEffect(() => {
    paletteRef.current = palette
  }, [palette])

  useEffect(() => {
    if (!animated) return undefined
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return undefined
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    let width = 0
    let height = 0
    let dpr = 1
    let raf = 0
    let last = performance.now()
    let time = 0

    const bodies = chips.map((chip, index) => ({
      chip,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      w: 90,
      h: 32,
      seed: (index * 0.618033988749895) % 1,
    }))
    const streaks = []

    const resize = () => {
      const rect = container.getBoundingClientRect()
      const first = width === 0
      width = rect.width
      height = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = paletteRef.current.surface
      ctx.fillRect(0, 0, width, height)

      const count = width < 640 ? STREAKS_MOBILE : STREAKS_DESKTOP
      streaks.length = 0
      for (let i = 0; i < count; i += 1) {
        streaks.push({ x: Math.random() * width, y: Math.random() * height, life: Math.random() * 200, alt: i % 3 === 0 })
      }
      if (first) {
        bodies.forEach((body) => {
          body.x = width * (0.15 + body.seed * 0.7)
          body.y = height * (0.15 + ((body.seed * 7.31) % 1) * 0.7)
        })
      } else {
        bodies.forEach((body) => {
          body.x = Math.min(Math.max(body.x, 40), width - 40)
          body.y = Math.min(Math.max(body.y, 24), height - 24)
        })
      }
    }

    const measure = () => {
      bodies.forEach((body) => {
        const el = chipRefs.current.get(body.chip.id)
        if (el) {
          body.w = el.offsetWidth || body.w
          body.h = el.offsetHeight || body.h
        }
      })
    }

    const flowAngle = (x, y) => perlin3(x * NOISE_SCALE, y * NOISE_SCALE, time * TIME_SCALE) * Math.PI * 2.2

    const drawStreaks = () => {
      const { surface, cyan, orange } = paletteRef.current
      ctx.globalCompositeOperation = 'source-over'
      // Fade previous frame slightly so streaks leave soft trails.
      ctx.fillStyle = surface
      ctx.globalAlpha = 0.085
      ctx.fillRect(0, 0, width, height)
      ctx.globalAlpha = 1
      ctx.lineWidth = 1.1
      ctx.lineCap = 'round'
      for (const s of streaks) {
        const angle = flowAngle(s.x, s.y)
        const nx = s.x + Math.cos(angle) * 1.6
        const ny = s.y + Math.sin(angle) * 1.6
        ctx.strokeStyle = `rgba(${s.alt ? orange : cyan}, 0.32)`
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(nx, ny)
        ctx.stroke()
        s.x = nx
        s.y = ny
        s.life -= 1
        if (s.life <= 0 || s.x < -4 || s.x > width + 4 || s.y < -4 || s.y > height + 4) {
          s.x = Math.random() * width
          s.y = Math.random() * height
          s.life = 120 + Math.random() * 220
        }
      }
    }

    const stepBodies = (dt) => {
      const active = activeRef.current
      const cx = width / 2
      const cy = height / 2
      const activeBodies = active ? bodies.filter((b) => b.chip.groupId === active) : []
      const clusterRadius = Math.min(width, height) * (activeBodies.length > 3 ? 0.24 : 0.16)

      bodies.forEach((body) => {
        if (hoveredRef.current === body.chip.id) {
          body.vx *= 0.6
          body.vy *= 0.6
          return
        }
        let ax = 0
        let ay = 0

        if (active) {
          let tx
          let ty
          if (body.chip.groupId === active) {
            const index = activeBodies.indexOf(body)
            const angle = (index / activeBodies.length) * Math.PI * 2 - Math.PI / 2 + time * 0.12
            tx = cx + Math.cos(angle) * clusterRadius
            ty = cy + Math.sin(angle) * clusterRadius * 0.78
          } else {
            const dx = body.x - cx || 0.01
            const dy = body.y - cy || 0.01
            const len = Math.hypot(dx, dy)
            const edge = Math.min(width, height) * 0.46
            tx = cx + (dx / len) * edge
            ty = cy + (dy / len) * edge * 0.9
          }
          ax += (tx - body.x) * 4.5
          ay += (ty - body.y) * 4.5
        } else {
          const angle = flowAngle(body.x, body.y)
          ax += Math.cos(angle) * 55
          ay += Math.sin(angle) * 55
          // Soft pull back toward the middle so chips never pile at the edges.
          ax += (cx - body.x) * 0.35
          ay += (cy - body.y) * 0.35
        }

        // Separation.
        for (const other of bodies) {
          if (other === body) continue
          const dx = body.x - other.x
          const dy = body.y - other.y
          const minX = (body.w + other.w) / 2 + 10
          const minY = (body.h + other.h) / 2 + 8
          if (Math.abs(dx) < minX && Math.abs(dy) < minY) {
            const push = 1 - Math.max(Math.abs(dx) / minX, Math.abs(dy) / minY)
            ax += (dx || 0.5) * push * 18
            ay += (dy || 0.5) * push * 26
          }
        }

        body.vx = (body.vx + ax * dt) * (active ? 0.86 : 0.92)
        body.vy = (body.vy + ay * dt) * (active ? 0.86 : 0.92)
        const speed = Math.hypot(body.vx, body.vy)
        const max = active ? 320 : 42
        if (speed > max) {
          body.vx = (body.vx / speed) * max
          body.vy = (body.vy / speed) * max
        }
        body.x += body.vx * dt
        body.y += body.vy * dt

        const padX = body.w / 2 + 6
        const padY = body.h / 2 + 6
        if (body.x < padX) {
          body.x = padX
          body.vx = Math.abs(body.vx) * 0.5
        } else if (body.x > width - padX) {
          body.x = width - padX
          body.vx = -Math.abs(body.vx) * 0.5
        }
        if (body.y < padY) {
          body.y = padY
          body.vy = Math.abs(body.vy) * 0.5
        } else if (body.y > height - padY) {
          body.y = height - padY
          body.vy = -Math.abs(body.vy) * 0.5
        }
      })
    }

    const render = () => {
      bodies.forEach((body) => {
        const el = chipRefs.current.get(body.chip.id)
        if (el) el.style.transform = `translate3d(${body.x.toFixed(1)}px, ${body.y.toFixed(1)}px, 0) translate(-50%, -50%)`
      })
    }

    let frame = 0
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      time += dt
      if (frame % 90 === 0) measure()
      frame += 1
      drawStreaks()
      stepBodies(dt)
      render()
      raf = requestAnimationFrame(loop)
    }

    resize()
    measure()
    render()
    if (layerRef.current) layerRef.current.style.opacity = '1'
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
    // `inView` restarts the loop when the panel scrolls back into view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated, chips, inView])

  const activeLabel = groups.find((group) => group.id === activeGroup)?.label

  const hoverHandlers = (chip) => ({
    onMouseEnter: () => {
      hoveredRef.current = chip.id
      onHover?.(chip)
    },
    onMouseLeave: () => {
      hoveredRef.current = null
      onHover?.(null)
    },
    onFocus: () => {
      hoveredRef.current = chip.id
      onHover?.(chip)
    },
    onBlur: () => {
      hoveredRef.current = null
      onHover?.(null)
    },
  })

  return (
    <div
      ref={containerRef}
      className="card relative h-[340px] overflow-hidden sm:h-[420px] lg:sticky lg:top-24 lg:h-[540px]"
      role="group"
      aria-label="Skills"
    >
      {animated ? (
        <>
          <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,var(--color-surface)_100%)]" />
          {activeLabel ? (
            <p
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 grid place-items-center font-display text-5xl font-semibold uppercase tracking-[0.25em] text-text/[0.06] sm:text-7xl"
            >
              {activeLabel}
            </p>
          ) : null}
          <div ref={layerRef} className="absolute inset-0 opacity-0 transition-opacity duration-700">
            {chips.map((chip) => {
              const dimmed = activeGroup && chip.groupId !== activeGroup
              return (
                <button
                  key={chip.id}
                  type="button"
                  ref={(node) => {
                    if (node) chipRefs.current.set(chip.id, node)
                    else chipRefs.current.delete(chip.id)
                  }}
                  className={`skill-chip skill-chip--${chip.tone} absolute left-0 top-0 will-change-transform ${dimmed ? 'skill-chip--dim' : ''}`}
                  style={{ transform: 'translate3d(-200px,-200px,0)' }}
                  aria-label={`${chip.name}: ${chip.note}`}
                  {...hoverHandlers(chip)}
                >
                  {chip.name}
                </button>
              )
            })}
          </div>
        </>
      ) : (
        <>
          <div aria-hidden="true" className="absolute inset-0 grid-fade opacity-40" />
          <StaticField groups={groups} activeGroup={activeGroup} onHover={onHover} />
        </>
      )}
      <p className="pointer-events-none absolute bottom-3 left-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
        {animated ? 'Hover a skill · pick a category' : 'Skill map'}
      </p>
    </div>
  )
}
