import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from '../components/layout/Layout.jsx'
import { LoadingState } from '../components/ui/LoadingState.jsx'
import { HomePage } from '../features/home/HomePage.jsx'
import { ProjectsPage } from '../features/projects/ProjectsPage.jsx'
import { ProjectDetailPage } from '../features/projects/ProjectDetailPage.jsx'
import { NotFoundPage } from '../features/notfound/NotFoundPage.jsx'
import { apiConfigured } from '../lib/api.js'

// Blog (markdown renderer) and admin are separate chunks; most visitors never need them.
const BlogPage = lazy(() => import('../features/blog/BlogPage.jsx').then((m) => ({ default: m.BlogPage })))
const BlogPostPage = lazy(() => import('../features/blog/BlogPostPage.jsx').then((m) => ({ default: m.BlogPostPage })))
const AdminApp = lazy(() => import('../features/admin/AdminApp.jsx'))

function PageFallback() {
  return (
    <div className="container-x pt-28 pb-20 sm:pt-32">
      <div className="max-w-2xl">
        <LoadingState label="Loading…" lines={4} />
      </div>
    </div>
  )
}

function AdminFallback() {
  return (
    <div className="grid min-h-svh place-items-center bg-bg p-6">
      <div className="w-full max-w-sm">
        <LoadingState label="Loading admin…" />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:slug" element={<ProjectDetailPage />} />
        {apiConfigured ? (
          <>
            <Route
              path="blog"
              element={
                <Suspense fallback={<PageFallback />}>
                  <BlogPage />
                </Suspense>
              }
            />
            <Route
              path="blog/:slug"
              element={
                <Suspense fallback={<PageFallback />}>
                  <BlogPostPage />
                </Suspense>
              }
            />
          </>
        ) : null}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route
        path="admin/*"
        element={
          <Suspense fallback={<AdminFallback />}>
            <AdminApp />
          </Suspense>
        }
      />
    </Routes>
  )
}
