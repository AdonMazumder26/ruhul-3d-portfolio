/**
 * Lightweight CSS alternative to the 3D hero scene. Used while the scene
 * chunk loads, when WebGL is unavailable, on constrained devices, and when
 * the visitor prefers reduced motion.
 */
export function SceneFallback({ loading = false, className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`relative grid h-full w-full place-items-center overflow-hidden ${className}`}
      style={{ perspective: '900px' }}
    >
      <div className="absolute inset-0 grid-fade opacity-50" />
      <div className={`relative size-44 sm:size-56 lg:size-72 ${loading ? 'opacity-60' : ''} fallback-float`}>
        <div className="fallback-orb absolute inset-0 rounded-full" />
        <div className="fallback-ring absolute -inset-10 rounded-full" />
        <div className="fallback-ring fallback-ring--outer absolute -inset-16 rounded-full" />
        <span className="absolute -right-6 top-1/3 size-2.5 rounded-full bg-cyan shadow-[0_0_14px_var(--color-cyan)]" />
        <span className="absolute -left-12 bottom-1/4 size-2 rounded-full bg-orange shadow-[0_0_12px_var(--color-orange)]" />
      </div>
      {loading ? (
        <p className="absolute bottom-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Loading scene</p>
      ) : null}
    </div>
  )
}
