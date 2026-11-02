/** Mirrors server/src/modules/settings/settings.schema.js. */
export const DEFAULT_THEME = Object.freeze({
  colors: {
    bg: '#0b0d12',
    surface: '#171b24',
    elevated: '#202633',
    border: '#2a3140',
    text: '#f3f4f6',
    muted: '#a1a8b5',
    accent: '#67e8f9',
    accentAlt: '#ff9d65',
  },
  fonts: {
    display: 'Space Grotesk',
    sans: 'Inter',
  },
  hero: {
    scene3d: true,
    stars: true,
    satellites: true,
    tagline: '',
  },
  skills: {
    animated: true,
  },
})

export const FONT_OPTIONS = ['Space Grotesk', 'Inter', 'Sora', 'Outfit', 'Manrope', 'Syne', 'DM Sans', 'Plus Jakarta Sans']

export const COLOR_LABELS = {
  bg: 'Background',
  surface: 'Surface',
  elevated: 'Elevated surface',
  border: 'Borders',
  text: 'Text',
  muted: 'Muted text',
  accent: 'Primary accent',
  accentAlt: 'Secondary accent',
}

const FALLBACKS = {
  display: 'ui-sans-serif, system-ui, "Segoe UI", sans-serif',
  sans: 'ui-sans-serif, system-ui, "Segoe UI", Roboto, sans-serif',
}

export function fontStack(family, role) {
  return `"${family}", ${FALLBACKS[role] ?? FALLBACKS.sans}`
}

export function mergeTheme(partial) {
  return {
    colors: { ...DEFAULT_THEME.colors, ...(partial?.colors ?? {}) },
    fonts: { ...DEFAULT_THEME.fonts, ...(partial?.fonts ?? {}) },
    hero: { ...DEFAULT_THEME.hero, ...(partial?.hero ?? {}) },
    skills: { ...DEFAULT_THEME.skills, ...(partial?.skills ?? {}) },
  }
}

const HEX = /^#[0-9a-f]{6}$/i

export function isHex(value) {
  return HEX.test(value ?? '')
}

/** Lightens a hex colour by mixing towards white (used for hover states). */
export function lighten(hex, amount = 0.18) {
  if (!isHex(hex)) return hex
  const n = parseInt(hex.slice(1), 16)
  const mix = (channel) => Math.round(channel + (255 - channel) * amount)
  const r = mix((n >> 16) & 255)
  const g = mix((n >> 8) & 255)
  const b = mix(n & 255)
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}
