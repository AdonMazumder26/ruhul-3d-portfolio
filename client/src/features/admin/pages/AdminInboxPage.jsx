import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiArchive, FiCheck, FiMail, FiTrash2 } from 'react-icons/fi'
import { LoadingState } from '../../../components/ui/LoadingState.jsx'
import { ErrorState } from '../../../components/ui/ErrorState.jsx'
import { Badge } from '../../../components/ui/Badge.jsx'
import { adminApi } from '../adminApi.js'
import { AdminPageHeader } from '../AdminLayout.jsx'
import { ConfirmDialog } from '../components/Feedback.jsx'
import { useToast } from '../components/toastContext.js'
import { describeError, useAdminData, useMutation } from '../components/useAdminData.js'

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'archived', label: 'Archived' },
]

const statusTone = { new: 'cyan', reviewed: 'neutral', archived: 'neutral' }
const formatDate = (value) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

const actionButton =
  'inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium text-text transition-colors hover:border-cyan/60 disabled:opacity-50'

export function AdminInboxPage() {
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const filter = params.get('status') ?? ''
  const page = Number(params.get('page') ?? 1)
  const openId = params.get('open')

  const { status, data, error, reload, setData } = useAdminData(
    (signal) => adminApi.listContacts({ status: filter, page, limit: 20 }, signal),
    [filter, page],
  )
  const { run, busy } = useMutation()
  const [pendingDelete, setPendingDelete] = useState(null)

  const selected = useMemo(() => data?.items.find((item) => item.id === openId) ?? null, [data, openId])

  // Opening a "new" message marks it reviewed, like a mail client.
  useEffect(() => {
    if (!selected || selected.status !== 'new') return
    run(() => adminApi.patchContact(selected.id, 'reviewed'), {
      onSuccess: (updated) =>
        setData((current) => ({
          ...current,
          items: current.items.map((item) => (item.id === updated.id ? updated : item)),
          counts: { ...current.counts, new: Math.max(0, current.counts.new - 1), reviewed: current.counts.reviewed + 1 },
        })),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id])

  const update = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key === 'status') next.delete('page')
    setParams(next, { replace: key === 'open' })
  }

  const setStatus = (message, nextStatus) =>
    run(() => adminApi.patchContact(message.id, nextStatus), {
      onSuccess: () => {
        toast(`Marked as ${nextStatus}.`, { tone: 'success' })
        reload()
      },
      onError: (err) => toast(describeError(err, 'Update failed.'), { tone: 'error' }),
    })

  const confirmDelete = () =>
    run(() => adminApi.deleteContact(pendingDelete.id), {
      onSuccess: () => {
        toast('Message deleted.', { tone: 'success' })
        setPendingDelete(null)
        if (openId === pendingDelete.id) update('open', '')
        reload()
      },
      onError: (err) => toast(describeError(err, 'Delete failed.'), { tone: 'error' }),
    })

  return (
    <>
      <AdminPageHeader title="Inbox" description="Messages from the contact form. Only you can see these." />

      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter messages">
        {FILTERS.map((item) => {
          const count = item.value ? data?.counts?.[item.value] : data ? Object.values(data.counts).reduce((a, b) => a + b, 0) : undefined
          return (
            <button
              key={item.value}
              type="button"
              aria-pressed={filter === item.value}
              onClick={() => update('status', item.value)}
              className={`min-h-9 rounded-full border px-3.5 text-sm transition-colors ${
                filter === item.value ? 'border-cyan bg-cyan/10 text-text' : 'border-border text-muted hover:text-text'
              }`}
            >
              {item.label}
              {typeof count === 'number' ? <span className="ml-1.5 font-mono text-xs text-muted">{count}</span> : null}
            </button>
          )
        })}
      </div>

      {status === 'loading' ? <LoadingState label="Loading messages…" lines={5} /> : null}
      {status === 'error' && !data ? <ErrorState title="Could not load the inbox" message={describeError(error)} onRetry={reload} /> : null}

      {data ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="card overflow-hidden">
            {data.items.length === 0 ? (
              <p className="p-6 text-sm text-muted">No messages{filter ? ` with status “${filter}”` : ''}.</p>
            ) : (
              <ul className="divide-y divide-border/70">
                {data.items.map((message) => (
                  <li key={message.id}>
                    <button
                      type="button"
                      onClick={() => update('open', message.id)}
                      aria-current={openId === message.id ? 'true' : undefined}
                      className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-elevated/50 ${openId === message.id ? 'bg-elevated/60' : ''}`}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className={`truncate ${message.status === 'new' ? 'font-semibold text-text' : 'text-text'}`}>{message.name}</span>
                        <span className="shrink-0 text-xs text-muted">{formatDate(message.createdAt)}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <Badge tone={statusTone[message.status]}>{message.status}</Badge>
                        <span className="truncate text-sm text-muted">{message.subject || message.message}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {data.pages > 1 ? (
              <div className="flex items-center justify-between border-t border-border/70 px-4 py-2 text-sm">
                <button type="button" className={actionButton} disabled={page <= 1} onClick={() => update('page', String(page - 1))}>
                  Previous
                </button>
                <span className="text-muted">
                  Page {data.page} of {data.pages}
                </span>
                <button type="button" className={actionButton} disabled={page >= data.pages} onClick={() => update('page', String(page + 1))}>
                  Next
                </button>
              </div>
            ) : null}
          </div>

          <div className="card p-5 sm:p-6">
            {selected ? (
              <article>
                <header className="flex flex-col gap-3 border-b border-border/70 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-xl">{selected.subject || '(no subject)'}</h2>
                    <p className="mt-1 text-sm text-muted">
                      <span className="text-text">{selected.name}</span> ·{' '}
                      <a href={`mailto:${selected.email}`} className="text-cyan hover:underline">
                        {selected.email}
                      </a>
                    </p>
                    <p className="mt-1 text-xs text-muted">{formatDate(selected.createdAt)}</p>
                  </div>
                  <Badge tone={statusTone[selected.status]}>{selected.status}</Badge>
                </header>
                <p className="mt-5 whitespace-pre-wrap text-[15px] leading-relaxed text-text">{selected.message}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject || 'your message'}`)}`}
                    className={actionButton}
                  >
                    <FiMail aria-hidden="true" /> Reply by email
                  </a>
                  {selected.status !== 'reviewed' ? (
                    <button type="button" className={actionButton} disabled={busy} onClick={() => setStatus(selected, 'reviewed')}>
                      <FiCheck aria-hidden="true" /> Mark reviewed
                    </button>
                  ) : null}
                  {selected.status !== 'archived' ? (
                    <button type="button" className={actionButton} disabled={busy} onClick={() => setStatus(selected, 'archived')}>
                      <FiArchive aria-hidden="true" /> Archive
                    </button>
                  ) : (
                    <button type="button" className={actionButton} disabled={busy} onClick={() => setStatus(selected, 'new')}>
                      Move to new
                    </button>
                  )}
                  <button
                    type="button"
                    className={`${actionButton} hover:border-orange/60 hover:text-orange`}
                    disabled={busy}
                    onClick={() => setPendingDelete(selected)}
                  >
                    <FiTrash2 aria-hidden="true" /> Delete
                  </button>
                </div>
              </article>
            ) : (
              <p className="text-sm text-muted">Select a message to read it.</p>
            )}
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this message?"
        message={`The message from ${pendingDelete?.name} will be permanently removed.`}
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}
