import { apiConfigured, apiRequest, ApiRequestError } from '../../lib/api.js'
import { fallbackProjects } from '../../data/fallbackProjects.js'

const sortProjects = (list) =>
  [...list].sort((a, b) => Number(b.featured) - Number(a.featured) || (a.order ?? 0) - (b.order ?? 0) || a.title.localeCompare(b.title))

/**
 * Loads projects from the API when configured and reachable, otherwise falls
 * back to the local dataset. The returned `source` lets the UI be honest about
 * where the data came from.
 */
export async function fetchProjects({ signal } = {}) {
  if (!apiConfigured) {
    return { projects: sortProjects(fallbackProjects), source: 'fallback' }
  }
  try {
    const data = await apiRequest('/projects', { signal })
    const list = Array.isArray(data) ? data : []
    if (list.length === 0) {
      return { projects: sortProjects(fallbackProjects), source: 'fallback' }
    }
    return { projects: sortProjects(list), source: 'api' }
  } catch (error) {
    if (signal?.aborted) throw error
    return { projects: sortProjects(fallbackProjects), source: 'fallback', error }
  }
}

export async function fetchProjectBySlug(slug, { signal } = {}) {
  const local = fallbackProjects.find((project) => project.slug === slug) ?? null
  if (!apiConfigured) {
    return { project: local, source: 'fallback' }
  }
  try {
    const project = await apiRequest(`/projects/${encodeURIComponent(slug)}`, { signal })
    return { project, source: 'api' }
  } catch (error) {
    if (signal?.aborted) throw error
    // A definitive 404 from the API should win over local data only when the API is otherwise healthy.
    if (error instanceof ApiRequestError && error.status === 404) {
      return { project: local, source: local ? 'fallback' : 'api', notFound: !local }
    }
    return { project: local, source: 'fallback', error }
  }
}
