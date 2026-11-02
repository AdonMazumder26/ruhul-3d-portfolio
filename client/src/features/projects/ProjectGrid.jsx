import { ProjectCard } from './ProjectCard.jsx'
import { ProjectCardSkeleton } from '../../components/ui/LoadingState.jsx'
import { ErrorState } from '../../components/ui/ErrorState.jsx'
import { Reveal } from '../../components/ui/Reveal.jsx'

export function ProjectGrid({ status, projects, retry, headingLevel = 'h3', emptyMessage = 'No projects to show yet.' }) {
  if (status === 'loading') {
    return (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-live="polite">
        <p className="sr-only">Loading projects…</p>
        {Array.from({ length: 3 }).map((_, index) => (
          <ProjectCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (status === 'error') {
    return (
      <ErrorState
        title="Projects could not be loaded"
        message="The project list is temporarily unavailable. Please try again in a moment."
        onRetry={retry}
      />
    )
  }

  if (projects.length === 0) {
    return (
      <div className="card p-8 text-center text-muted" role="status">
        {emptyMessage}
      </div>
    )
  }

  return (
    <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project, index) => (
        <Reveal as="li" key={project.slug} delay={Math.min(index, 5) * 0.06} className="h-full">
          <ProjectCard project={project} index={index} headingLevel={headingLevel} />
        </Reveal>
      ))}
    </ul>
  )
}
