import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { requireDatabase } from '../../middleware/requireDatabase.js'
import { listProjectsQuerySchema, projectSlugParamsSchema } from './project.schema.js'
import { getProjectBySlug, getProjects } from './project.controller.js'

export const projectRoutes = Router()

projectRoutes.get('/', validate(listProjectsQuerySchema, 'query'), requireDatabase, getProjects)
projectRoutes.get('/:slug', validate(projectSlugParamsSchema, 'params'), requireDatabase, getProjectBySlug)
