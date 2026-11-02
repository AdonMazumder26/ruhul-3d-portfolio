import { useState } from 'react'
import { SectionHeading } from '../../components/ui/SectionHeading.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Reveal } from '../../components/ui/Reveal.jsx'
import { skillGroups, focusLabels } from '../../data/skills.js'
import { SkillsFlowField } from './SkillsFlowField.jsx'

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
            title="A living map, not a progress bar"
            description="Grouped by where each tool fits in the stack. Labels describe how I use a technology rather than claiming a percentage."
          />
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <Reveal className="order-2 lg:order-1 lg:self-start lg:sticky lg:top-24">
            <SkillsFlowField groups={skillGroups} activeGroup={activeGroup} onHover={setHoveredSkill} />
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
