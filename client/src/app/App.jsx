import { Routes, Route } from 'react-router-dom'
import { Layout } from '../components/layout/Layout.jsx'
import { HomePage } from '../features/home/HomePage.jsx'
import { ProjectsPage } from '../features/projects/ProjectsPage.jsx'
import { ProjectDetailPage } from '../features/projects/ProjectDetailPage.jsx'
import { NotFoundPage } from '../features/notfound/NotFoundPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:slug" element={<ProjectDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
