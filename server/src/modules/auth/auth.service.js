import { timingSafeEqual } from 'node:crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env.js'

export const ADMIN_COOKIE = 'ruhul_admin'

// Dummy hash so a wrong email costs the same time as a wrong password.
const DUMMY_HASH = bcrypt.hashSync('not-the-real-password', 10)

function safeEqual(a, b) {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
}

export async function verifyCredentials(email, password) {
  if (!env.adminEnabled) return false
  const emailMatches = safeEqual(email.trim().toLowerCase(), env.ADMIN_EMAIL)
  const passwordMatches = await bcrypt.compare(password, emailMatches ? env.ADMIN_PASSWORD_HASH : DUMMY_HASH)
  return emailMatches && passwordMatches
}

export function issueToken() {
  return jwt.sign({ role: 'admin', email: env.ADMIN_EMAIL }, env.JWT_SECRET, {
    subject: 'admin',
    expiresIn: `${env.ADMIN_SESSION_DAYS}d`,
    issuer: 'ruhul-portfolio',
  })
}

export function verifyToken(token) {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { issuer: 'ruhul-portfolio', subject: 'admin' })
    return payload?.role === 'admin' ? payload : null
  } catch {
    return null
  }
}

export function cookieOptions() {
  return {
    httpOnly: true,
    // Cross-site deployments (API on another domain) need SameSite=None + Secure.
    sameSite: env.isProduction ? 'none' : 'lax',
    secure: env.isProduction,
    path: '/api',
    maxAge: env.ADMIN_SESSION_DAYS * 24 * 60 * 60 * 1000,
  }
}
