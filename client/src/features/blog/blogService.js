import { apiConfigured, apiRequest } from '../../lib/api.js'

export const blogAvailable = apiConfigured

export const formatPostDate = (value) =>
  value ? new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(new Date(value)) : ''

export async function fetchPosts({ tag, page = 1, signal } = {}) {
  const params = new URLSearchParams()
  if (tag) params.set('tag', tag)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return apiRequest(`/posts${query ? `?${query}` : ''}`, { signal })
}

export async function fetchPostBySlug(slug, { signal } = {}) {
  return apiRequest(`/posts/${encodeURIComponent(slug)}`, { signal })
}
