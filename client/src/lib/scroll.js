const HEADER_OFFSET = 72

export function scrollToId(id, { smooth = true } = {}) {
  const el = document.getElementById(id)
  if (!el) return false
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
  window.scrollTo({ top, behavior: smooth && !reduced ? 'smooth' : 'auto' })
  return true
}
