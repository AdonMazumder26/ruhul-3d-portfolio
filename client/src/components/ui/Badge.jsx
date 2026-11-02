const tones = {
  neutral: 'border-border bg-elevated/70 text-muted',
  cyan: 'border-cyan/40 bg-cyan/10 text-cyan',
  orange: 'border-orange/40 bg-orange/10 text-orange',
}

export function Badge({ tone = 'neutral', mono = true, className = '', children }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md border px-2 py-0.5 text-xs leading-5 ${mono ? 'font-mono' : ''} ${tones[tone] ?? tones.neutral} ${className}`}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }) {
  const labels = { prototype: 'Prototype', 'in-progress': 'In progress', completed: 'Completed' }
  const tone = status === 'completed' ? 'cyan' : status === 'prototype' ? 'neutral' : 'orange'
  return <Badge tone={tone}>{labels[status] ?? status}</Badge>
}
