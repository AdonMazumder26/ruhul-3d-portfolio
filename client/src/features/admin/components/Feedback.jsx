import { useCallback, useEffect, useRef, useState } from 'react'
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi'
import { ToastContext } from './toastContext.js'

const icons = { success: FiCheckCircle, error: FiAlertCircle, info: FiInfo }
const tones = {
  success: 'border-cyan/40 text-cyan',
  error: 'border-orange/50 text-orange',
  info: 'border-border text-text',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const counter = useRef(0)

  const dismiss = useCallback((id) => setToasts((current) => current.filter((toast) => toast.id !== id)), [])

  const toast = useCallback(
    (message, { tone = 'info', duration = 4000 } = {}) => {
      counter.current += 1
      const id = counter.current
      setToasts((current) => [...current.slice(-3), { id, message, tone }])
      if (duration > 0) setTimeout(() => dismiss(id), duration)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6">
        {toasts.map((item) => {
          const Icon = icons[item.tone] ?? FiInfo
          return (
            <div
              key={item.id}
              role="status"
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border bg-surface/95 px-4 py-3 text-sm shadow-xl backdrop-blur ${tones[item.tone] ?? tones.info}`}
            >
              <Icon aria-hidden="true" className="mt-0.5 shrink-0" />
              <p className="flex-1 text-text">{item.message}</p>
              <button type="button" onClick={() => dismiss(item.id)} aria-label="Dismiss" className="-m-1 grid size-7 place-items-center rounded text-muted hover:text-text">
                <FiX aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

/** Simple accessible confirm dialog. */
export function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', destructive = true, onConfirm, onCancel, busy }) {
  const confirmRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    confirmRef.current?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-bg/70 p-4 backdrop-blur-sm" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="card w-full max-w-md p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-title" className="text-lg">
          {title}
        </h2>
        <p id="confirm-message" className="mt-2 text-sm text-muted">
          {message}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="min-h-10 rounded-full border border-border px-4 text-sm text-text hover:bg-elevated">
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={`min-h-10 rounded-full px-4 text-sm font-medium disabled:opacity-60 ${
              destructive ? 'bg-orange text-bg hover:brightness-110' : 'bg-cyan text-bg hover:bg-cyan-hover'
            }`}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
