import { useEffect, useMemo, useState } from 'react'
import { FiRotateCcw, FiSave } from 'react-icons/fi'
import { Button } from '../../../components/ui/Button.jsx'
import { LoadingState } from '../../../components/ui/LoadingState.jsx'
import { ErrorState } from '../../../components/ui/ErrorState.jsx'
import { Badge, StatusBadge } from '../../../components/ui/Badge.jsx'
import { ApiRequestError } from '../../../lib/api.js'
import { COLOR_LABELS, DEFAULT_THEME, FONT_OPTIONS, isHex, mergeTheme } from '../../theme/themeDefaults.js'
import { useTheme } from '../../theme/themeContext.js'
import { adminApi } from '../adminApi.js'
import { AdminPageHeader } from '../AdminLayout.jsx'
import { ConfirmDialog } from '../components/Feedback.jsx'
import { Select, TextInput, Toggle } from '../components/Form.jsx'
import { inputClass } from '../components/formUtils.js'
import { useToast } from '../components/toastContext.js'
import { describeError, useAdminData, useMutation } from '../components/useAdminData.js'

const PRESETS = [
  { name: 'Default', colors: DEFAULT_THEME.colors },
  { name: 'Ember', colors: { ...DEFAULT_THEME.colors, bg: '#0f0a0a', surface: '#1b1314', elevated: '#261a1b', border: '#3a2628', accent: '#fb923c', accentAlt: '#f472b6' } },
  { name: 'Forest', colors: { ...DEFAULT_THEME.colors, bg: '#070d0a', surface: '#101a14', elevated: '#17251c', border: '#23382b', accent: '#86efac', accentAlt: '#fde68a' } },
  { name: 'Violet', colors: { ...DEFAULT_THEME.colors, bg: '#0b0a14', surface: '#15132a', elevated: '#1e1b3a', border: '#2e2a52', accent: '#c4b5fd', accentAlt: '#f9a8d4' } },
  { name: 'Mono', colors: { ...DEFAULT_THEME.colors, bg: '#0a0a0a', surface: '#161616', elevated: '#202020', border: '#2e2e2e', accent: '#e5e5e5', accentAlt: '#a3a3a3' } },
]

