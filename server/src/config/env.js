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
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  // Fail fast with a readable message and without echoing secret values.
  const issues = parsed.error.issues.map((issue) => `  - ${issue.path.join('.') || 'env'}: ${issue.message}`)
  console.error(`Invalid environment configuration:\n${issues.join('\n')}\n\nSee server/.env.example for the required variables.`)
  process.exit(1)
}

export const env = {
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === 'production',
}
