import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FiMenu, FiX } from 'react-icons/fi'
import { profile, hasLink } from '../../data/profile.js'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'
import { scrollToId } from '../../lib/scroll.js'

const SECTION_LINKS = [
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
]

function useActiveSection(enabled) {
  const [active, setActive] = useState('')

  useEffect(() => {
    if (!enabled) return undefined
    const ids = ['hero', ...SECTION_LINKS.map((link) => link.id)]
    const nodes = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (nodes.length === 0) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.2, 0.5] },
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [enabled])

  return enabled ? active : ''
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(() => typeof window !== 'undefined' && window.scrollY > 12)
  const location = useLocation()
  const navigate = useNavigate()
  const reduced = usePrefersReducedMotion()
  const toggleRef = useRef(null)
  const onHome = location.pathname === '/'
  const activeSection = useActiveSection(onHome)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  const goToSection = useCallback(
    (event, id) => {
      event.preventDefault()
      setOpen(false)
      if (onHome) {
        scrollToId(id)
        window.history.replaceState(null, '', `/#${id}`)
      } else {
        navigate(`/#${id}`)
      }
    },
    [onHome, navigate],
  )

  const linkClass = (isActive) =>
    `relative rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'text-text' : 'text-muted hover:text-text'
    }`

  const activeDot = (isActive) =>
    isActive ? (
      <span aria-hidden="true" className="absolute inset-x-3 -bottom-0.5 h-px bg-cyan" />
    ) : null

  const sectionIsActive = (id) => onHome && activeSection === id
  const projectsRouteActive = location.pathname.startsWith('/projects')

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? 'bg-bg/85 backdrop-blur-md border-b border-border/70' : 'bg-transparent'
      }`}
    >
      <nav aria-label="Primary" className="container-x flex h-16 items-center justify-between gap-4">
        <Link
          to="/"
          className="font-display text-base font-bold tracking-[0.12em] text-text"
          aria-label={`${profile.brand} home`}
          onClick={(event) => {
            if (onHome) {
              event.preventDefault()
              window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
              window.history.replaceState(null, '', '/')
            }
            setOpen(false)
          }}
        >
          {profile.brand}
          <span className="text-cyan">_</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          <li>
            <NavLink to="/" end className={({ isActive }) => linkClass(isActive && (!activeSection || activeSection === 'hero'))}>
              {({ isActive }) => (
                <>
                  Home
                  {activeDot(isActive && (!activeSection || activeSection === 'hero'))}
                </>
              )}
            </NavLink>
          </li>
          {SECTION_LINKS.map((link) => {
            const isActive = sectionIsActive(link.id) || (link.id === 'projects' && projectsRouteActive)
            return (
              <li key={link.id}>
                <a
                  href={`/#${link.id}`}
                  onClick={(event) => goToSection(event, link.id)}
                  className={linkClass(isActive)}
                  aria-current={isActive ? 'location' : undefined}
                >
                  {link.label}
                  {activeDot(isActive)}
                </a>
              </li>
            )
          })}
          {hasLink(profile.links.resume) ? (
            <li className="ml-2">
              <a
                href={profile.links.resume}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center rounded-full border border-border px-4 text-sm font-medium text-text hover:border-cyan/60"
              >
                Resume
              </a>
            </li>
          ) : null}
        </ul>

        <button
          ref={toggleRef}
          type="button"
          className="grid size-11 place-items-center rounded-md text-text md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <FiX size={22} aria-hidden="true" /> : <FiMenu size={22} aria-hidden="true" />}
        </button>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            className="md:hidden border-t border-border/70 bg-bg/95 backdrop-blur-md"
            initial={reduced ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <ul className="container-x flex flex-col py-3">
              <li>
                <Link to="/" onClick={() => setOpen(false)} className="block min-h-11 rounded-md px-3 py-3 text-base font-medium text-text">
                  Home
                </Link>
              </li>
              {SECTION_LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={`/#${link.id}`}
                    onClick={(event) => goToSection(event, link.id)}
                    className="block min-h-11 rounded-md px-3 py-3 text-base font-medium text-muted hover:text-text"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  to="/projects"
                  onClick={() => setOpen(false)}
                  className="block min-h-11 rounded-md px-3 py-3 text-base font-medium text-muted hover:text-text"
                >
                  All projects
                </Link>
              </li>
              {hasLink(profile.links.resume) ? (
                <li>
                  <a
                    href={profile.links.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="block min-h-11 rounded-md px-3 py-3 text-base font-medium text-muted hover:text-text"
                  >
                    Resume
                  </a>
                </li>
              ) : null}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
