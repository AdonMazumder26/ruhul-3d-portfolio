import mongoose from 'mongoose'

export const CONTACT_STATUSES = ['new', 'reviewed', 'archived']

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    subject: { type: String, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
    status: { type: String, enum: CONTACT_STATUSES, default: 'new' },
  },
  { timestamps: true, versionKey: false },
)

contactSchema.index({ status: 1, createdAt: -1 })

export const ContactMessage = mongoose.models.ContactMessage ?? mongoose.model('ContactMessage', contactSchema)
