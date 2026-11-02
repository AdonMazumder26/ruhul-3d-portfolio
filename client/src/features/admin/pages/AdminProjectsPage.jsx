import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowDown, FiArrowUp, FiEdit2, FiExternalLink, FiPlus, FiStar, FiTrash2 } from 'react-icons/fi'
import { LoadingState } from '../../../components/ui/LoadingState.jsx'
import { ErrorState } from '../../../components/ui/ErrorState.jsx'
import { Badge, StatusBadge } from '../../../components/ui/Badge.jsx'
import { adminApi } from '../adminApi.js'
import { AdminPageHeader } from '../AdminLayout.jsx'
import { ConfirmDialog } from '../components/Feedback.jsx'
import { useToast } from '../components/toastContext.js'
import { describeError, useAdminData, useMutation } from '../components/useAdminData.js'

const iconButton =
  'grid size-9 place-items-center rounded-md border border-border text-muted transition-colors hover:border-cyan/60 hover:text-text disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted'

export function AdminProjectsPage() {
  const toast = useToast()
  const { status, data: projects, error, reload, setData } = useAdminData((signal) => adminApi.listProjects(signal))
  const { run, busy } = useMutation()
  const [pendingDelete, setPendingDelete] = useState(null)

  const patch = (project, changes, label) =>
    run(() => adminApi.patchProject(project.id, changes), {
      onSuccess: (updated) => {
        setData((list) => list.map((item) => (item.id === updated.id ? updated : item)))
        toast(label, { tone: 'success' })
      },
      onError: (err) => toast(describeError(err, 'Update failed.'), { tone: 'error' }),
    })

  const move = (index, direction) => {
    const next = [...projects]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setData(next)
    run(() => adminApi.reorderProjects(next.map((item) => item.id)), {
      onSuccess: (list) => setData(list),
      onError: (err) => {
        toast(describeError(err, 'Reorder failed.'), { tone: 'error' })
        reload()
      },
    })
  }

  const confirmDelete = () =>
    run(() => adminApi.deleteProject(pendingDelete.id), {
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
        title="Projects"
        description="Order here is the order visitors see. Featured projects also appear as satellites in the hero scene (first three)."
        actions={
          <Link to="/admin/projects/new" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-cyan px-4 text-sm font-medium text-bg hover:bg-cyan-hover">
            <FiPlus aria-hidden="true" /> New project
          </Link>
        }
      />

      {status === 'loading' ? <LoadingState label="Loading projects…" lines={5} /> : null}
      {status === 'error' && !projects ? <ErrorState title="Could not load projects" message={describeError(error)} onRetry={reload} /> : null}

      {projects && projects.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-muted">No projects yet.</p>
          <Link to="/admin/projects/new" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-cyan px-4 text-sm font-medium text-bg">
            <FiPlus aria-hidden="true" /> Create your first project
          </Link>
        </div>
      ) : null}

      {projects && projects.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/70 bg-elevated/40 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Project
                </th>
                <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">
                  Category
                </th>
                <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Visibility
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {projects.map((project, index) => (
                <tr key={project.id} className={project.published ? '' : 'opacity-75'}>
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col gap-1">
                        <button type="button" className={iconButton} disabled={busy || index === 0} onClick={() => move(index, -1)} aria-label={`Move ${project.title} up`}>
                          <FiArrowUp aria-hidden="true" size={14} />
                        </button>
                        <button
                          type="button"
                          className={iconButton}
                          disabled={busy || index === projects.length - 1}
                          onClick={() => move(index, 1)}
                          aria-label={`Move ${project.title} down`}
                        >
                          <FiArrowDown aria-hidden="true" size={14} />
                        </button>
                      </div>
                      <div className="min-w-0">
                        <Link to={`/admin/projects/${project.id}`} className="font-medium text-text hover:text-cyan">
                          {project.title}
                        </Link>
                        <p className="mt-0.5 font-mono text-[11px] text-muted">/{project.slug}</p>
                        <p className="mt-1 line-clamp-2 max-w-md text-xs text-muted">{project.summary}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 align-top text-muted md:table-cell">{project.category}</td>
                  <td className="hidden px-4 py-3 align-top sm:table-cell">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col items-start gap-1.5">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => patch(project, { published: !project.published }, project.published ? 'Project unpublished.' : 'Project published.')}
                        aria-pressed={project.published}
                        className="rounded-md"
                      >
                        <Badge tone={project.published ? 'cyan' : 'neutral'}>{project.published ? 'published' : 'draft'}</Badge>
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => patch(project, { featured: !project.featured }, project.featured ? 'Removed from featured.' : 'Marked as featured.')}
                        aria-pressed={project.featured}
                        className="inline-flex items-center gap-1 rounded-md text-xs text-muted hover:text-text"
                      >
                        <FiStar aria-hidden="true" className={project.featured ? 'fill-orange text-orange' : ''} size={13} />
                        {project.featured ? 'Featured' : 'Feature'}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex justify-end gap-1.5">
                      {project.published ? (
                        <a href={`/projects/${project.slug}`} target="_blank" rel="noreferrer" className={iconButton} aria-label={`Open ${project.title} on the site`}>
                          <FiExternalLink aria-hidden="true" size={15} />
                        </a>
                      ) : null}
                      <Link to={`/admin/projects/${project.id}`} className={iconButton} aria-label={`Edit ${project.title}`}>
                        <FiEdit2 aria-hidden="true" size={15} />
                      </Link>
                      <button type="button" className={`${iconButton} hover:border-orange/60 hover:text-orange`} onClick={() => setPendingDelete(project)} aria-label={`Delete ${project.title}`}>
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
        message="This permanently removes the project from the database. The public page will return 404."
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}
