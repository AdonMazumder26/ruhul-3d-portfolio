import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowUpRight } from 'react-icons/fi'
import { Badge, StatusBadge } from '../../components/ui/Badge.jsx'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'

const markerShapes = [
  // Octahedron
  'M12 2 L20 12 L12 22 L4 12 Z M4 12 L20 12',
  // Cube
  'M7 8 L15 5 L19 8 L11 11 Z M7 8 L7 16 L11 19 L11 11 M19 8 L19 16 L11 19',
  // Hexagon
  'M12 3 L19.8 7.5 L19.8 16.5 L12 21 L4.2 16.5 L4.2 7.5 Z M12 12 L19.8 7.5 M12 12 L12 21 M12 12 L4.2 7.5',
]

export function ProjectCard({ project, index = 0, headingLevel = 'h3' }) {
  const reduced = usePrefersReducedMotion()
  const Heading = headingLevel
  const accent = index % 2 === 0 ? 'text-cyan' : 'text-orange'
  const detailsId = `project-${project.slug}-title`

  return (
    <motion.article
      className="card group relative flex h-full flex-col p-6 transition-colors hover:border-cyan/50 focus-within:border-cyan focus-within:ring-2 focus-within:ring-cyan/70 sm:p-7"
      whileHover={reduced ? undefined : { y: -4 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={`grid size-10 place-items-center rounded-xl border border-border bg-elevated ${accent}`}
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
              <path d={markerShapes[index % markerShapes.length]} />
            </svg>
          </span>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">{project.category}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <Heading id={detailsId} className="mt-5 text-xl sm:text-2xl">
        <Link
          to={`/projects/${project.slug}`}
          className="after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:ring-0"
        >
          {project.title}
        </Link>
      </Heading>
      <p className="mt-3 flex-1 text-[15px] leading-relaxed text-muted">{project.summary}</p>

      <ul className="mt-6 flex flex-wrap gap-2" aria-label={`${project.title} technologies`}>
        {project.technologies.slice(0, 5).map((tech) => (
          <li key={tech}>
            <Badge>{tech}</Badge>
          </li>
        ))}
        {project.technologies.length > 5 ? (
          <li>
            <Badge>+{project.technologies.length - 5}</Badge>
          </li>
        ) : null}
      </ul>

      <span
        aria-hidden="true"
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-text transition-colors group-hover:text-cyan"
      >
        View details
        <FiArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </motion.article>
  )
}
