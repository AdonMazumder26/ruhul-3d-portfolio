import { useState } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { FiBookOpen, FiExternalLink, FiFolder, FiGrid, FiInbox, FiLogOut, FiMenu, FiSliders, FiX } from 'react-icons/fi'
import { profile } from '../../data/profile.js'
import { useAdminAuth } from './adminAuthContext.js'
import { useDocumentMeta } from '../../hooks/useDocumentMeta.js'

const NAV = [
  { to: '/admin', label: 'Overview', icon: FiGrid, end: true },
  { to: '/admin/projects', label: 'Projects', icon: FiFolder },
  { to: '/admin/posts', label: 'Blog', icon: FiBookOpen },
  { to: '/admin/inbox', label: 'Inbox', icon: FiInbox },
  { to: '/admin/theme', label: 'Theme', icon: FiSliders },
]

function NavItems({ onNavigate }) {
  return (
    <ul className="space-y-1">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <li key={to}>
          <NavLink
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                isActive ? 'bg-cyan/10 text-cyan' : 'text-muted hover:bg-elevated hover:text-text'
              }`
            }
          >
            <Icon aria-hidden="true" size={18} />
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

export function AdminLayout() {
  const { admin, logout } = useAdminAuth()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  useDocumentMeta({ title: 'Admin' })

  const brand = (
    <Link to="/admin" className="font-display text-base font-bold tracking-[0.12em] text-text" onClick={() => setOpen(false)}>
      {profile.brand}
      <span className="text-cyan">_</span>
      <span className="ml-2 rounded-md border border-border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-muted">
        admin
      </span>
    </Link>
  )

  const footer = (
    <div className="space-y-1 border-t border-border/70 pt-4">
      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-muted hover:bg-elevated hover:text-text"
      >
        <FiExternalLink aria-hidden="true" size={18} />
        View site
      </a>
      <button
        type="button"
        onClick={logout}
        className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm text-muted hover:bg-elevated hover:text-text"
      >
        <FiLogOut aria-hidden="true" size={18} />
        Sign out
      </button>
      <p className="truncate px-3 pt-2 font-mono text-[11px] text-muted" title={admin?.email}>
        {admin?.email}
      </p>
    </div>
  )

  return (
    <div className="min-h-svh bg-bg text-text lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <a href="#admin-main" className="skip-link">
        Skip to content
      </a>

      <aside className="hidden border-r border-border/70 bg-surface/40 lg:flex lg:flex-col lg:gap-6 lg:p-5 lg:sticky lg:top-0 lg:h-svh">
        {brand}
        <nav aria-label="Admin" className="flex-1">
          <NavItems />
        </nav>
        {footer}
      </aside>

      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/70 bg-bg/90 px-4 backdrop-blur lg:hidden">
        {brand}
        <button
          type="button"
          className="grid size-11 place-items-center rounded-md"
          aria-expanded={open}
          aria-controls="admin-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <FiX size={22} aria-hidden="true" /> : <FiMenu size={22} aria-hidden="true" />}
        </button>
      </header>
      {open ? (
        <div id="admin-menu" className="border-b border-border/70 bg-bg px-4 py-4 lg:hidden">
          <nav aria-label="Admin">
            <NavItems onNavigate={() => setOpen(false)} />
          </nav>
          <div className="mt-4">{footer}</div>
        </div>
      ) : null}

      <main id="admin-main" tabIndex={-1} className="min-w-0 px-4 py-6 outline-none sm:px-8 sm:py-8 lg:px-10" key={location.pathname}>
        <Outlet />
      </main>
    </div>
  )
}

export function AdminPageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}
