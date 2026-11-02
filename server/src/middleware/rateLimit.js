import { rateLimit } from 'express-rate-limit'

const message = { success: false, message: 'Too many requests. Please try again later.', errors: [] }

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message,
})

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { ...message, message: 'Too many messages were sent from this connection. Please try again in an hour.' },
})

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { ...message, message: 'Too many login attempts. Please wait 15 minutes and try again.' },
})
