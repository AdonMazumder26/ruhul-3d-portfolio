const rawBase = import.meta.env.PUBLIC_API_URL?.trim() ?? ''

function normalizeApiBase(value) {
  if (!value) return ''

  try {
    const url = new URL(value)
    if (url.pathname === '' || url.pathname === '/') url.pathname = '/api'
    return url.toString().replace(/\/+$/, '')
  } catch {
    // Keep relative/test values usable while still removing duplicate slashes.
    return value.replace(/\/+$/, '')
  }
}

export const API_BASE_URL = normalizeApiBase(rawBase)
export const apiConfigured = API_BASE_URL.length > 0

export class ApiRequestError extends Error {
  constructor(message, { status = 0, errors = [], cause } = {}) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.errors = errors
    this.cause = cause
  }
}

/**
 * Minimal fetch wrapper: JSON in/out, timeout, consistent error shape.
 * The server always responds with { success, message, data?, errors? }.
 */
export async function apiRequest(path, { method = 'GET', body, timeoutMs = 10000, signal } = {}) {
  if (!apiConfigured) {
    throw new ApiRequestError('API is not configured.', { status: 0 })
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  signal?.addEventListener('abort', () => controller.abort(), { once: true })

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      // Admin session is an httpOnly cookie; harmless for public routes.
      credentials: 'include',
      signal: controller.signal,
    })

    let payload = null
    try {
      payload = await response.json()
    } catch {
      payload = null
    }

    if (!response.ok || !payload?.success) {
      throw new ApiRequestError(payload?.message || `Request failed with status ${response.status}.`, {
        status: response.status,
        errors: Array.isArray(payload?.errors) ? payload.errors : [],
      })
    }

    return payload.data
  } catch (error) {
    if (error instanceof ApiRequestError) throw error
    const aborted = error?.name === 'AbortError'
    throw new ApiRequestError(aborted ? 'The request timed out.' : 'Could not reach the API.', {
      status: 0,
      cause: error,
    })
  } finally {
    clearTimeout(timer)
  }
}
