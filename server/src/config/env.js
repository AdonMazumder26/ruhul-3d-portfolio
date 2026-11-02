import 'dotenv/config'
import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  MONGODB_URI: z
    .string()
    .min(1, 'MONGODB_URI is required')
    .refine((value) => /^mongodb(\+srv)?:\/\//.test(value), 'MONGODB_URI must start with mongodb:// or mongodb+srv://'),
  CLIENT_ORIGIN: z
    .string()
    .min(1, 'CLIENT_ORIGIN is required')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim().replace(/\/+$/, ''))
        .filter(Boolean),
    ),
  // Admin panel: all three must be set together; when absent the admin API is disabled.
  ADMIN_EMAIL: z.string().trim().toLowerCase().email().optional(),
  ADMIN_PASSWORD_HASH: z
    .string()
    .trim()
    .regex(/^\$2[aby]\$\d{2}\$.{53}$/, 'ADMIN_PASSWORD_HASH must be a bcrypt hash (run: npm run admin:hash -- "your password")')
    .optional(),
  JWT_SECRET: z.string().trim().min(32, 'JWT_SECRET must be at least 32 characters').optional(),
  ADMIN_SESSION_DAYS: z.coerce.number().int().min(1).max(90).default(7),
})
  .superRefine((value, ctx) => {
    const adminKeys = ['ADMIN_EMAIL', 'ADMIN_PASSWORD_HASH', 'JWT_SECRET']
    const present = adminKeys.filter((key) => value[key])
    if (present.length > 0 && present.length < adminKeys.length) {
      adminKeys
        .filter((key) => !value[key])
        .forEach((key) => ctx.addIssue({ code: 'custom', path: [key], message: `${key} is required when admin login is enabled` }))
    }
  })

// Empty strings in .env should count as "not set".
const rawEnv = Object.fromEntries(Object.entries(process.env).filter(([, value]) => value !== ''))
const parsed = schema.safeParse(rawEnv)

if (!parsed.success) {
  // Fail fast with a readable message and without echoing secret values.
  const issues = parsed.error.issues.map((issue) => `  - ${issue.path.join('.') || 'env'}: ${issue.message}`)
  console.error(`Invalid environment configuration:\n${issues.join('\n')}\n\nSee server/.env.example for the required variables.`)
  process.exit(1)
}

export const env = {
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === 'production',
  adminEnabled: Boolean(parsed.data.ADMIN_EMAIL && parsed.data.ADMIN_PASSWORD_HASH && parsed.data.JWT_SECRET),
}
