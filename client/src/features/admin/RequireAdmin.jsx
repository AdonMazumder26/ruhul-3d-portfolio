import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingState } from '../../components/ui/LoadingState.jsx'
import { useAdminAuth } from './adminAuthContext.js'

export function RequireAdmin() {
  const { status } = useAdminAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="grid min-h-svh place-items-center bg-bg p-6">
        <div className="w-full max-w-sm">
          <LoadingState label="Checking your session…" />
        </div>
      </div>
    )
  }
  if (status !== 'authenticated') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
