import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { requireDatabase } from '../../middleware/requireDatabase.js'
import {
  adminListPostsQuerySchema,
  listPostsQuerySchema,
  postIdParamsSchema,
  postInputSchema,
  postPatchSchema,
  postSlugParamsSchema,
} from './post.schema.js'
import {
  adminCreatePost,
  adminDeletePost,
  adminGetPost,
  adminListPosts,
  adminUpdatePost,
  getPostBySlug,
  getPosts,
} from './post.controller.js'

export const postRoutes = Router()

postRoutes.get('/', validate(listPostsQuerySchema, 'query'), requireDatabase, getPosts)
postRoutes.get('/:slug', validate(postSlugParamsSchema, 'params'), requireDatabase, getPostBySlug)

// Mounted under /api/admin/posts behind requireAdmin.
export const postAdminRoutes = Router()

postAdminRoutes.use(requireDatabase)
postAdminRoutes.get('/', validate(adminListPostsQuerySchema, 'query'), adminListPosts)
postAdminRoutes.post('/', validate(postInputSchema), adminCreatePost)
postAdminRoutes.get('/:id', validate(postIdParamsSchema, 'params'), adminGetPost)
postAdminRoutes.put('/:id', validate(postIdParamsSchema, 'params'), validate(postInputSchema), adminUpdatePost)
postAdminRoutes.patch('/:id', validate(postIdParamsSchema, 'params'), validate(postPatchSchema), adminUpdatePost)
postAdminRoutes.delete('/:id', validate(postIdParamsSchema, 'params'), adminDeletePost)
