import { useMemo } from 'react'

let cachedSupport = null

function detectWebGL() {
  if (cachedSupport !== null) return cachedSupport
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    cachedSupport = Boolean(gl)
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    cachedSupport = false
  }
  return cachedSupport
}

/**
 * Returns a capability profile used to decide whether to mount a 3D scene
 * and how rich it should be. Deliberately conservative on low-end devices.
 */
export function useDeviceCapability() {
  return useMemo(() => {
    if (typeof window === 'undefined') {
      return { webgl: false, tier: 'low', saveData: false }
    }
    const webgl = detectWebGL()
    const cores = navigator.hardwareConcurrency ?? 4
    const memory = navigator.deviceMemory ?? 4
    const saveData = Boolean(navigator.connection?.saveData)
    const narrow = window.matchMedia('(max-width: 640px)').matches

    let tier = 'high'
    if (narrow || cores <= 4 || memory <= 4) tier = 'medium'
    if (saveData || cores <= 2 || memory <= 2) tier = 'low'

    return { webgl, tier, saveData }
  }, [])
}
