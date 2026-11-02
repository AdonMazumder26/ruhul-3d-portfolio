import { useMemo, useState } from 'react'
import { PageContainer } from '../../components/layout/PageContainer.jsx'
import { SectionHeading } from '../../components/ui/SectionHeading.jsx'
import { useDocumentMeta } from '../../hooks/useDocumentMeta.js'
import { useProjects } from './useProjects.js'
import { ProjectGrid } from './ProjectGrid.jsx'

const ALL = 'all'

function FilterGroup({ label, options, value, onChange }) {
  return (
    <fieldset className="min-w-0">
      <legend className="eyebrow mb-3">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {[ALL, ...options].map((option) => {
          const checked = value === option
          return (
            <label
              key={option}
              className={`inline-flex min-h-10 cursor-pointer items-center rounded-full border px-4 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-cyan ${
                checked ? 'border-cyan bg-cyan/10 text-text' : 'border-border text-muted hover:text-text'
              }`}
            >
              <input
                type="radio"
                name={label}
                value={option}
                checked={checked}
                onChange={() => onChange(option)}
                className="sr-only"
              />
              {option === ALL ? 'All' : option}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export function ProjectsPage() {
  useDocumentMeta({
    title: 'Projects',
    description: 'All projects by Ruhul Ma Ani Mazumder: TeamForge, LedgerFlow and Abandoned but not Forgotten.',
  })
  const { status, projects, source, retry } = useProjects()
  const [category, setCategory] = useState(ALL)
  const [technology, setTechnology] = useState(ALL)

  const categories = useMemo(() => [...new Set(projects.map((project) => project.category))].sort(), [projects])
  const technologies = useMemo(
    () => [...new Set(projects.flatMap((project) => project.technologies))].sort((a, b) => a.localeCompare(b)),
    [projects],
  )

  const filtered = useMemo(
    () =>
      projects.filter(
        (project) =>
          (category === ALL || project.category === category) &&
          (technology === ALL || project.technologies.includes(technology)),
      ),
    [projects, category, technology],
  )

  const filtersActive = category !== ALL || technology !== ALL

  return (
    <PageContainer>
      <SectionHeading
        as="h1"
        eyebrow="Projects"
        title="Everything I am building"
        description="Full-stack products and interactive experiments. Status labels reflect the real state of each project."
      />

      {status === 'success' && projects.length > 1 ? (
        <div className="mt-10 grid gap-6 border-y border-border/70 py-6 lg:grid-cols-[auto_1fr] lg:gap-10">
          <FilterGroup label="Category" options={categories} value={category} onChange={setCategory} />
          <FilterGroup label="Technology" options={technologies} value={technology} onChange={setTechnology} />
        </div>
      ) : null}

      <div className="mt-8 flex items-center justify-between gap-4 text-sm text-muted">
        <p role="status" aria-live="polite">
          {status === 'success' ? `${filtered.length} of ${projects.length} projects` : '\u00a0'}
        </p>
        {filtersActive ? (
          <button
            type="button"
            className="min-h-10 rounded-md px-2 text-cyan hover:underline"
            onClick={() => {
              setCategory(ALL)
              setTechnology(ALL)
            }}
          >
            Clear filters
          </button>
        ) : null}
      </div>

      <div className="mt-4">
        <ProjectGrid
          status={status}
          projects={filtered}
          retry={retry}
          headingLevel="h2"
          emptyMessage="No projects match these filters. Try clearing one of them."
        />
      </div>

      {source === 'fallback' && import.meta.env.DEV ? (
        <p className="mt-8 font-mono text-xs text-muted">Showing local fallback data (API not configured or unreachable).</p>
      ) : null}
    </PageContainer>
  )
}
