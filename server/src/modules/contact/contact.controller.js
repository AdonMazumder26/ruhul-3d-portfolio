import { sendSuccess } from '../../utils/response.js'
import { isSpam, saveContactMessage } from './contact.service.js'

export async function createContactMessage(req, res) {
  if (isSpam(req.body)) {
    // Silently accept so bots receive no useful signal; nothing is stored.
    return sendSuccess(res, { status: 202, message: 'Message received.', data: null })
  }

  const saved = await saveContactMessage(req.body)
  console.info(`[contact] New message ${saved.id} stored (${req.body.email.replace(/^(.).*(@.*)$/, '$1***$2')})`)
  return sendSuccess(res, {
    status: 201,
    message: 'Your message has been saved.',
    data: { id: saved.id, receivedAt: saved.createdAt },
  })
}
