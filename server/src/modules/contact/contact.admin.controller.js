import { ApiError } from '../../utils/ApiError.js'
import { sendSuccess } from '../../utils/response.js'
import {
  deleteContactMessage,
  findContactMessageById,
  listContactMessages,
  serializeContact,
  updateContactStatus,
} from './contact.service.js'

export async function adminListContacts(req, res) {
  const result = await listContactMessages(req.validated?.query ?? {})
  return sendSuccess(res, { message: 'Messages retrieved.', data: result })
}

export async function adminGetContact(req, res) {
  const message = await findContactMessageById(req.validated.params.id)
  if (!message) throw ApiError.notFound('Message not found.')
  return sendSuccess(res, { message: 'Message retrieved.', data: serializeContact(message) })
}

export async function adminUpdateContactStatus(req, res) {
  const message = await updateContactStatus(req.validated.params.id, req.body.status)
  if (!message) throw ApiError.notFound('Message not found.')
  return sendSuccess(res, { message: 'Message updated.', data: serializeContact(message) })
}

export async function adminDeleteContact(req, res) {
  const message = await deleteContactMessage(req.validated.params.id)
  if (!message) throw ApiError.notFound('Message not found.')
  return sendSuccess(res, { message: 'Message deleted.', data: { id: String(message._id) } })
}
