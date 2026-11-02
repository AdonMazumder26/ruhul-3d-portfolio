import { Post } from './post.model.js'
import { ApiError } from '../../utils/ApiError.js'

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

async function assertSlugAvailable(slug, excludeId) {
  if (!slug) return
  const filter = excludeId ? { slug, _id: { $ne: excludeId } } : { slug }
  if (await Post.exists(filter)) {
    throw ApiError.conflict('A post with this slug already exists.', [{ field: 'slug', message: 'This slug is already in use.' }])
  }
}

export function serializePost(doc, { includeContent = true } = {}) {
  if (!doc) return null
  const { _id, content, ...rest } = doc
  return { id: String(_id), ...rest, ...(includeContent ? { content } : {}) }
}

function readingMinutes(content) {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

/** Derives publishedAt/readingMinutes from the submitted fields. */
function prepare(input, existing) {
  const next = { ...input }
  if (typeof next.content === 'string') next.readingMinutes = readingMinutes(next.content)

  const status = next.status ?? existing?.status ?? 'draft'
  if (status === 'published') {
    next.publishedAt = next.publishedAt ?? existing?.publishedAt ?? new Date()
  } else if (next.status === 'draft') {
    next.publishedAt = null
  }
  return next
}

export async function listPublishedPosts({ tag, page = 1, limit = 10 } = {}) {
  const filter = { status: 'published' }
  if (tag) filter.tags = new RegExp(`^${escapeRegex(tag)}$`, 'i')

  const [items, total, tags] = await Promise.all([
    Post.find(filter)
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-content')
      .lean(),
    Post.countDocuments(filter),
    Post.distinct('tags', { status: 'published' }),
  ])
  return {
    items: items.map((doc) => serializePost(doc, { includeContent: false })),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    tags: tags.sort(),
  }
}

export async function findPublishedPostBySlug(slug) {
  return Post.findOne({ slug, status: 'published' }).lean()
}

export async function listAllPosts({ status } = {}) {
  const filter = status ? { status } : {}
  return Post.find(filter).sort({ updatedAt: -1 }).select('-content').lean()
}

export async function findPostById(id) {
  return Post.findById(id).lean()
}

export async function createPost(input) {
  await assertSlugAvailable(input.slug)
  const doc = await Post.create(prepare(input))
  return doc.toObject()
}

export async function updatePost(id, input) {
  const existing = await Post.findById(id).lean()
  if (!existing) return null
  await assertSlugAvailable(input.slug, id)
  return Post.findByIdAndUpdate(id, { $set: prepare(input, existing) }, { returnDocument: 'after', runValidators: true }).lean()
}

export async function deletePost(id) {
  return Post.findByIdAndDelete(id).lean()
}

export async function countPosts() {
  const [total, published] = await Promise.all([Post.countDocuments(), Post.countDocuments({ status: 'published' })])
  return { total, published, drafts: total - published }
}
