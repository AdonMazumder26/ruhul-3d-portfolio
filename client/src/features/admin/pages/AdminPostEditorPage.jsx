import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft, FiEye, FiEdit3, FiSave } from 'react-icons/fi'
import { Button } from '../../../components/ui/Button.jsx'
import { LoadingState } from '../../../components/ui/LoadingState.jsx'
import { ErrorState } from '../../../components/ui/ErrorState.jsx'
import { MarkdownContent } from '../../../components/ui/MarkdownContent.jsx'
import { ApiRequestError } from '../../../lib/api.js'
import { adminApi } from '../adminApi.js'
import { AdminPageHeader } from '../AdminLayout.jsx'
import { Field, Select, TextArea, TextInput } from '../components/Form.jsx'
import { errorsByField, inputClass, slugify } from '../components/formUtils.js'
import { useToast } from '../components/toastContext.js'
import { describeError, useAdminData, useMutation } from '../components/useAdminData.js'

const EMPTY = { title: '', slug: '', excerpt: '', content: '', coverImage: '', tags: '', status: 'draft' }

const toForm = (post) => ({ ...EMPTY, ...post, tags: (post.tags ?? []).join(', ') })

const toPayload = (form) => ({
  title: form.title,
  slug: form.slug,
  excerpt: form.excerpt,
  content: form.content,
  coverImage: form.coverImage,
  tags: [...new Set(form.tags.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean))],
  status: form.status,
})

const wordCount = (text) => text.trim().split(/\s+/).filter(Boolean).length

function PostForm({ initial, isNew, onSaved }) {
  const toast = useToast()
  const { run, busy } = useMutation()
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [mode, setMode] = useState('write')

  const set = (field) => (eventOrValue) => {
    const value = eventOrValue?.target ? eventOrValue.target.value : eventOrValue
    setForm((current) => {
      const next = { ...current, [field]: value }
      if (field === 'title' && !slugTouched) next.slug = slugify(value).slice(0, 120)
      return next
    })
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const save = async (statusOverride) => {
    const payload = toPayload({ ...form, status: statusOverride ?? form.status })
    await run(() => (isNew ? adminApi.createPost(payload) : adminApi.updatePost(initial.id, payload)), {
      onSuccess: (saved) => {
        toast(saved.status === 'published' ? 'Post published.' : 'Draft saved.', { tone: 'success' })
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

  const words = wordCount(form.content)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        save()
      }}
      noValidate
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]"
    >
      <div className="space-y-6">
        <section className="card space-y-4 p-5 sm:p-6">
          <TextInput label="Title" value={form.title} onChange={set('title')} error={errors.title} maxLength={160} required className="text-lg font-medium" />
          <TextInput
            label="Slug"
            hint={`/blog/${form.slug || '…'}`}
            value={form.slug}
            onChange={(event) => {
              setSlugTouched(true)
              set('slug')(event)
            }}
            error={errors.slug}
            maxLength={120}
            className="font-mono"
            required
          />
          <TextArea label="Excerpt" optional hint={`${form.excerpt.length}/400`} rows={2} value={form.excerpt} onChange={set('excerpt')} error={errors.excerpt} maxLength={400} placeholder="Short teaser shown in the post list." />
        </section>

        <section className="card p-5 sm:p-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex rounded-full border border-border p-0.5" role="tablist" aria-label="Editor mode">
              <button type="button" role="tab" aria-selected={mode === 'write'} onClick={() => setMode('write')} className={`inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium ${mode === 'write' ? 'bg-cyan text-bg' : 'text-muted hover:text-text'}`}>
                <FiEdit3 aria-hidden="true" /> Write
              </button>
              <button type="button" role="tab" aria-selected={mode === 'preview'} onClick={() => setMode('preview')} className={`inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium ${mode === 'preview' ? 'bg-cyan text-bg' : 'text-muted hover:text-text'}`}>
                <FiEye aria-hidden="true" /> Preview
              </button>
            </div>
            <p className="font-mono text-[11px] text-muted">
              {words} words · ~{Math.max(1, Math.round(words / 200))} min read
            </p>
          </div>
          {mode === 'write' ? (
            <Field label="Content" hint="Markdown (GitHub flavoured)" error={errors.content}>
              {(id, invalid) => (
                <textarea
                  id={id}
                  rows={22}
                  value={form.content}
                  onChange={set('content')}
                  aria-invalid={invalid || undefined}
                  className={`${inputClass(invalid)} min-h-[480px] resize-y font-mono text-sm leading-relaxed`}
                  placeholder={'# Heading\n\nWrite your post here. **Bold**, _italic_, `code`, lists, links and images are supported.'}
                  spellCheck
                />
              )}
            </Field>
          ) : (
            <div className="min-h-[480px] rounded-lg border border-border bg-bg/40 p-5 sm:p-8" aria-live="polite">
              {form.content.trim() ? <MarkdownContent content={form.content} /> : <p className="text-sm text-muted">Nothing to preview yet.</p>}
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-6">
        <section className="card space-y-4 p-5">
          <h2 className="text-lg">Publishing</h2>
          <Select
            label="Status"
            options={[
              { value: 'draft', label: 'Draft (private)' },
              { value: 'published', label: 'Published' },
            ]}
            value={form.status}
            onChange={set('status')}
            error={errors.status}
          />
          <TextInput label="Tags" optional hint="Comma-separated" placeholder="react, three.js, notes" value={form.tags} onChange={set('tags')} error={errors.tags} />
          <TextInput label="Cover image URL" optional type="url" placeholder="https://…/cover.png" value={form.coverImage} onChange={set('coverImage')} error={errors.coverImage} />
          {form.coverImage ? (
            <img src={form.coverImage} alt="" className="aspect-video w-full rounded-lg border border-border object-cover" onError={(event) => (event.currentTarget.style.display = 'none')} />
          ) : null}
        </section>

        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={busy}>
            <FiSave aria-hidden="true" />
            {busy ? 'Saving…' : form.status === 'published' ? (isNew ? 'Publish' : 'Save & keep published') : 'Save draft'}
          </Button>
          {form.status === 'draft' ? (
            <Button type="button" variant="secondary" disabled={busy} onClick={() => save('published')}>
              Publish now
            </Button>
          ) : null}
        </div>
      </aside>
    </form>
  )
}

export function AdminPostEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id
  const { status, data, error, reload } = useAdminData((signal) => (isNew ? Promise.resolve(null) : adminApi.getPost(id, signal)), [id])

  return (
    <>
      <div className="mb-4">
        <Link to="/admin/posts" className="inline-flex min-h-10 items-center gap-2 text-sm text-muted hover:text-text">
          <FiArrowLeft aria-hidden="true" /> All posts
        </Link>
      </div>
      <AdminPageHeader
        title={isNew ? 'New post' : data ? `Edit: ${data.title}` : 'Edit post'}
        description={!isNew && data ? `Last updated ${new Date(data.updatedAt).toLocaleString()}` : undefined}
      />
      {status === 'loading' ? <LoadingState label="Loading post…" lines={6} /> : null}
      {status === 'error' ? <ErrorState title="Could not load this post" message={describeError(error)} onRetry={reload} /> : null}
      {status === 'success' ? (
        <PostForm
          key={id ?? 'new'}
          isNew={isNew}
          initial={isNew ? EMPTY : toForm(data)}
          onSaved={(saved) => {
            if (isNew) navigate(`/admin/posts/${saved.id}`, { replace: true })
            else reload()
          }}
        />
      ) : null}
    </>
  )
}
