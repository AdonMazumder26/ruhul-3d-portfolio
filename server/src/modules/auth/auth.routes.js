import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { requireAdmin } from '../../middleware/requireAdmin.js'
import { loginLimiter } from '../../middleware/rateLimit.js'
import { loginSchema } from './auth.schema.js'
import { login, logout, me } from './auth.controller.js'

export const authRoutes = Router()

authRoutes.post('/login', loginLimiter, validate(loginSchema), login)
authRoutes.post('/logout', logout)
authRoutes.get('/me', requireAdmin, me)
