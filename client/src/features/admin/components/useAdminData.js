import { useCallback, useState } from 'react'
import { ApiRequestError } from '../../../lib/api.js'
import { useAdminAuth } from '../adminAuthContext.js'
import { useRequest } from './useRequest.js'

/**
 * Small data-loading hook for admin pages. `loader(signal)` must return a
 * promise. A 401 response expires the session globally.
 */
export function useAdminData(loader, deps = []) {
  const { expire } = useAdminAuth()
  const onError = useCallback(
    (error) => {
      if (error instanceof ApiRequestError && error.status === 401) expire()
    },
    [expire],
  )
  return useRequest(loader, deps, onError)
}

/** Wraps a mutation so 401s expire the session and the error message is surfaced. */
export function useMutation() {
  const { expire } = useAdminAuth()
  const [busy, setBusy] = useState(false)

  const run = useCallback(
    async (action, { onSuccess, onError } = {}) => {
      setBusy(true)
      try {
        const result = await action()
        onSuccess?.(result)
        return { ok: true, result }
      } catch (error) {
        if (error instanceof ApiRequestError && error.status === 401) expire()
        onError?.(error)
        return { ok: false, error }
      } finally {
        setBusy(false)
      }
    },
    [expire],
  )

  return { run, busy }
}

export const describeError = (error, fallback = 'Something went wrong.') =>
  error instanceof ApiRequestError ? error.message : fallback
