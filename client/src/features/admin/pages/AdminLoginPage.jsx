import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { FiArrowLeft, FiLock } from 'react-icons/fi'
import { Button } from '../../../components/ui/Button.jsx'
import { ApiRequestError, apiConfigured } from '../../../lib/api.js'
import { profile } from '../../../data/profile.js'
import { useDocumentMeta } from '../../../hooks/useDocumentMeta.js'
import { useAdminAuth } from '../adminAuthContext.js'
import { TextInput } from '../components/Form.jsx'

export function AdminLoginPage() {
  const { status, unavailable, login } = useAdminAuth()
  const location = useLocation()
  const [values, setValues] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useDocumentMeta({ title: 'Admin sign in' })

  if (status === 'authenticated') {
    return <Navigate to={location.state?.from && location.state.from !== '/admin/login' ? location.state.from : '/admin'} replace />
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await login(values.email.trim(), values.password)
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.status === 503
            ? 'Admin login is not configured on the server yet. Set ADMIN_EMAIL, ADMIN_PASSWORD_HASH and JWT_SECRET in server/.env.'
            : err.message
          : 'Could not sign in right now.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative grid min-h-svh place-items-center bg-bg px-4 py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid-fade opacity-30" />
      <div className="card relative w-full max-w-md p-7 sm:p-9">
        <Link to="/" className="inline-flex min-h-10 items-center gap-2 text-sm text-muted hover:text-text">
          <FiArrowLeft aria-hidden="true" />
          Back to site
        </Link>
        <div className="mt-6 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-cyan/10 text-cyan">
            <FiLock aria-hidden="true" />
          </span>
          <div>
            <p className="eyebrow">Admin</p>
            <h1 className="text-xl">Sign in to {profile.brand}</h1>
          </div>
        </div>

        {!apiConfigured ? (
          <p className="mt-6 rounded-lg border border-orange/40 bg-orange/10 p-3 text-sm text-text">
            <code>VITE_API_URL</code> is not set, so the admin panel cannot reach the API.
          </p>
        ) : unavailable && !error ? (
          <p className="mt-6 rounded-lg border border-border bg-elevated/40 p-3 text-sm text-muted">
            The API is reachable but admin login is not configured. See <code>server/.env.example</code>.
          </p>
        ) : null}

        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
          <TextInput
            label="Email"
            type="email"
            autoComplete="username"
            required
            value={values.email}
            onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
          />
          <TextInput
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={values.password}
            onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
          />
          {error ? (
            <p role="alert" className="text-sm text-orange">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={busy || !apiConfigured}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  )
}
