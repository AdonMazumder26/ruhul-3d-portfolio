import { z } from 'zod'

const boolFromQuery = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true')
  .optional()

export const listProjectsQuerySchema = z.object({
  featured: boolFromQuery,
  category: z.string().trim().min(1).max(80).optional(),
  technology: z.string().trim().min(1).max(60).optional(),
})

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
