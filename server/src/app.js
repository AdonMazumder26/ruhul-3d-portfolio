import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { env } from './config/env.js'
import { databaseStatus } from './config/db.js'
import { apiLimiter } from './middleware/rateLimit.js'
import { requireAdmin } from './middleware/requireAdmin.js'
import { notFound } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'
import { projectRoutes } from './modules/projects/project.routes.js'
import { contactRoutes } from './modules/contact/contact.routes.js'
import { postRoutes } from './modules/posts/post.routes.js'
import { settingsRoutes } from './modules/settings/settings.routes.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import { adminRoutes } from './routes/admin.routes.js'
import { sendSuccess } from './utils/response.js'

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.set('trust proxy', env.isProduction ? 1 : false)

  app.use(helmet())
  app.use(
    cors({
      origin(origin, callback) {
        // Non-browser clients (curl, health checks) send no Origin header.
        if (!origin || env.CLIENT_ORIGIN.includes(origin)) return callback(null, true)
        return callback(new Error('Not allowed by CORS'))
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type'],
      credentials: true,
      maxAge: 600,
    }),
  )
  app.use(cookieParser())

  // Admin bodies (blog posts) may be large; public bodies stay small. body-parser
  // skips already-parsed requests, so the admin parser must run first.
  app.use('/api/admin', express.json({ limit: '512kb' }))
  app.use(express.json({ limit: '32kb' }))

  app.use('/api', apiLimiter)

  app.get('/api/health', (_req, res) => {
    const db = databaseStatus()
    return sendSuccess(res, {
      message: db.connected ? 'API is healthy' : 'API is running but the database is not connected',
      data: {
        status: db.connected ? 'ok' : 'degraded',
        database: db.state,
        uptime: Math.round(process.uptime()),
        admin: env.adminEnabled ? 'enabled' : 'disabled',
      },
    })
  })

  app.use('/api/projects', projectRoutes)
  app.use('/api/contact', contactRoutes)
  app.use('/api/posts', postRoutes)
  app.use('/api/settings', settingsRoutes)
  app.use('/api/admin/auth', authRoutes)
  app.use('/api/admin', requireAdmin, adminRoutes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
