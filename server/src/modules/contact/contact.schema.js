import { z } from 'zod'
import { CONTACT_STATUSES } from './contact.model.js'

// Collapses internal whitespace runs and strips control characters.
const clean = (value) => value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/[ \t]+/g, ' ').trim()

export const contactSchema = z
  .object({
    name: z.string().transform(clean).pipe(z.string().min(2, 'Please enter your name.').max(80, 'Name must be 80 characters or fewer.')),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(254, 'Email must be 254 characters or fewer.')
      .pipe(z.email({ message: 'Please enter a valid email address.' })),
    subject: z
      .string()
      .transform(clean)
      .pipe(z.string().max(120, 'Subject must be 120 characters or fewer.'))
      .optional()
      .default(''),
    message: z
      .string()
      .transform(clean)
      .pipe(z.string().min(10, 'Message should be at least 10 characters.').max(2000, 'Message must be 2000 characters or fewer.')),
    // Honeypot: real visitors never fill this in.
    website: z.string().max(200).optional().default(''),
  })
  .strict()

export const contactListQuerySchema = z.object({
  status: z.enum(CONTACT_STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const contactStatusSchema = z
  .object({
    status: z.enum(CONTACT_STATUSES),
  })
  .strict()

export const contactIdParamsSchema = z
  .object({
    id: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id.'),
  })
  .strict()
