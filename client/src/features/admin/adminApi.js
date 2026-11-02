import { apiRequest } from '../../lib/api.js'

const q = (params) => {
  const search = new URLSearchParams()
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  })
  const text = search.toString()
  return text ? `?${text}` : ''
}

export const adminApi = {
  // auth
  login: (email, password) => apiRequest('/admin/auth/login', { method: 'POST', body: { email, password } }),
  logout: () => apiRequest('/admin/auth/logout', { method: 'POST' }),
  me: (signal) => apiRequest('/admin/auth/me', { signal }),

  overview: (signal) => apiRequest('/admin/overview', { signal }),

  // projects
  listProjects: (signal) => apiRequest('/admin/projects', { signal }),
  getProject: (id, signal) => apiRequest(`/admin/projects/${id}`, { signal }),
  createProject: (input) => apiRequest('/admin/projects', { method: 'POST', body: input }),
  updateProject: (id, input) => apiRequest(`/admin/projects/${id}`, { method: 'PUT', body: input }),
  patchProject: (id, patch) => apiRequest(`/admin/projects/${id}`, { method: 'PATCH', body: patch }),
  deleteProject: (id) => apiRequest(`/admin/projects/${id}`, { method: 'DELETE' }),
  reorderProjects: (ids) => apiRequest('/admin/projects/order', { method: 'PUT', body: { ids } }),

  // contacts
  listContacts: (params, signal) => apiRequest(`/admin/contacts${q(params)}`, { signal }),
  patchContact: (id, status) => apiRequest(`/admin/contacts/${id}`, { method: 'PATCH', body: { status } }),
  deleteContact: (id) => apiRequest(`/admin/contacts/${id}`, { method: 'DELETE' }),

  // posts
  listPosts: (params, signal) => apiRequest(`/admin/posts${q(params)}`, { signal }),
  getPost: (id, signal) => apiRequest(`/admin/posts/${id}`, { signal }),
  createPost: (input) => apiRequest('/admin/posts', { method: 'POST', body: input, timeoutMs: 20000 }),
  updatePost: (id, input) => apiRequest(`/admin/posts/${id}`, { method: 'PUT', body: input, timeoutMs: 20000 }),
  patchPost: (id, patch) => apiRequest(`/admin/posts/${id}`, { method: 'PATCH', body: patch }),
  deletePost: (id) => apiRequest(`/admin/posts/${id}`, { method: 'DELETE' }),

  // theme
  getTheme: (signal) => apiRequest('/admin/settings/theme', { signal }),
  saveTheme: (theme) => apiRequest('/admin/settings/theme', { method: 'PUT', body: theme }),
  resetTheme: () => apiRequest('/admin/settings/theme', { method: 'DELETE' }),
}