function ColorInput({ name, value, onChange, error }) {
  return (
    <div>
      <label htmlFor={`color-${name}`} className="text-sm font-medium text-text">
        {COLOR_LABELS[name]}
      </label>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          type="color"
          aria-label={`${COLOR_LABELS[name]} picker`}
          value={isHex(value) ? value : '#000000'}
          onChange={(event) => onChange(event.target.value)}
          className="size-10 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
        />
        <input
          id={`color-${name}`}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={7}
          spellCheck={false}
          aria-invalid={Boolean(error) || undefined}
          className={`${inputClass(Boolean(error))} font-mono uppercase`}
        />
      </div>
      {error ? (
        <p className="mt-1 text-xs text-orange" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function Preview() {
  return (
    <div className="card overflow-hidden" aria-label="Theme preview">
      <div className="relative isolate overflow-hidden border-b border-border/70 p-6">
        <div aria-hidden="true" className="absolute inset-0 -z-10 grid-fade opacity-40" />
        <p className="eyebrow">Preview</p>
        <h3 className="mt-2 text-2xl">Beyond the interface</h3>
        <p className="mt-2 text-sm text-muted">Body copy uses the sans font; headings use the display font.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 bg-elevated/40 p-4">
        <Badge tone="cyan">accent</Badge>
        <Badge tone="orange">accent alt</Badge>
        <StatusBadge status="in-progress" />
        <span className="ml-auto font-mono text-xs text-muted">code · 01</span>
      </div>
    </div>
  )
}

export function AdminThemePage() {
  const toast = useToast()
  const { setSaved, setPreview, refresh } = useTheme()
  const { status, data, error, reload } = useAdminData((signal) => adminApi.getTheme(signal))
  const { run, busy } = useMutation()
  const [edits, setEdits] = useState(null)
  const [errors, setErrors] = useState({})
  const [confirmReset, setConfirmReset] = useState(false)

  // The draft is the loaded theme until the user edits something.
  const baseline = useMemo(() => (data ? mergeTheme(data.theme) : null), [data])
  const draft = edits ?? baseline
  const updateDraft = (fn) => setEdits((current) => fn(current ?? baseline))

  // Apply the draft live to the whole admin UI while editing; drop it on unmount.
  useEffect(() => {
    if (draft) setPreview(draft)
    return () => setPreview(null)
  }, [draft, setPreview])

  const dirty = useMemo(() => Boolean(draft && baseline) && JSON.stringify(draft) !== JSON.stringify(baseline), [draft, baseline])

  const setColor = (name, value) => {
    updateDraft((current) => ({ ...current, colors: { ...current.colors, [name]: value } }))
    setErrors((current) => ({ ...current, [name]: isHex(value) ? undefined : 'Use a 6-digit hex colour like #67e8f9.' }))
  }
  const setFont = (role, value) => updateDraft((current) => ({ ...current, fonts: { ...current.fonts, [role]: value } }))
  const setHero = (key, value) => updateDraft((current) => ({ ...current, hero: { ...current.hero, [key]: value } }))
  const setSkills = (key, value) => updateDraft((current) => ({ ...current, skills: { ...current.skills, [key]: value } }))

  const onSave = () =>
    run(() => adminApi.saveTheme(draft), {
      onSuccess: (result) => {
        setSaved(mergeTheme(result.theme))
        setEdits(null)
        toast('Theme saved. It is live for visitors now.', { tone: 'success' })
        reload()
      },
      onError: (err) => {
        if (err instanceof ApiRequestError && err.errors.length > 0) {
          setErrors(Object.fromEntries(err.errors.map((item) => [String(item.field).split('.').pop(), item.message])))
        }
        toast(describeError(err, 'Could not save the theme.'), { tone: 'error' })
      },
    })

  const onReset = () =>
    run(() => adminApi.resetTheme(), {
      onSuccess: () => {
        setSaved(DEFAULT_THEME)
        setEdits(null)
        setErrors({})
        setConfirmReset(false)
        toast('Theme reset to defaults.', { tone: 'success' })
        reload()
        refresh()
      },
      onError: (err) => toast(describeError(err, 'Reset failed.'), { tone: 'error' }),
    })

  const hasErrors = Object.values(errors).some(Boolean)

  return (
    <>
      <AdminPageHeader
        title="Theme"
        description="Colours, fonts and 3D toggles for the public site. Changes preview live here and apply to visitors once saved."
        actions={
          <>
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              disabled={busy || (data && !data.customized)}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium text-text hover:border-orange/60 disabled:opacity-50"
            >
              <FiRotateCcw aria-hidden="true" /> Reset to defaults
            </button>
            <Button onClick={onSave} disabled={busy || !dirty || hasErrors}>
              <FiSave aria-hidden="true" /> {busy ? 'Saving…' : 'Save theme'}
            </Button>
          </>
        }
      />

      {status === 'loading' || (!draft && status !== 'error') ? <LoadingState label="Loading theme…" lines={5} /> : null}
      {status === 'error' && !data ? <ErrorState title="Could not load the theme" message={describeError(error)} onRetry={reload} /> : null}

      {draft ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className="card p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg">Colours</h2>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Colour presets">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        updateDraft((current) => ({ ...current, colors: { ...preset.colors } }))
                        setErrors({})
                      }}
                      className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border px-2.5 text-xs text-muted hover:border-cyan/60 hover:text-text"
                    >
                      <span aria-hidden="true" className="size-3 rounded-full" style={{ background: preset.colors.accent }} />
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {Object.keys(DEFAULT_THEME.colors).map((name) => (
                  <ColorInput key={name} name={name} value={draft.colors[name]} onChange={(value) => setColor(name, value)} error={errors[name]} />
                ))}
              </div>
            </section>

            <section className="card p-5 sm:p-6">
              <h2 className="text-lg">Fonts</h2>
              <p className="mt-1 text-sm text-muted">Loaded from Google Fonts on demand.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Select label="Display (headings)" options={FONT_OPTIONS} value={draft.fonts.display} onChange={(event) => setFont('display', event.target.value)} />
                <Select label="Sans (body)" options={FONT_OPTIONS} value={draft.fonts.sans} onChange={(event) => setFont('sans', event.target.value)} />
              </div>
            </section>

            <section className="card space-y-3 p-5 sm:p-6">
              <h2 className="text-lg">Hero & scenes</h2>
              <Toggle label="3D hero scene" description="Off shows the lightweight CSS particle fallback instead of WebGL." checked={draft.hero.scene3d} onChange={(value) => setHero('scene3d', value)} />
              <Toggle label="Star field" description="Background stars behind the particle cloud." checked={draft.hero.stars} onChange={(value) => setHero('stars', value)} disabled={!draft.hero.scene3d} />
              <Toggle label="Project markers" description="Clickable markers orbiting the cloud for the first three featured projects." checked={draft.hero.satellites} onChange={(value) => setHero('satellites', value)} disabled={!draft.hero.scene3d} />
              <Toggle label="Animated skills field" description="Off shows a static, grouped skill map." checked={draft.skills.animated} onChange={(value) => setSkills('animated', value)} />
              <TextInput
                label="Hero eyebrow text"
                optional
                hint="Leave empty to use the default tagline"
                value={draft.hero.tagline}
                onChange={(event) => setHero('tagline', event.target.value)}
                maxLength={160}
                error={errors.tagline}
              />
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
            <Preview />
            {data?.customized ? (
              <p className="text-xs text-muted">Custom theme saved {data.updatedAt ? new Date(data.updatedAt).toLocaleString() : ''}.</p>
            ) : (
              <p className="text-xs text-muted">Using default theme.</p>
            )}
            {dirty ? <p className="text-xs text-orange">You have unsaved changes.</p> : null}
          </aside>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmReset}
        title="Reset the theme?"
        message="This removes your saved customisation and restores the original colours, fonts and 3D settings."
        confirmLabel="Reset"
        busy={busy}
        onConfirm={onReset}
        onCancel={() => setConfirmReset(false)}
      />
    </>
  )
}
