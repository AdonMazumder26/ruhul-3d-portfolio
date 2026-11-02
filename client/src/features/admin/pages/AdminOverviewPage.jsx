import { Link } from 'react-router-dom'
import { FiArrowRight, FiBookOpen, FiFolder, FiInbox, FiPlus } from 'react-icons/fi'
import { LoadingState } from '../../../components/ui/LoadingState.jsx'
import { ErrorState } from '../../../components/ui/ErrorState.jsx'
import { Badge } from '../../../components/ui/Badge.jsx'
import { adminApi } from '../adminApi.js'
import { AdminPageHeader } from '../AdminLayout.jsx'
import { describeError, useAdminData } from '../components/useAdminData.js'

function Stat({ icon: Icon, label, value, detail, to }) {
  return (
    <Link to={to} className="card group flex items-start gap-4 p-5 transition-colors hover:border-cyan/50">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-cyan/10 text-cyan">
        <Icon aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-1 font-display text-3xl font-semibold">{value}</p>
        {detail ? <p className="mt-1 text-xs text-muted">{detail}</p> : null}
      </div>
      <FiArrowRight aria-hidden="true" className="mt-1 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-text" />
    </Link>
  )
}

const formatDate = (value) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

export function AdminOverviewPage() {
  const { status, data, error, reload } = useAdminData((signal) => adminApi.overview(signal))

  return (
    <>
      <AdminPageHeader
        title="Overview"
        description="What's live, what's in draft and who has written to you."
        actions={
          <>
            <Link to="/admin/projects/new" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-cyan px-4 text-sm font-medium text-bg hover:bg-cyan-hover">
              <FiPlus aria-hidden="true" /> New project
            </Link>
            <Link to="/admin/posts/new" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium text-text hover:border-cyan/60">
              <FiPlus aria-hidden="true" /> New post
            </Link>
          </>
        }
      />

      {status === 'loading' ? <LoadingState label="Loading overview…" lines={4} /> : null}
      {status === 'error' && !data ? <ErrorState title="Could not load the overview" message={describeError(error)} onRetry={reload} /> : null}

      {data ? (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Stat
              icon={FiFolder}
              label="Projects"
              value={data.projects.total}
              detail={`${data.projects.published} published · ${data.projects.drafts} draft`}
              to="/admin/projects"
            />
            <Stat
              icon={FiBookOpen}
              label="Blog posts"
              value={data.posts.total}
              detail={`${data.posts.published} published · ${data.posts.drafts} draft`}
              to="/admin/posts"
            />
            <Stat
              icon={FiInbox}
              label="New messages"
              value={data.contacts.new}
              detail={`${data.contacts.reviewed} reviewed · ${data.contacts.archived} archived`}
              to="/admin/inbox"
            />
          </div>

          <section aria-labelledby="recent-title" className="card p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 id="recent-title" className="text-lg">
                Recent messages
              </h2>
              <Link to="/admin/inbox" className="text-sm text-muted hover:text-text">
                Open inbox
              </Link>
            </div>
            {data.recentMessages.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No messages yet. Submissions from the contact form will show up here.</p>
            ) : (
              <ul className="mt-4 divide-y divide-border/70">
                {data.recentMessages.map((message) => (
                  <li key={message.id} className="py-3">
                    <Link to={`/admin/inbox?open=${message.id}`} className="group flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                      <span className="min-w-0">
                        <span className="font-medium text-text group-hover:text-cyan">{message.name}</span>
                        <span className="ml-2 text-sm text-muted">{message.subject || message.email}</span>
                      </span>
                      <span className="flex items-center gap-2 text-xs text-muted">
                        {message.status === 'new' ? <Badge tone="cyan">new</Badge> : null}
                        {formatDate(message.createdAt)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}
    </>
  )
}
