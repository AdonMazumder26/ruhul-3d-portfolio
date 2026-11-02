import { ApiError } from '../../utils/ApiError.js'
import { sendSuccess } from '../../utils/response.js'
import {
  createPost,
  deletePost,
  findPostById,
  findPublishedPostBySlug,
  listAllPosts,
  listPublishedPosts,
  serializePost,
  updatePost,
} from './post.service.js'

export async function getPosts(req, res) {
  const result = await listPublishedPosts(req.validated?.query ?? {})
  return sendSuccess(res, { message: 'Posts retrieved.', data: result })
}

export async function getPostBySlug(req, res) {
  const post = await findPublishedPostBySlug(req.validated.params.slug)
  if (!post) throw ApiError.notFound('Post not found.')
  return sendSuccess(res, { message: 'Post retrieved.', data: serializePost(post) })
}

export async function adminListPosts(req, res) {
  const posts = await listAllPosts(req.validated?.query ?? {})
  return sendSuccess(res, { message: 'Posts retrieved.', data: posts.map((doc) => serializePost(doc, { includeContent: false })) })
}

export async function adminGetPost(req, res) {
  const post = await findPostById(req.validated.params.id)
  if (!post) throw ApiError.notFound('Post not found.')
  return sendSuccess(res, { message: 'Post retrieved.', data: serializePost(post) })
}

export async function adminCreatePost(req, res) {
  const post = await createPost(req.body)
  return sendSuccess(res, { status: 201, message: 'Post created.', data: serializePost(post) })
}

export async function adminUpdatePost(req, res) {
  const post = await updatePost(req.validated.params.id, req.body)
  if (!post) throw ApiError.notFound('Post not found.')
  return sendSuccess(res, { message: 'Post updated.', data: serializePost(post) })
}

export async function adminDeletePost(req, res) {
  const post = await deletePost(req.validated.params.id)
  if (!post) throw ApiError.notFound('Post not found.')
  return sendSuccess(res, { message: 'Post deleted.', data: { id: String(post._id) } })
}
