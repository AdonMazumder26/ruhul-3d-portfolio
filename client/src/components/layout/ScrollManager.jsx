import { useEffect, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { scrollToId } from '../../lib/scroll.js'

/**
 * Handles scroll position on route change: hash targets scroll to the section,
 * other navigations start at the top.
 */
export function ScrollManager() {
  const { pathname, hash, key } = useLocation()

  useLayoutEffect(() => {
    if (hash) return
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, key, hash])

  useEffect(() => {
    if (!hash) return undefined
    const id = hash.slice(1)
    // Content may render after navigation; retry briefly.
    let attempts = 0
    const timer = setInterval(() => {
      attempts += 1
      if (scrollToId(id) || attempts > 20) clearInterval(timer)
    }, 50)
    return () => clearInterval(timer)
  }, [hash, key])

  return null
}
