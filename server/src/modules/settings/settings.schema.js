import { z } from 'zod'

/** Google Fonts families the client knows how to load. Keep in sync with client/src/features/theme/fonts.js. */
export const FONT_OPTIONS = ['Space Grotesk', 'Inter', 'Sora', 'Outfit', 'Manrope', 'Syne', 'DM Sans', 'Plus Jakarta Sans']

const hex = z.string().trim().regex(/^#[0-9a-f]{6}$/i, 'Use a 6-digit hex colour like #67e8f9.').transform((v) => v.toLowerCase())

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

export const themeSchema = z
  .object({
    colors: z
      .object({
        bg: hex,
        surface: hex,
        elevated: hex,
        border: hex,
        text: hex,
        muted: hex,
        accent: hex,
        accentAlt: hex,
      })
      .strict(),
    fonts: z
      .object({
        display: z.enum(FONT_OPTIONS),
        sans: z.enum(FONT_OPTIONS),
      })
      .strict(),
    hero: z
      .object({
        scene3d: z.boolean(),
        stars: z.boolean(),
        satellites: z.boolean(),
        tagline: z.string().trim().max(160).default(''),
      })
      .strict(),
    skills: z
      .object({
        animated: z.boolean(),
      })
      .strict(),
  })
  .strict()
