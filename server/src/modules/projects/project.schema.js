import { z } from 'zod'
import { PROJECT_STATUSES } from './project.model.js'

const boolFromQuery = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true')
  .optional()

export const listProjectsQuerySchema = z.object({
  featured: boolFromQuery,
  category: z.string().trim().min(1).max(80).optional(),
  technology: z.string().trim().min(1).max(60).optional(),
})

const slugField = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single hyphens.')
  .max(80)

export const projectSlugParamsSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid project slug.')
      .max(80),
  })
  .strict()

export const objectIdParamsSchema = z
  .object({
    id: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id.'),
  })
  .strict()

const httpsUrl = z
  .string()
  .trim()
  .max(500)
  .refine((value) => value === '' || /^https:\/\/[^\s]+$/i.test(value), 'Must be an absolute https:// URL.')

const stringList = z.array(z.string().trim().min(1).max(200)).max(30)

// Defaults are applied only on create/replace. The patch schema is built from the
// bare fields because Zod 4 still applies .default() under .partial(), which would
// silently reset omitted fields.
const requiredFields = {
  title: z.string().trim().min(2, 'Title is required.').max(120),
  slug: slugField,
  summary: z.string().trim().min(10, 'Summary should be at least 10 characters.').max(400),
  category: z.string().trim().min(2, 'Category is required.').max(80),
}

const optionalFields = {
  description: z.string().trim().max(4000),
  purpose: z.string().trim().max(2000),
  status: z.enum(PROJECT_STATUSES),
  technologies: stringList,
  features: stringList,
  implementationNotes: stringList,
  challenges: stringList,
  role: z.string().trim().max(160),
  repositoryUrl: httpsUrl,
  liveUrl: httpsUrl,
  coverImage: z.string().trim().max(500),
  featured: z.boolean(),
  published: z.boolean(),
  order: z.coerce.number().int().min(0).max(9999),
}

const defaults = {
  description: '',
  purpose: '',
  status: 'in-progress',
  technologies: [],
  features: [],
  implementationNotes: [],
  challenges: [],
  role: '',
  repositoryUrl: '',
  liveUrl: '',
  coverImage: '',
  featured: false,
  published: false,
  order: 0,
}

export const projectInputSchema = z
  .object({
    ...requiredFields,
    ...Object.fromEntries(Object.entries(optionalFields).map(([key, schema]) => [key, schema.default(defaults[key])])),
  })
  .strict()

export const projectPatchSchema = z
  .object({ ...requiredFields, ...optionalFields })
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, { message: 'Provide at least one field to update.' })

export const reorderSchema = z
  .object({
    ids: z.array(z.string().regex(/^[a-f0-9]{24}$/i)).min(1).max(500),
  })
  .strict()
