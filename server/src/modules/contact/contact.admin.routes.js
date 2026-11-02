import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { requireDatabase } from '../../middleware/requireDatabase.js'
import { contactIdParamsSchema, contactListQuerySchema, contactStatusSchema } from './contact.schema.js'
import {
  adminDeleteContact,
  adminGetContact,
  adminListContacts,
  adminUpdateContactStatus,
} from './contact.admin.controller.js'

// Mounted under /api/admin/contacts behind requireAdmin. The only place submissions can be read.
export const contactAdminRoutes = Router()

contactAdminRoutes.use(requireDatabase)
contactAdminRoutes.get('/', validate(contactListQuerySchema, 'query'), adminListContacts)
contactAdminRoutes.get('/:id', validate(contactIdParamsSchema, 'params'), adminGetContact)
contactAdminRoutes.patch('/:id', validate(contactIdParamsSchema, 'params'), validate(contactStatusSchema), adminUpdateContactStatus)
contactAdminRoutes.delete('/:id', validate(contactIdParamsSchema, 'params'), adminDeleteContact)
