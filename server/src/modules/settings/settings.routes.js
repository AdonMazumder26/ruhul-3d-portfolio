import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { requireDatabase } from '../../middleware/requireDatabase.js'
import { sendSuccess } from '../../utils/response.js'
import { DEFAULT_THEME, FONT_OPTIONS, themeSchema } from './settings.schema.js'
import { getTheme, resetTheme, saveTheme } from './settings.service.js'

export const settingsRoutes = Router()

settingsRoutes.get('/theme', requireDatabase, async (_req, res) => {
  const result = await getTheme()
  // Always revalidate (ETag -> 304) so a saved theme shows up on the next load.
  res.set('Cache-Control', 'no-cache')
  return sendSuccess(res, { message: 'Theme retrieved.', data: result })
})

// Mounted under /api/admin/settings behind requireAdmin.
export const settingsAdminRoutes = Router()

settingsAdminRoutes.use(requireDatabase)

settingsAdminRoutes.get('/theme', async (_req, res) => {
  const result = await getTheme()
  return sendSuccess(res, {
    message: 'Theme retrieved.',
    data: { ...result, defaults: DEFAULT_THEME, fontOptions: FONT_OPTIONS },
  })
})

settingsAdminRoutes.put('/theme', validate(themeSchema), async (req, res) => {
  const result = await saveTheme(req.body)
  return sendSuccess(res, { message: 'Theme saved.', data: result })
})

settingsAdminRoutes.delete('/theme', async (_req, res) => {
  const result = await resetTheme()
  return sendSuccess(res, { message: 'Theme reset to defaults.', data: result })
})
