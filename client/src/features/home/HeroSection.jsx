import { motion } from 'framer-motion'
import { FiArrowRight, FiArrowDown } from 'react-icons/fi'
import { profile } from '../../data/profile.js'
import { Button } from '../../components/ui/Button.jsx'
import { HeroVisual } from '../../components/three/HeroVisual.jsx'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'
import { scrollToId } from '../../lib/scroll.js'
import { useTheme } from '../theme/themeContext.js'

const fade = (reduced, delay) =>
  reduced
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
      }

export function HeroSection({ projects }) {
  const reduced = usePrefersReducedMotion()
  const { theme } = useTheme()
  const tagline = theme.hero.tagline?.trim() || profile.tagline

  const onSectionLink = (event, id) => {
    event.preventDefault()
    scrollToId(id)
    window.history.replaceState(null, '', `/#${id}`)
  }

  return (
    <section id="hero" aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 grid-fade opacity-40" />
        <div className="absolute left-1/2 top-1/3 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan/10 blur-[120px]" />
      </div>

      <div className="container-x grid min-h-[calc(100svh-4rem)] grid-cols-1 items-center gap-6 pb-16 pt-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-6 lg:pb-20 lg:pt-28">
        <div className="relative z-10 order-2 lg:order-1">
          <motion.p {...fade(reduced, 0)} className="eyebrow">
            {tagline}
          </motion.p>
          <motion.h1 {...fade(reduced, 0.08)} id="hero-title" className="mt-3 text-[2.15rem] leading-[1.05] sm:mt-4 sm:text-5xl lg:text-6xl">
            {profile.preferredName}
            <span className="text-cyan">.</span>
            <br />
            <span className="text-muted">{profile.role}.</span>
          </motion.h1>
          <motion.p {...fade(reduced, 0.16)} className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted sm:mt-6 sm:text-lg">
            {profile.heroStatement}
          </motion.p>
          <motion.div {...fade(reduced, 0.24)} className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
            <Button href="/#projects" onClick={(event) => onSectionLink(event, 'projects')}>
              Explore projects
              <FiArrowRight aria-hidden="true" />
            </Button>
            <Button variant="secondary" href="/#contact" onClick={(event) => onSectionLink(event, 'contact')}>
              Contact me
            </Button>
          </motion.div>
          <motion.dl {...fade(reduced, 0.32)} className="mt-10 grid max-w-md grid-cols-2 gap-6 border-t border-border/70 pt-6 text-xs text-muted">
            <div>
              <dt className="font-mono uppercase tracking-[0.18em]">Studying</dt>
              <dd className="mt-1 text-sm text-text">
                {profile.education.degree}, {profile.education.institution}
              </dd>
            </div>
            <div>
              <dt className="font-mono uppercase tracking-[0.18em]">Working with</dt>
              <dd className="mt-1 text-sm text-text">JavaScript · React · Node.js · Express · MongoDB</dd>
            </div>
          </motion.dl>
        </div>

        <div className="order-1 lg:order-2">
          <HeroVisual
            projects={projects}
            className="h-[220px] w-full sm:h-[340px] lg:h-[560px]"
          />
          <p className="mt-1 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted lg:hidden">
            Living particles · three markers, one per featured project
          </p>
        </div>
      </div>

      <a
        href="/#projects"
        onClick={(event) => onSectionLink(event, 'projects')}
        className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full px-3 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted hover:text-text lg:inline-flex"
      >
        Scroll
        <FiArrowDown aria-hidden="true" />
      </a>
    </section>
  )
}
