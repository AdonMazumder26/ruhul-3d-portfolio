import { z } from 'zod'
import { POST_STATUSES } from './post.model.js'

const slugField = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single hyphens.')
  .max(120)

export const postSlugParamsSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid post slug.')
      .max(120),
  })
  .strict()

export const postIdParamsSchema = z
  .object({
    id: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id.'),
  })
  .strict()

export const listPostsQuerySchema = z.object({
  tag: z.string().trim().min(1).max(40).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export const adminListPostsQuerySchema = z.object({
  status: z.enum(POST_STATUSES).optional(),
})

const coverImage = z
  .string()
  .trim()
  .max(500)
  .refine((value) => value === '' || /^https:\/\/[^\s]+$/i.test(value), 'Must be an absolute https:// URL.')

const requiredFields = {
  title: z.string().trim().min(2, 'Title is required.').max(160),
  slug: slugField,
  content: z.string().min(1, 'Content is required.').max(60000, 'Content must be 60,000 characters or fewer.'),
}

// See project.schema.js: patch schema must not carry defaults.
const optionalFields = {
  excerpt: z.string().trim().max(400),
  coverImage,
  tags: z.array(z.string().trim().toLowerCase().min(1).max(40)).max(12),
  status: z.enum(POST_STATUSES),
  publishedAt: z.coerce.date().nullable(),
}

const defaults = { excerpt: '', coverImage: '', tags: [], status: 'draft' }

export const postInputSchema = z
  .object({
    ...requiredFields,
    ...Object.fromEntries(
      Object.entries(optionalFields).map(([key, schema]) => [key, key in defaults ? schema.default(defaults[key]) : schema.optional()]),
    ),
  })
  .strict()

export const postPatchSchema = z
  .object({ ...requiredFields, ...optionalFields })
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, { message: 'Provide at least one field to update.' })
