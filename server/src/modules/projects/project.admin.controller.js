import { ApiError } from '../../utils/ApiError.js'
import { sendSuccess } from '../../utils/response.js'
import {
  createProject,
  deleteProject,
  findProjectById,
  listAllProjects,
  reorderProjects,
  serializeProject,
  updateProject,
} from './project.service.js'

export async function adminListProjects(_req, res) {
  const projects = await listAllProjects()
  return sendSuccess(res, { message: 'Projects retrieved.', data: projects.map(serializeProject) })
}

export async function adminGetProject(req, res) {
  const project = await findProjectById(req.validated.params.id)
  if (!project) throw ApiError.notFound('Project not found.')
  return sendSuccess(res, { message: 'Project retrieved.', data: serializeProject(project) })
}

export async function adminCreateProject(req, res) {
  const project = await createProject(req.body)
  return sendSuccess(res, { status: 201, message: 'Project created.', data: serializeProject(project) })
}

export async function adminUpdateProject(req, res) {
  const project = await updateProject(req.validated.params.id, req.body)
  if (!project) throw ApiError.notFound('Project not found.')
  return sendSuccess(res, { message: 'Project updated.', data: serializeProject(project) })
}

export async function adminDeleteProject(req, res) {
  const project = await deleteProject(req.validated.params.id)
  if (!project) throw ApiError.notFound('Project not found.')
  return sendSuccess(res, { message: 'Project deleted.', data: { id: String(project._id) } })
}

export async function adminReorderProjects(req, res) {
  const projects = await reorderProjects(req.body.ids)
  return sendSuccess(res, { message: 'Projects reordered.', data: projects.map(serializeProject) })
}
