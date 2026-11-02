import { Route, Routes } from 'react-router-dom'
import { AdminAuthProvider } from './AdminAuthProvider.jsx'
import { AdminLayout } from './AdminLayout.jsx'
import { RequireAdmin } from './RequireAdmin.jsx'
import { ToastProvider } from './components/Feedback.jsx'
import { AdminLoginPage } from './pages/AdminLoginPage.jsx'
import { AdminOverviewPage } from './pages/AdminOverviewPage.jsx'
import { AdminProjectsPage } from './pages/AdminProjectsPage.jsx'
import { AdminProjectEditorPage } from './pages/AdminProjectEditorPage.jsx'
import { AdminPostsPage } from './pages/AdminPostsPage.jsx'
import { AdminPostEditorPage } from './pages/AdminPostEditorPage.jsx'
import { AdminInboxPage } from './pages/AdminInboxPage.jsx'
import { AdminThemePage } from './pages/AdminThemePage.jsx'
import { NotFoundPage } from '../notfound/NotFoundPage.jsx'

/** Mounted at /admin/* and loaded lazily so the public bundle stays small. */
export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="login" element={<AdminLoginPage />} />
          <Route element={<RequireAdmin />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="projects" element={<AdminProjectsPage />} />
              <Route path="projects/new" element={<AdminProjectEditorPage />} />
              <Route path="projects/:id" element={<AdminProjectEditorPage />} />
              <Route path="posts" element={<AdminPostsPage />} />
              <Route path="posts/new" element={<AdminPostEditorPage />} />
              <Route path="posts/:id" element={<AdminPostEditorPage />} />
              <Route path="inbox" element={<AdminInboxPage />} />
              <Route path="theme" element={<AdminThemePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Routes>
      </ToastProvider>
    </AdminAuthProvider>
  )
}
