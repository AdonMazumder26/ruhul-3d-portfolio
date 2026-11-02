import mongoose from 'mongoose'

export const POST_STATUSES = ['draft', 'published']

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug may contain lowercase letters, numbers and single hyphens.'],
      maxlength: 120,
    },
    excerpt: { type: String, trim: true, maxlength: 400, default: '' },
    content: { type: String, required: true, maxlength: 60000 },
    coverImage: { type: String, trim: true, maxlength: 500, default: '' },
    tags: { type: [String], default: [] },
    status: { type: String, enum: POST_STATUSES, default: 'draft' },
    publishedAt: { type: Date, default: null },
    readingMinutes: { type: Number, default: 1 },
  },
  { timestamps: true, versionKey: false },
)

postSchema.index({ status: 1, publishedAt: -1 })
postSchema.index({ tags: 1 })

export const Post = mongoose.models.Post ?? mongoose.model('Post', postSchema)
