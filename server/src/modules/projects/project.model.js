import mongoose from 'mongoose'

export const PROJECT_STATUSES = ['prototype', 'in-progress', 'completed']

const urlValidator = {
  validator: (value) => !value || /^https:\/\/[^\s]+$/i.test(value),
  message: 'Must be an absolute https:// URL.',
}

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug may contain lowercase letters, numbers and single hyphens.'],
      maxlength: 80,
    },
    summary: { type: String, required: true, trim: true, maxlength: 400 },
    description: { type: String, trim: true, maxlength: 4000 },
    purpose: { type: String, trim: true, maxlength: 2000 },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    status: { type: String, enum: PROJECT_STATUSES, default: 'in-progress' },
    technologies: { type: [String], default: [] },
    features: { type: [String], default: [] },
    implementationNotes: { type: [String], default: [] },
    challenges: { type: [String], default: [] },
    role: { type: String, trim: true, maxlength: 160 },
    repositoryUrl: { type: String, trim: true, validate: urlValidator },
    liveUrl: { type: String, trim: true, validate: urlValidator },
    coverImage: { type: String, trim: true, maxlength: 500 },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(_doc, ret) {
        ret.id = String(ret._id)
        delete ret._id
        return ret
      },
    },
  },
)

projectSchema.index({ published: 1, featured: -1, order: 1 })

export const Project = mongoose.models.Project ?? mongoose.model('Project', projectSchema)
