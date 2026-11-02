import { useCallback, useEffect, useState } from 'react'
import { fetchProjectBySlug, fetchProjects } from './projectService.js'

const LOADING = { status: 'loading', projects: [], source: null }

export function useProjects() {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ attempt: -1, ...LOADING })

  useEffect(() => {
    const controller = new AbortController()
    fetchProjects({ signal: controller.signal })
      .then(({ projects, source }) => setResult({ attempt, status: 'success', projects, source }))
      .catch(() => {
        if (!controller.signal.aborted) setResult({ attempt, status: 'error', projects: [], source: null })
      })
    return () => controller.abort()
  }, [attempt])

  const retry = useCallback(() => setAttempt((value) => value + 1), [])
  // Results from a previous attempt are treated as "loading" until the new one resolves.
  const current = result.attempt === attempt ? result : LOADING
  return { status: current.status, projects: current.projects, source: current.source, retry }
}

export function useProject(slug) {
  const [result, setResult] = useState({ slug: null, status: 'loading', project: null, source: null })

  useEffect(() => {
    const controller = new AbortController()
    fetchProjectBySlug(slug, { signal: controller.signal })
      .then(({ project, source }) =>
        setResult(
          project
            ? { slug, status: 'success', project, source }
            : { slug, status: 'not-found', project: null, source },
        ),
      )
      .catch(() => {
        if (!controller.signal.aborted) setResult({ slug, status: 'error', project: null, source: null })
      })
    return () => controller.abort()
  }, [slug])

  return result.slug === slug ? result : { status: 'loading', project: null, source: null }
}
