import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiConfigured, apiRequest } from '../../lib/api.js'
import { DEFAULT_THEME, fontStack, lighten, mergeTheme } from './themeDefaults.js'
import { ThemeContext } from './themeContext.js'

// Fonts already linked from index.html.
const PRELOADED_FONTS = new Set(['Inter', 'Space Grotesk', 'JetBrains Mono'])
const FONT_LINK_ID = 'theme-fonts'

function ensureFonts(families) {
  const needed = [...new Set(families)].filter((family) => !PRELOADED_FONTS.has(family))
  const existing = document.getElementById(FONT_LINK_ID)
  if (needed.length === 0) {
    existing?.remove()
    return
  }
  const href = `https://fonts.googleapis.com/css2?${needed
    .map((family) => `family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@400;500;600;700`)
    .join('&')}&display=swap`
  if (existing?.getAttribute('href') === href) return
  const link = existing ?? Object.assign(document.createElement('link'), { id: FONT_LINK_ID, rel: 'stylesheet' })
  link.setAttribute('href', href)
  if (!existing) document.head.appendChild(link)
}

/** Writes the theme into the CSS variables that Tailwind utilities reference. */
function applyTheme(theme) {
  const root = document.documentElement.style
  const { colors, fonts } = theme
  root.setProperty('--color-bg', colors.bg)
  root.setProperty('--color-surface', colors.surface)
  root.setProperty('--color-elevated', colors.elevated)
  root.setProperty('--color-border', colors.border)
  root.setProperty('--color-text', colors.text)
  root.setProperty('--color-muted', colors.muted)
  root.setProperty('--color-cyan', colors.accent)
  root.setProperty('--color-cyan-hover', lighten(colors.accent))
  root.setProperty('--color-orange', colors.accentAlt)
  root.setProperty('--font-display', fontStack(fonts.display, 'display'))
  root.setProperty('--font-sans', fontStack(fonts.sans, 'sans'))
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', colors.bg)
  ensureFonts([fonts.display, fonts.sans])
}

export function ThemeProvider({ children }) {
  const [saved, setSaved] = useState(DEFAULT_THEME)
  const [status, setStatus] = useState(apiConfigured ? 'loading' : 'default')
  const [preview, setPreview] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!apiConfigured) return undefined
    const controller = new AbortController()
    apiRequest('/settings/theme', { signal: controller.signal })
      .then((data) => {
        setSaved(mergeTheme(data?.theme))
        setStatus('ready')
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus('default')
      })
    return () => controller.abort()
  }, [attempt])

  const theme = useMemo(() => (preview ? mergeTheme(preview) : saved), [preview, saved])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const refresh = useCallback(() => setAttempt((value) => value + 1), [])

  const value = useMemo(
    () => ({ theme, saved, status, preview, setPreview, refresh, setSaved }),
    [theme, saved, status, preview, refresh],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
