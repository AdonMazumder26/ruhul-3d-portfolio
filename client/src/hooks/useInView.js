import { useEffect, useRef, useState } from 'react'

const supported = typeof IntersectionObserver !== 'undefined'

/**
 * Tracks whether an element is near/in the viewport.
 * `once` keeps the value true after the first intersection (used to lazy-mount scenes).
 */
export function useInView({ rootMargin = '0px', threshold = 0, once = false } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(!supported)

  useEffect(() => {
    const node = ref.current
    if (!node || !supported) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { rootMargin, threshold },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [rootMargin, threshold, once])

  return [ref, inView]
}
