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

export function serializeContact(doc) {
  if (!doc) return null
  const { _id, ...rest } = doc
  return { id: String(_id), ...rest }
}

export async function listContactMessages({ status, page = 1, limit = 20 } = {}) {
  const filter = status ? { status } : {}
  const [items, total, counts] = await Promise.all([
    ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ContactMessage.countDocuments(filter),
    ContactMessage.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ])
  const byStatus = Object.fromEntries(counts.map((row) => [row._id, row.count]))
  return {
    items: items.map(serializeContact),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    counts: { new: byStatus.new ?? 0, reviewed: byStatus.reviewed ?? 0, archived: byStatus.archived ?? 0 },
  }
}

export async function findContactMessageById(id) {
  return ContactMessage.findById(id).lean()
}

export async function updateContactStatus(id, status) {
  return ContactMessage.findByIdAndUpdate(id, { $set: { status } }, { returnDocument: 'after', runValidators: true }).lean()
}

export async function deleteContactMessage(id) {
  return ContactMessage.findByIdAndDelete(id).lean()
}
