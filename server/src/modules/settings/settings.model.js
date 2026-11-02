import mongoose from 'mongoose'

const siteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true, versionKey: false, minimize: false },
)

export const SiteSettings = mongoose.models.SiteSettings ?? mongoose.model('SiteSettings', siteSettingsSchema)
