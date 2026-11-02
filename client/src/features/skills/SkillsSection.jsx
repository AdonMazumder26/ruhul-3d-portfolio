import { Suspense, lazy, useMemo, useState } from 'react'
import { SectionHeading } from '../../components/ui/SectionHeading.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Reveal } from '../../components/ui/Reveal.jsx'
import { SceneErrorBoundary } from '../../components/three/SceneErrorBoundary.jsx'
import { skillGroups, focusLabels } from '../../data/skills.js'
import { useDeviceCapability } from '../../hooks/useDeviceCapability.js'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'
import { useInView } from '../../hooks/useInView.js'
import { useTheme } from '../theme/themeContext.js'

const SkillsConstellation = lazy(() => import('../../components/three/SkillsConstellation.jsx'))

function ConstellationPanel({ activeGroup, onHover }) {
  const reduced = usePrefersReducedMotion()
  const { webgl, tier } = useDeviceCapability()
  const { theme } = useTheme()
  const [failed, setFailed] = useState(false)
  const [mountRef, nearViewport] = useInView({ rootMargin: '200px', once: true })
  const [visibleRef, visible] = useInView({ rootMargin: '80px' })

  const use3D = theme.skills.scene3d && webgl && !reduced && !failed && tier !== 'low'
  const sceneColors = useMemo(
    () => ({ cyan: theme.colors.accent, orange: theme.colors.accentAlt, surface: theme.colors.elevated }),
    [theme.colors],
  )

  return (
    <div
      ref={(node) => {
        mountRef.current = node
        visibleRef.current = node
      }}
      className="card relative h-[320px] overflow-hidden sm:h-[400px] lg:sticky lg:top-24 lg:h-[540px]"
    >
      <div aria-hidden="true" className="absolute inset-0 grid-fade opacity-40" />
      {use3D && nearViewport ? (
        <SceneErrorBoundary fallback={<StaticConstellation />} onError={() => setFailed(true)}>
          <Suspense fallback={<StaticConstellation />}>
            <div className="absolute inset-0">
              <SkillsConstellation
                groups={skillGroups}
                activeGroup={activeGroup}
                active={visible}
                colors={sceneColors}
                onHover={onHover}
              />
            </div>
          </Suspense>
        </SceneErrorBoundary>
      ) : (
        <StaticConstellation />
      )}
      <p className="pointer-events-none absolute bottom-3 left-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
        {use3D ? 'Hover a node · pick a category' : 'Skill map'}
      </p>
    </div>
  )
}

/** SVG stand-in for the constellation when 3D is unavailable. */
function StaticConstellation() {
  const groups = skillGroups
  const cx = 200
  const cy = 190
  return (
    <svg aria-hidden="true" viewBox="0 0 400 380" className="absolute inset-0 h-full w-full">
      {groups.map((group, index) => {
        const angle = (index / groups.length) * Math.PI * 2 - Math.PI / 2
        const hx = cx + Math.cos(angle) * 125
        const hy = cy + Math.sin(angle) * 110
        const color = group.color === 'orange' ? 'var(--color-orange)' : 'var(--color-cyan)'
        return (
          <g key={group.id}>
            <line x1={cx} y1={cy} x2={hx} y2={hy} stroke="var(--color-border)" />
            {group.skills.map((skill, skillIndex) => {
              const local = (skillIndex / group.skills.length) * Math.PI * 2 + index
              const sx = hx + Math.cos(local) * 34
              const sy = hy + Math.sin(local) * 28
              return (
                <g key={skill.name}>
                  <line x1={hx} y1={hy} x2={sx} y2={sy} stroke={color} strokeOpacity="0.35" />
                  <circle cx={sx} cy={sy} r="3" fill={color} fillOpacity="0.8" />
                </g>
              )
            })}
            <circle cx={hx} cy={hy} r="6" fill={color} />
          </g>
        )
      })}
      <circle cx={cx} cy={cy} r="14" fill="var(--color-elevated)" stroke="var(--color-cyan)" strokeOpacity="0.6" />
    </svg>
  )
}

export function SkillsSection() {
  const [pinnedGroup, setPinnedGroup] = useState(null)
  const [hoverGroup, setHoverGroup] = useState(null)
  const [hoveredSkill, setHoveredSkill] = useState(null)
  const activeGroup = hoverGroup ?? pinnedGroup

  return (
    <section id="skills" aria-labelledby="skills-title" className="section-y scroll-mt-20 border-t border-border/60">
      <div className="container-x">
        <Reveal>
          <SectionHeading
            id="skills-title"
            eyebrow="Skills"
            title="A constellation, not a progress bar"
            description="Grouped by where each tool fits in the stack. Labels describe how I use a technology rather than claiming a percentage."
          />
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <Reveal className="order-2 lg:order-1 lg:self-start lg:sticky lg:top-24">
            <ConstellationPanel activeGroup={activeGroup} onHover={setHoveredSkill} />
            <p className="mt-3 min-h-5 font-mono text-xs text-muted" aria-live="polite">
              {hoveredSkill ? `${hoveredSkill.name} — ${hoveredSkill.note}` : ''}
            </p>
          </Reveal>

          <div className="order-1 lg:order-2">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Highlight a skill category">
              <button
                type="button"
                onClick={() => setPinnedGroup(null)}
                aria-pressed={pinnedGroup === null}
                className={`min-h-10 rounded-full border px-4 text-sm transition-colors ${
                  pinnedGroup === null ? 'border-cyan bg-cyan/10 text-text' : 'border-border text-muted hover:text-text'
                }`}
              >
                All
              </button>
              {skillGroups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setPinnedGroup((current) => (current === group.id ? null : group.id))}
                  aria-pressed={pinnedGroup === group.id}
                  className={`min-h-10 rounded-full border px-4 text-sm transition-colors ${
                    pinnedGroup === group.id ? 'border-cyan bg-cyan/10 text-text' : 'border-border text-muted hover:text-text'
                  }`}
                >
                  {group.label}
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {skillGroups.map((group, index) => {
                const muted = activeGroup && activeGroup !== group.id
                return (
                  <Reveal
                    key={group.id}
                    delay={index * 0.05}
                    className={`card p-5 transition-opacity ${muted ? 'opacity-45' : 'opacity-100'}`}
                    onMouseEnter={() => setHoverGroup(group.id)}
                    onMouseLeave={() => setHoverGroup(null)}
                  >
                    <h3 className="flex items-center gap-2 text-base">
                      <span
                        aria-hidden="true"
                        className={`size-2 rounded-full ${group.color === 'orange' ? 'bg-orange' : 'bg-cyan'}`}
                      />
                      {group.label}
                    </h3>
                    <ul className="mt-4 space-y-3">
                      {group.skills.map((skill) => (
                        <li key={skill.name} className="text-sm">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="font-medium text-text">{skill.name}</span>
                            <Badge tone={skill.focus === 'learning' ? 'orange' : 'neutral'} className="text-[10px]">
                              {focusLabels[skill.focus]}
                            </Badge>
                          </div>
                          <p className="mt-0.5 text-muted">{skill.note}</p>
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
