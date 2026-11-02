import { FiArrowRight } from 'react-icons/fi'
import { SectionHeading } from '../../components/ui/SectionHeading.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Reveal } from '../../components/ui/Reveal.jsx'
import { ProjectGrid } from './ProjectGrid.jsx'

export function ProjectsSection({ status, projects, retry }) {
  const featured = projects.filter((project) => project.featured).slice(0, 3)
  const list = featured.length > 0 ? featured : projects.slice(0, 3)

  return (
    <section id="projects" aria-labelledby="projects-title" className="section-y scroll-mt-20">
      <div className="container-x">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            id="projects-title"
            eyebrow="Selected projects"
            title="Three landmarks in the universe"
            description="Each marker orbiting the hero particle cloud points to one of these projects. Everything is also here as plain, readable HTML."
          />
          <Button to="/projects" variant="secondary" className="shrink-0">
            All projects
            <FiArrowRight aria-hidden="true" />
          </Button>
        </Reveal>

        <div className="mt-12">
          <ProjectGrid status={status} projects={list} retry={retry} />
        </div>
      </div>
    </section>
  )
}
