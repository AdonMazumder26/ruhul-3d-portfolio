import { ContactMessage } from './contact.model.js'

export function isSpam({ website }) {
  return Boolean(website && website.trim().length > 0)
}

export async function saveContactMessage({ name, email, subject, message }) {
  const doc = await ContactMessage.create({
    name,
    email,
    subject: subject || undefined,
    message,
    status: 'new',
  })
  return { id: String(doc._id), createdAt: doc.createdAt }
}
