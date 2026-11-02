import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { requireDatabase } from '../../middleware/requireDatabase.js'
import { objectIdParamsSchema, projectInputSchema, projectPatchSchema, reorderSchema } from './project.schema.js'
import {
  adminCreateProject,
  adminDeleteProject,
  adminGetProject,
  adminListProjects,
  adminReorderProjects,
  adminUpdateProject,
} from './project.admin.controller.js'

// Mounted under /api/admin/projects behind requireAdmin.
export const projectAdminRoutes = Router()

projectAdminRoutes.use(requireDatabase)
projectAdminRoutes.get('/', adminListProjects)
projectAdminRoutes.post('/', validate(projectInputSchema), adminCreateProject)
projectAdminRoutes.put('/order', validate(reorderSchema), adminReorderProjects)
projectAdminRoutes.get('/:id', validate(objectIdParamsSchema, 'params'), adminGetProject)
projectAdminRoutes.put('/:id', validate(objectIdParamsSchema, 'params'), validate(projectInputSchema), adminUpdateProject)
projectAdminRoutes.patch('/:id', validate(objectIdParamsSchema, 'params'), validate(projectPatchSchema), adminUpdateProject)
projectAdminRoutes.delete('/:id', validate(objectIdParamsSchema, 'params'), adminDeleteProject)
