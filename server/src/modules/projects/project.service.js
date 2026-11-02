import { Project } from './project.model.js'
import { ApiError } from '../../utils/ApiError.js'

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

async function assertSlugAvailable(slug, excludeId) {
  if (!slug) return
  const filter = excludeId ? { slug, _id: { $ne: excludeId } } : { slug }
  if (await Project.exists(filter)) {
    throw ApiError.conflict('A project with this slug already exists.', [{ field: 'slug', message: 'This slug is already in use.' }])
  }
}

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

export async function listAllProjects() {
  return Project.find().sort({ featured: -1, order: 1, title: 1 }).lean()
}

export async function findProjectById(id) {
  return Project.findById(id).lean()
}

export async function createProject(input) {
  await assertSlugAvailable(input.slug)
  const doc = await Project.create(input)
  return doc.toObject()
}

export async function updateProject(id, input) {
  await assertSlugAvailable(input.slug, id)
  return Project.findByIdAndUpdate(id, { $set: input }, { returnDocument: 'after', runValidators: true }).lean()
}

export async function deleteProject(id) {
  return Project.findByIdAndDelete(id).lean()
}

/** Assigns order = position for the given ids; unknown ids are ignored. */
export async function reorderProjects(ids) {
  await Project.bulkWrite(
    ids.map((id, index) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: index + 1 } } } })),
    { ordered: false },
  )
  return listAllProjects()
}

export async function countProjects() {
  const [total, published] = await Promise.all([Project.countDocuments(), Project.countDocuments({ published: true })])
  return { total, published, drafts: total - published }
}

export function serializeProject(doc) {
  if (!doc) return null
  const { _id, ...rest } = doc
  return { id: String(_id), ...rest }
}
