/**
 * Lightweight CSS alternative to the 3D hero scene. Used while the scene
 * chunk loads, when WebGL is unavailable, on constrained devices, and when
 * the visitor prefers reduced motion. Echoes the particle cloud with a
 * handful of soft, static dots.
 */

// Deterministic scatter so the dots don't jump between renders.
const DOTS = Array.from({ length: 42 }, (_, i) => {
  const angle = i * 2.399963 // golden angle
  const r = 0.25 + ((i * 37) % 100) / 100 * 0.75
  return {
    x: 50 + Math.cos(angle) * r * 44,
    y: 50 + Math.sin(angle) * r * 44,
    size: 3 + ((i * 13) % 5),
    alt: i % 3 === 0,
    delay: (i % 7) * 0.4,
  }
})

export function SceneFallback({ loading = false, className = '' }) {
  return (
    <div aria-hidden="true" className={`relative grid h-full w-full place-items-center overflow-hidden ${className}`}>
      <div className="absolute inset-0 grid-fade opacity-50" />
      <div className={`relative size-56 sm:size-72 lg:size-80 ${loading ? 'opacity-60' : ''} fallback-float`}>
        <div className="fallback-orb absolute inset-[18%] rounded-full" />
        {DOTS.map((dot, index) => (
          <span
            key={index}
            className={`fallback-dot absolute rounded-full ${dot.alt ? 'bg-orange shadow-[0_0_10px_var(--color-orange)]' : 'bg-cyan shadow-[0_0_10px_var(--color-cyan)]'}`}
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              width: dot.size,
              height: dot.size,
              animationDelay: `${dot.delay}s`,
            }}
          />
        ))}
      </div>
      {loading ? (
        <p className="absolute bottom-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Loading scene</p>
      ) : null}
    </div>
  )
}
