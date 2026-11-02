import { SiteSettings } from './settings.model.js'
import { DEFAULT_THEME, themeSchema } from './settings.schema.js'

const THEME_KEY = 'theme'

/** Stored themes are merged over defaults so new fields always have a value. */
function withDefaults(stored) {
  const merged = {
    colors: { ...DEFAULT_THEME.colors, ...(stored?.colors ?? {}) },
    fonts: { ...DEFAULT_THEME.fonts, ...(stored?.fonts ?? {}) },
    hero: { ...DEFAULT_THEME.hero, ...(stored?.hero ?? {}) },
    skills: { ...DEFAULT_THEME.skills, ...(stored?.skills ?? {}) },
  }
  const result = themeSchema.safeParse(merged)
  return result.success ? result.data : { ...DEFAULT_THEME }
}

export async function getTheme() {
  const doc = await SiteSettings.findOne({ key: THEME_KEY }).lean()
  return { theme: withDefaults(doc?.value), customized: Boolean(doc), updatedAt: doc?.updatedAt ?? null }
}

export async function saveTheme(theme) {
  const doc = await SiteSettings.findOneAndUpdate(
    { key: THEME_KEY },
    { $set: { value: theme } },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true },
  ).lean()
  return { theme: withDefaults(doc.value), customized: true, updatedAt: doc.updatedAt }
}

export async function resetTheme() {
  await SiteSettings.deleteOne({ key: THEME_KEY })
  return { theme: { ...DEFAULT_THEME }, customized: false, updatedAt: null }
}
