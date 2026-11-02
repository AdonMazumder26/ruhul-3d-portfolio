import { useCallback, useEffect, useState } from 'react'

/**
 * Runs `loader(signal)` whenever `deps` change (or reload() is called) and
 * derives the status from a request key, so no state is set synchronously
 * inside the effect. Previous data is kept while refreshing.
 */
export function useRequest(loader, deps = [], onError) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ key: null, data: null, error: null })
  const key = JSON.stringify([attempt, ...deps])

  useEffect(() => {
    const controller = new AbortController()
    loader(controller.signal)
      .then((data) => setState({ key, data, error: null }))
      .catch((error) => {
        if (controller.signal.aborted) return
        onError?.(error)
        setState((current) => ({ key, data: current.data, error }))
      })
    return () => controller.abort()
    // The loader is recreated on every render; `key` captures everything it depends on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const reload = useCallback(() => setAttempt((value) => value + 1), [])
  const setData = useCallback((updater) => {
    setState((current) => ({ ...current, data: typeof updater === 'function' ? updater(current.data) : updater }))
  }, [])

  const settled = state.key === key
  const status = settled ? (state.error ? 'error' : 'success') : state.data ? 'refreshing' : 'loading'

  return { status, data: state.data, error: settled ? state.error : null, reload, setData }
}
