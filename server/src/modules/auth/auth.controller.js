import { env } from '../../config/env.js'
import { ApiError } from '../../utils/ApiError.js'
import { sendSuccess } from '../../utils/response.js'
import { ADMIN_COOKIE, cookieOptions, issueToken, verifyCredentials } from './auth.service.js'

export async function login(req, res) {
  if (!env.adminEnabled) throw ApiError.serviceUnavailable('Admin login is not configured on this server.')

  const { email, password } = req.body
  const valid = await verifyCredentials(email, password)
  if (!valid) throw ApiError.unauthorized('Incorrect email or password.')

  res.cookie(ADMIN_COOKIE, issueToken(), cookieOptions())
  return sendSuccess(res, { message: 'Signed in.', data: { email: env.ADMIN_EMAIL } })
}

export function logout(_req, res) {
  const { maxAge: _maxAge, ...options } = cookieOptions()
  res.clearCookie(ADMIN_COOKIE, options)
  return sendSuccess(res, { message: 'Signed out.' })
}

export function me(req, res) {
  return sendSuccess(res, { message: 'Session is valid.', data: { email: req.admin.email } })
}
