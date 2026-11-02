import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft, FiSave } from 'react-icons/fi'
import { Button } from '../../../components/ui/Button.jsx'
import { LoadingState } from '../../../components/ui/LoadingState.jsx'
import { ErrorState } from '../../../components/ui/ErrorState.jsx'
import { ApiRequestError } from '../../../lib/api.js'
import { adminApi } from '../adminApi.js'
import { AdminPageHeader } from '../AdminLayout.jsx'
import { ListInput, Select, TextArea, TextInput, Toggle } from '../components/Form.jsx'
import { errorsByField, linesToList, listToLines, slugify } from '../components/formUtils.js'
import { useToast } from '../components/toastContext.js'
import { describeError, useAdminData, useMutation } from '../components/useAdminData.js'

const STATUS_OPTIONS = [
  { value: 'prototype', label: 'Prototype' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
]

const EMPTY = {
  title: '',
  slug: '',
  summary: '',
  description: '',
  purpose: '',
  category: '',
  status: 'in-progress',
  technologies: '',
  features: '',
  implementationNotes: '',
  challenges: '',
  role: '',
  repositoryUrl: '',
  liveUrl: '',
  coverImage: '',
  featured: false,
  published: false,
  order: 0,
}

const toForm = (project) => ({
  ...EMPTY,
  ...project,
  technologies: listToLines(project.technologies),
  features: listToLines(project.features),
  implementationNotes: listToLines(project.implementationNotes),
  challenges: listToLines(project.challenges),
})

const toPayload = (form) => ({
  title: form.title,
  slug: form.slug,
  summary: form.summary,
  description: form.description,
  purpose: form.purpose,
  category: form.category,
  status: form.status,
  technologies: linesToList(form.technologies),
  features: linesToList(form.features),
  implementationNotes: linesToList(form.implementationNotes),
  challenges: linesToList(form.challenges),
  role: form.role,
  repositoryUrl: form.repositoryUrl,
  liveUrl: form.liveUrl,
  coverImage: form.coverImage,
  featured: form.featured,
  published: form.published,
  order: Number(form.order) || 0,
})

function ProjectForm({ initial, isNew, onSaved }) {
  const toast = useToast()
  const { run, busy } = useMutation()
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [slugTouched, setSlugTouched] = useState(!isNew)

  const set = (field) => (eventOrValue) => {
    const value = eventOrValue?.target ? eventOrValue.target.value : eventOrValue
    setForm((current) => {
      const next = { ...current, [field]: value }
      if (field === 'title' && !slugTouched) next.slug = slugify(value)
      return next
    })
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    const payload = toPayload(form)
    await run(() => (isNew ? adminApi.createProject(payload) : adminApi.updateProject(initial.id, payload)), {
      onSuccess: (saved) => {
        toast(isNew ? 'Project created.' : 'Project saved.', { tone: 'success' })
        onSaved(saved)
      },
      onError: (err) => {
        if (err instanceof ApiRequestError && err.errors.length > 0) {
          setErrors(errorsByField(err.errors))
          toast('Please fix the highlighted fields.', { tone: 'error' })
        } else {
          toast(describeError(err, 'Save failed.'), { tone: 'error' })
        }
      },
    })
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <section className="card space-y-4 p-5 sm:p-6">
          <h2 className="text-lg">Basics</h2>
          <TextInput label="Title" value={form.title} onChange={set('title')} error={errors.title} maxLength={120} required />
          <TextInput
            label="Slug"
            hint={`/projects/${form.slug || '…'}`}
            value={form.slug}
            onChange={(event) => {
              setSlugTouched(true)
              set('slug')(event)
            }}
            error={errors.slug}
            maxLength={80}
            className="font-mono"
            required
          />
          <TextArea label="Summary" hint={`${form.summary.length}/400`} rows={3} value={form.summary} onChange={set('summary')} error={errors.summary} maxLength={400} required />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Category" placeholder="Full-stack platform" value={form.category} onChange={set('category')} error={errors.category} maxLength={80} required />
            <Select label="Status" options={STATUS_OPTIONS} value={form.status} onChange={set('status')} error={errors.status} />
          </div>
          <TextInput label="Your role" optional value={form.role} onChange={set('role')} error={errors.role} maxLength={160} />
        </section>

        <section className="card space-y-4 p-5 sm:p-6">
          <h2 className="text-lg">Story</h2>
          <TextArea label="Description" optional hint={`${form.description.length}/4000`} rows={6} value={form.description} onChange={set('description')} error={errors.description} maxLength={4000} />
          <TextArea label="Purpose" optional hint={`${form.purpose.length}/2000`} rows={3} value={form.purpose} onChange={set('purpose')} error={errors.purpose} maxLength={2000} />
          <ListInput label="Key features" optional value={form.features} onChange={set('features')} error={errors.features} />
          <ListInput label="Implementation notes" optional value={form.implementationNotes} onChange={set('implementationNotes')} error={errors.implementationNotes} />
          <ListInput label="Challenges" optional value={form.challenges} onChange={set('challenges')} error={errors.challenges} />
        </section>
      </div>

      <aside className="space-y-6">
        <section className="card space-y-3 p-5">
          <h2 className="text-lg">Visibility</h2>
          <Toggle label="Published" description="Visible on the public site and API." checked={form.published} onChange={set('published')} />
          <Toggle label="Featured" description="Shown on the home page and as a hero satellite." checked={form.featured} onChange={set('featured')} />
          <TextInput label="Order" type="number" min={0} max={9999} hint="Lower shows first" value={form.order} onChange={set('order')} error={errors.order} />
        </section>

        <section className="card space-y-4 p-5">
          <h2 className="text-lg">Links & media</h2>
          <ListInput label="Technologies" value={form.technologies} onChange={set('technologies')} error={errors.technologies} rows={5} placeholder={'React\nNode.js\nMongoDB'} />
          <TextInput label="Repository URL" optional type="url" placeholder="https://github.com/…" value={form.repositoryUrl} onChange={set('repositoryUrl')} error={errors.repositoryUrl} />
          <TextInput label="Live URL" optional type="url" placeholder="https://…" value={form.liveUrl} onChange={set('liveUrl')} error={errors.liveUrl} />
          <TextInput label="Cover image URL" optional type="url" placeholder="https://…/cover.png" value={form.coverImage} onChange={set('coverImage')} error={errors.coverImage} />
          {form.coverImage ? (
            <img src={form.coverImage} alt="" className="aspect-video w-full rounded-lg border border-border object-cover" onError={(event) => (event.currentTarget.style.display = 'none')} />
          ) : null}
        </section>

        <div className="flex gap-2">
          <Button type="submit" disabled={busy} className="flex-1">
            <FiSave aria-hidden="true" />
            {busy ? 'Saving…' : isNew ? 'Create project' : 'Save changes'}
          </Button>
        </div>
      </aside>
    </form>
  )
}

export function AdminProjectEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id
  const { status, data, error, reload } = useAdminData((signal) => (isNew ? Promise.resolve(null) : adminApi.getProject(id, signal)), [id])

  const back = (
    <Link to="/admin/projects" className="inline-flex min-h-10 items-center gap-2 text-sm text-muted hover:text-text">
      <FiArrowLeft aria-hidden="true" /> All projects
    </Link>
  )

  return (
    <>
      <div className="mb-4">{back}</div>
      <AdminPageHeader
        title={isNew ? 'New project' : data ? `Edit: ${data.title}` : 'Edit project'}
        description={isNew ? 'Drafts are private until you publish them.' : data ? `Last updated ${new Date(data.updatedAt).toLocaleString()}` : undefined}
      />
      {status === 'loading' ? <LoadingState label="Loading project…" lines={6} /> : null}
      {status === 'error' ? <ErrorState title="Could not load this project" message={describeError(error)} onRetry={reload} /> : null}
      {status === 'success' ? (
        <ProjectForm
          key={id ?? 'new'}
          isNew={isNew}
          initial={isNew ? EMPTY : toForm(data)}
          onSaved={(saved) => {
            if (isNew) navigate(`/admin/projects/${saved.id}`, { replace: true })
            else reload()
          }}
        />
      ) : null}
    </>
  )
}
