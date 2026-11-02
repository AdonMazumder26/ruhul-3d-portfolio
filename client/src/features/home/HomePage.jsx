import { HeroSection } from './HeroSection.jsx'
import { ProjectsSection } from '../projects/ProjectsSection.jsx'
import { SkillsSection } from '../skills/SkillsSection.jsx'
import { AboutSection } from '../about/AboutSection.jsx'
import { JourneySection } from '../about/JourneySection.jsx'
import { ContactSection } from '../contact/ContactSection.jsx'
import { useProjects } from '../projects/useProjects.js'
import { useDocumentMeta } from '../../hooks/useDocumentMeta.js'
import { fallbackProjects } from '../../data/fallbackProjects.js'

export function HomePage() {
  useDocumentMeta({})
  const { status, projects, retry } = useProjects()
  // The hero scene should not wait for the API; fall back to local landmarks until data arrives.
  const sceneProjects = (projects.length > 0 ? projects : fallbackProjects).filter((project) => project.featured).slice(0, 3)

  return (
    <>
      <HeroSection projects={sceneProjects} />
      <ProjectsSection status={status} projects={projects} retry={retry} />
      <SkillsSection />
      <AboutSection />
      <JourneySection />
      <ContactSection />
    </>
  )
}
