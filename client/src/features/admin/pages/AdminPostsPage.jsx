import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FiEdit2, FiExternalLink, FiPlus, FiTrash2 } from 'react-icons/fi'
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
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Drafts' },
]

const iconButton =
  'grid size-9 place-items-center rounded-md border border-border text-muted transition-colors hover:border-cyan/60 hover:text-text disabled:opacity-40'
const formatDate = (value) => (value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value)) : '—')

export function AdminPostsPage() {
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const filter = params.get('status') ?? ''
  const { status, data: posts, error, reload, setData } = useAdminData((signal) => adminApi.listPosts({ status: filter }, signal), [filter])
  const { run, busy } = useMutation()
  const [pendingDelete, setPendingDelete] = useState(null)

  const toggle = (post) =>
    run(() => adminApi.patchPost(post.id, { status: post.status === 'published' ? 'draft' : 'published' }), {
      onSuccess: (updated) => {
        setData((list) => (filter ? list.filter((item) => item.id !== updated.id) : list.map((item) => (item.id === updated.id ? { ...item, ...updated, content: undefined } : item))))
        toast(updated.status === 'published' ? 'Post published.' : 'Post moved to drafts.', { tone: 'success' })
      },
      onError: (err) => toast(describeError(err, 'Update failed.'), { tone: 'error' }),
    })

  const confirmDelete = () =>
    run(() => adminApi.deletePost(pendingDelete.id), {
      onSuccess: () => {
        setData((list) => list.filter((item) => item.id !== pendingDelete.id))
        toast(`Deleted “${pendingDelete.title}”.`, { tone: 'success' })
        setPendingDelete(null)
      },
      onError: (err) => toast(describeError(err, 'Delete failed.'), { tone: 'error' }),
    })

  return (
    <>
      <AdminPageHeader
        title="Blog"
        description="Write in Markdown. Drafts are private; published posts appear at /blog."
        actions={
          <Link to="/admin/posts/new" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-cyan px-4 text-sm font-medium text-bg hover:bg-cyan-hover">
            <FiPlus aria-hidden="true" /> New post
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter posts">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={filter === item.value}
            onClick={() => setParams(item.value ? { status: item.value } : {})}
            className={`min-h-9 rounded-full border px-3.5 text-sm transition-colors ${
              filter === item.value ? 'border-cyan bg-cyan/10 text-text' : 'border-border text-muted hover:text-text'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {status === 'loading' ? <LoadingState label="Loading posts…" lines={5} /> : null}
      {status === 'error' && !posts ? <ErrorState title="Could not load posts" message={describeError(error)} onRetry={reload} /> : null}

      {posts && posts.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-muted">{filter ? `No ${filter} posts.` : 'No posts yet.'}</p>
          <Link to="/admin/posts/new" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-cyan px-4 text-sm font-medium text-bg">
            <FiPlus aria-hidden="true" /> Write your first post
          </Link>
        </div>
      ) : null}

      {posts && posts.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/70 bg-elevated/40 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Post
                </th>
                <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">
                  Tags
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell">
                  Published
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {posts.map((post) => (
                <tr key={post.id} className={post.status === 'published' ? '' : 'opacity-80'}>
                  <td className="px-4 py-3 align-top">
                    <Link to={`/admin/posts/${post.id}`} className="font-medium text-text hover:text-cyan">
                      {post.title}
                    </Link>
                    <p className="mt-0.5 font-mono text-[11px] text-muted">
                      /blog/{post.slug} · {post.readingMinutes} min read
                    </p>
                    {post.excerpt ? <p className="mt-1 line-clamp-2 max-w-md text-xs text-muted">{post.excerpt}</p> : null}
                  </td>
                  <td className="hidden px-4 py-3 align-top md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <button type="button" disabled={busy} onClick={() => toggle(post)} aria-pressed={post.status === 'published'} className="rounded-md">
                      <Badge tone={post.status === 'published' ? 'cyan' : 'neutral'}>{post.status}</Badge>
                    </button>
                  </td>
                  <td className="hidden px-4 py-3 align-top text-muted sm:table-cell">{formatDate(post.publishedAt)}</td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex justify-end gap-1.5">
                      {post.status === 'published' ? (
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className={iconButton} aria-label={`Open ${post.title} on the site`}>
                          <FiExternalLink aria-hidden="true" size={15} />
                        </a>
                      ) : null}
                      <Link to={`/admin/posts/${post.id}`} className={iconButton} aria-label={`Edit ${post.title}`}>
                        <FiEdit2 aria-hidden="true" size={15} />
                      </Link>
                      <button type="button" className={`${iconButton} hover:border-orange/60 hover:text-orange`} onClick={() => setPendingDelete(post)} aria-label={`Delete ${post.title}`}>
                        <FiTrash2 aria-hidden="true" size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete “${pendingDelete?.title}”?`}
        message="This permanently removes the post. Its public URL will return 404."
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}
