import { createContext, useContext } from 'react'

export const ToastContext = createContext(() => {})

/** toast(message, { tone: 'success' | 'error' | 'info' }) */
export function useToast() {
  return useContext(ToastContext)
}
