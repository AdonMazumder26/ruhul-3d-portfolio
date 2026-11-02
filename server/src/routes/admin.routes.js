import { Router } from 'express'
import { requireDatabase } from '../middleware/requireDatabase.js'
import { sendSuccess } from '../utils/response.js'
import { countProjects } from '../modules/projects/project.service.js'
import { countPosts } from '../modules/posts/post.service.js'
import { listContactMessages } from '../modules/contact/contact.service.js'
import { projectAdminRoutes } from '../modules/projects/project.admin.routes.js'
import { contactAdminRoutes } from '../modules/contact/contact.admin.routes.js'
import { postAdminRoutes } from '../modules/posts/post.routes.js'
import { settingsAdminRoutes } from '../modules/settings/settings.routes.js'

/** Everything here is mounted at /api/admin behind requireAdmin. */
export const adminRoutes = Router()

adminRoutes.get('/overview', requireDatabase, async (_req, res) => {
  const [projects, posts, inbox] = await Promise.all([countProjects(), countPosts(), listContactMessages({ limit: 5 })])
  return sendSuccess(res, {
    message: 'Overview retrieved.',
    data: { projects, posts, contacts: inbox.counts, recentMessages: inbox.items },
  })
})

adminRoutes.use('/projects', projectAdminRoutes)
adminRoutes.use('/contacts', contactAdminRoutes)
adminRoutes.use('/posts', postAdminRoutes)
adminRoutes.use('/settings', settingsAdminRoutes)
