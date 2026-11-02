import { Link } from 'react-router-dom'
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi'
import { profile, socialLinks } from '../../data/profile.js'
import { apiConfigured } from '../../lib/api.js'

const icons = { github: FiGithub, linkedin: FiLinkedin, email: FiMail }

export function Footer() {
  const links = socialLinks()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border/70 bg-bg">
      <div className="container-x flex flex-col gap-8 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <p className="font-display text-base font-bold tracking-[0.12em]">
            {profile.brand}
            <span className="text-cyan">_</span>
          </p>
          <p className="mt-3 text-sm text-muted leading-relaxed">
            {profile.fullName} · {profile.role}. {profile.education.degree} student at {profile.education.institution},{' '}
            {profile.education.location}.
          </p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm sm:grid-cols-1">
          <Link className="text-muted hover:text-text py-1" to="/">
            Home
          </Link>
          <Link className="text-muted hover:text-text py-1" to="/projects">
            All projects
          </Link>
          {apiConfigured ? (
            <Link className="text-muted hover:text-text py-1" to="/blog">
              Blog
            </Link>
          ) : null}
          <Link className="text-muted hover:text-text py-1" to="/#skills">
            Skills
          </Link>
          <Link className="text-muted hover:text-text py-1" to="/#about">
            About
          </Link>
          <Link className="text-muted hover:text-text py-1" to="/#contact">
            Contact
          </Link>
        </nav>

        {links.length > 0 ? (
          <ul className="flex gap-2" aria-label="Social links">
            {links.map((item) => {
              const Icon = icons[item.key]
              return (
                <li key={item.key}>
                  <a
                    href={item.href}
                    target={item.key === 'email' ? undefined : '_blank'}
                    rel="noreferrer"
                    aria-label={item.label}
                    className="grid size-11 place-items-center rounded-full border border-border text-muted hover:border-cyan/60 hover:text-text"
                  >
                    <Icon aria-hidden="true" />
                  </a>
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
      <div className="container-x flex flex-col gap-2 border-t border-border/50 py-5 font-mono text-xs text-muted sm:flex-row sm:justify-between">
        <p>
          © {year} {profile.fullName}
        </p>
        <p>{profile.tagline}</p>
      </div>
    </footer>
  )
}
