import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'
import { ADMIN_COOKIE, verifyToken } from '../modules/auth/auth.service.js'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

/**
 * Guards admin routes with the httpOnly session cookie. State-changing
 * requests must also come from an allowed origin (defence in depth against CSRF
 * on top of SameSite cookies and strict CORS).
 */
export function requireAdmin(req, _res, next) {
  if (!env.adminEnabled) return next(ApiError.serviceUnavailable('Admin features are not configured on this server.'))

  const payload = verifyToken(req.cookies?.[ADMIN_COOKIE] ?? '')
  if (!payload) return next(ApiError.unauthorized('Please sign in to continue.'))

  if (!SAFE_METHODS.has(req.method)) {
    const origin = req.get('origin')
    if (origin && !env.CLIENT_ORIGIN.includes(origin.replace(/\/+$/, ''))) {
      return next(ApiError.forbidden('Cross-origin admin requests are not allowed.'))
    }
  }

  req.admin = payload
  return next()
}
