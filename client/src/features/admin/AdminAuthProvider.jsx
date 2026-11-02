import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiRequestError } from '../../lib/api.js'
import { adminApi } from './adminApi.js'
import { AdminAuthContext } from './adminAuthContext.js'

/**
 * Tracks the admin session. The cookie is httpOnly, so the only way to know
 * whether we are signed in is to ask the API.
 */
export function AdminAuthProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', admin: null, unavailable: false })

  useEffect(() => {
    const controller = new AbortController()
    adminApi
      .me(controller.signal)
      .then((admin) => setState({ status: 'authenticated', admin, unavailable: false }))
      .catch((error) => {
        if (controller.signal.aborted) return
        const unavailable = error instanceof ApiRequestError && (error.status === 503 || error.status === 0)
        setState({ status: 'anonymous', admin: null, unavailable })
      })
    return () => controller.abort()
  }, [])

  const login = useCallback(async (email, password) => {
    const admin = await adminApi.login(email, password)
    setState({ status: 'authenticated', admin, unavailable: false })
    return admin
  }, [])

  const logout = useCallback(async () => {
    try {
      await adminApi.logout()
    } finally {
      setState({ status: 'anonymous', admin: null, unavailable: false })
    }
  }, [])

  // A 401 from any admin call means the session expired; drop to the login page.
  const expire = useCallback(() => setState({ status: 'anonymous', admin: null, unavailable: false }), [])

  const value = useMemo(() => ({ ...state, login, logout, expire }), [state, login, logout, expire])

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}
