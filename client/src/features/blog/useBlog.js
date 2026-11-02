import { useCallback, useEffect, useState } from 'react'
import { ApiRequestError } from '../../lib/api.js'
import { fetchPostBySlug, fetchPosts } from './blogService.js'

export function usePosts({ tag, page }) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ key: null, status: 'loading', data: null })
  const key = `${tag ?? ''}|${page}|${attempt}`

  useEffect(() => {
    const controller = new AbortController()
    fetchPosts({ tag, page, signal: controller.signal })
      .then((data) => setState({ key, status: 'success', data }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ key, status: 'error', data: null })
      })
    return () => controller.abort()
  }, [tag, page, key])

  const retry = useCallback(() => setAttempt((value) => value + 1), [])
  const current = state.key === key ? state : { status: 'loading', data: null }
  return { status: current.status, data: current.data, retry }
}

export function usePost(slug) {
  const [state, setState] = useState({ slug: null, status: 'loading', post: null })

  useEffect(() => {
    const controller = new AbortController()
    fetchPostBySlug(slug, { signal: controller.signal })
      .then((post) => setState({ slug, status: 'success', post }))
      .catch((error) => {
        if (controller.signal.aborted) return
        const notFound = error instanceof ApiRequestError && (error.status === 404 || error.status === 400)
        setState({ slug, status: notFound ? 'not-found' : 'error', post: null })
      })
    return () => controller.abort()
  }, [slug])

  return state.slug === slug ? state : { status: 'loading', post: null }
}
