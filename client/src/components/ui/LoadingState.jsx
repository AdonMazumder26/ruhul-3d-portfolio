export function LoadingState({ label = 'Loading…', lines = 3 }) {
  return (
    <div role="status" aria-live="polite" className="card p-6">
      <p className="sr-only">{label}</p>
      <div aria-hidden="true" className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="h-3 rounded bg-elevated animate-pulse"
            style={{ width: `${90 - index * 18}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export function ProjectCardSkeleton() {
  return (
    <div aria-hidden="true" className="card p-6 animate-pulse">
      <div className="h-3 w-24 rounded bg-elevated" />
      <div className="mt-5 h-5 w-2/3 rounded bg-elevated" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded bg-elevated" />
        <div className="h-3 w-5/6 rounded bg-elevated" />
      </div>
      <div className="mt-6 flex gap-2">
        <div className="h-5 w-14 rounded bg-elevated" />
        <div className="h-5 w-16 rounded bg-elevated" />
        <div className="h-5 w-12 rounded bg-elevated" />
      </div>
    </div>
  )
}
