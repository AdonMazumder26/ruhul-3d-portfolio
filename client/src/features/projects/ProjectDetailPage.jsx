import { Link, useParams } from 'react-router-dom'
import { FiArrowLeft, FiExternalLink, FiGithub } from 'react-icons/fi'
import { PageContainer } from '../../components/layout/PageContainer.jsx'
import { Badge, StatusBadge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { LoadingState } from '../../components/ui/LoadingState.jsx'
import { ErrorState } from '../../components/ui/ErrorState.jsx'
import { useDocumentMeta } from '../../hooks/useDocumentMeta.js'
import { hasLink } from '../../data/profile.js'
import { useProject } from './useProjects.js'

function Section({ title, children }) {
  return (
    <section className="border-t border-border/70 pt-8">
      <h2 className="text-xl sm:text-2xl">{title}</h2>
      <div className="mt-4 text-[15px] leading-relaxed text-muted sm:text-base">{children}</div>
    </section>
  )
}

function BulletList({ items }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-cyan" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

const BackLink = () => (
  <Link to="/projects" className="inline-flex min-h-10 items-center gap-2 text-sm text-muted hover:text-text">
    <FiArrowLeft aria-hidden="true" />
    Back to all projects
  </Link>
)

export function ProjectDetailPage() {
  const { slug } = useParams()
  const { status, project } = useProject(slug)

  useDocumentMeta({
    title: project ? project.title : status === 'not-found' ? 'Project not found' : 'Project',
    description: project?.summary,
  })

  if (status === 'loading') {
    return (
      <PageContainer>
        <BackLink />
        <div className="mt-8 max-w-2xl">
          <LoadingState label="Loading project…" lines={4} />
        </div>
      </PageContainer>
    )
  }

  if (status === 'not-found' || !project) {
    return (
      <PageContainer>
        <BackLink />
        <div className="mt-8 max-w-2xl">
          <ErrorState title="Project not found" message={`There is no project at “/projects/${slug}”. It may have been renamed or unpublished.`}>
            <Button to="/projects" variant="secondary" className="mt-5">
              Browse all projects
            </Button>
          </ErrorState>
        </div>
      </PageContainer>
    )
  }

  if (status === 'error') {
    return (
      <PageContainer>
        <BackLink />
        <div className="mt-8 max-w-2xl">
          <ErrorState title="Project could not be loaded" message="Please try again in a moment." />
        </div>
      </PageContainer>
    )
  }

  const hasRepo = hasLink(project.repositoryUrl)
  const hasLive = hasLink(project.liveUrl)
  const features = project.features ?? []
  const notes = project.implementationNotes ?? []
  const challenges = project.challenges ?? []

  return (
    <PageContainer>
      <BackLink />
      <article className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-10">
          <header>
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">{project.category}</p>
              <StatusBadge status={project.status} />
            </div>
            <h1 className="mt-4 text-4xl leading-tight sm:text-5xl">{project.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{project.summary}</p>
            {(hasRepo || hasLive) && (
              <div className="mt-7 flex flex-wrap gap-3">
                {hasLive ? (
                  <Button href={project.liveUrl} target="_blank" rel="noreferrer">
                    Live demo
                    <FiExternalLink aria-hidden="true" />
                  </Button>
                ) : null}
                {hasRepo ? (
                  <Button href={project.repositoryUrl} variant="secondary" target="_blank" rel="noreferrer">
                    <FiGithub aria-hidden="true" />
                    Source code
                  </Button>
                ) : null}
              </div>
            )}
          </header>

          {project.description ? (
            <Section title="Overview">
              <p>{project.description}</p>
            </Section>
          ) : null}
          {project.purpose ? (
            <Section title="Problem and purpose">
              <p>{project.purpose}</p>
            </Section>
          ) : null}
          {features.length > 0 ? (
            <Section title="Key features">
              <BulletList items={features} />
            </Section>
          ) : null}
          {notes.length > 0 ? (
            <Section title="Implementation notes">
              <BulletList items={notes} />
            </Section>
          ) : null}
          {challenges.length > 0 ? (
            <Section title="Challenges">
              <BulletList items={challenges} />
            </Section>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h2 className="eyebrow">Technology stack</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <li key={tech}>
                  <Badge>{tech}</Badge>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-4 border-t border-border/70 pt-6 text-sm">
              <div>
                <dt className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Status</dt>
                <dd className="mt-1.5">
                  <StatusBadge status={project.status} />
                </dd>
              </div>
              {project.role ? (
                <div>
                  <dt className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Role</dt>
                  <dd className="mt-1.5 text-text">{project.role}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </aside>
      </article>
    </PageContainer>
  )
}
