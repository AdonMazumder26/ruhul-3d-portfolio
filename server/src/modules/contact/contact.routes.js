import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { requireDatabase } from '../../middleware/requireDatabase.js'
import { contactLimiter } from '../../middleware/rateLimit.js'
import { contactSchema } from './contact.schema.js'
import { createContactMessage } from './contact.controller.js'

export const contactRoutes = Router()

// Deliberately POST-only: submissions are never readable through the public API.
contactRoutes.post('/', contactLimiter, validate(contactSchema), requireDatabase, createContactMessage)
