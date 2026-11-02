import { createContext, useContext } from 'react'
import { DEFAULT_THEME } from './themeDefaults.js'

export const ThemeContext = createContext({
  theme: DEFAULT_THEME,
  saved: DEFAULT_THEME,
  status: 'default',
  preview: null,
  setPreview: () => {},
  setSaved: () => {},
  refresh: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}
