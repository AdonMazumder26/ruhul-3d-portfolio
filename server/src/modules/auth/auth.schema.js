import { z } from 'zod'

export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Please enter a valid email address.').max(254),
    password: z.string().min(1, 'Please enter your password.').max(200),
  })
  .strict()
