import { ApiError } from '../../utils/ApiError.js'
import { sendSuccess } from '../../utils/response.js'
import { findPublishedProjectBySlug, listPublishedProjects, serializeProject } from './project.service.js'

export async function getProjects(req, res) {
  const projects = await listPublishedProjects(req.validated?.query ?? {})
  return sendSuccess(res, { message: 'Projects retrieved.', data: projects.map(serializeProject) })
}

export async function getProjectBySlug(req, res) {
  const { slug } = req.validated.params
  const project = await findPublishedProjectBySlug(slug)
  if (!project) throw ApiError.notFound('Project not found.')
  return sendSuccess(res, { message: 'Project retrieved.', data: serializeProject(project) })
}
