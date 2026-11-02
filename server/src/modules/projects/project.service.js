import { Project } from './project.model.js'

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export async function listPublishedProjects({ featured, category, technology } = {}) {
  const filter = { published: true }
  if (typeof featured === 'boolean') filter.featured = featured
  if (category) filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i')
  if (technology) filter.technologies = new RegExp(`^${escapeRegex(technology)}$`, 'i')

  return Project.find(filter).sort({ featured: -1, order: 1, title: 1 }).lean()
}

export async function findPublishedProjectBySlug(slug) {
  return Project.findOne({ slug, published: true }).lean()
}

export function serializeProject(doc) {
  if (!doc) return null
  const { _id, ...rest } = doc
  return { id: String(_id), ...rest }
}
