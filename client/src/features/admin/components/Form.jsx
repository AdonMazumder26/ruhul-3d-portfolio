import { useId } from 'react'
import { inputClass } from './formUtils.js'

export function Field({ label, hint, error, optional, children, id: forcedId }) {
  const generated = useId()
  const id = forcedId ?? generated
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-text">
          {label}
          {optional ? <span className="ml-1.5 font-normal text-muted">(optional)</span> : null}
        </label>
        {hint ? <span className="font-mono text-[11px] text-muted">{hint}</span> : null}
      </div>
      <div className="mt-1.5">{typeof children === 'function' ? children(id, Boolean(error)) : children}</div>
      {error ? (
        <p className="mt-1.5 text-sm text-orange" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function TextInput({ label, hint, error, optional, className = '', ...rest }) {
  return (
    <Field label={label} hint={hint} error={error} optional={optional}>
      {(id, invalid) => <input id={id} className={`${inputClass(invalid)} ${className}`} aria-invalid={invalid || undefined} {...rest} />}
    </Field>
  )
}

export function TextArea({ label, hint, error, optional, rows = 4, className = '', ...rest }) {
  return (
    <Field label={label} hint={hint} error={error} optional={optional}>
      {(id, invalid) => (
        <textarea id={id} rows={rows} className={`${inputClass(invalid)} resize-y ${className}`} aria-invalid={invalid || undefined} {...rest} />
      )}
    </Field>
  )
}

export function Select({ label, hint, error, optional, options, ...rest }) {
  return (
    <Field label={label} hint={hint} error={error} optional={optional}>
      {(id, invalid) => (
        <select id={id} className={inputClass(invalid)} aria-invalid={invalid || undefined} {...rest}>
          {options.map((option) => {
            const value = typeof option === 'string' ? option : option.value
            const text = typeof option === 'string' ? option : option.label
            return (
              <option key={value} value={value}>
                {text}
              </option>
            )
          })}
        </select>
      )}
    </Field>
  )
}

export function Toggle({ label, description, checked, onChange, disabled }) {
  const id = useId()
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-elevated/40 px-4 py-3">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-text">
          {label}
        </label>
        {description ? <p className="mt-0.5 text-xs text-muted">{description}</p> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors disabled:opacity-50 ${
          checked ? 'border-cyan bg-cyan' : 'border-border bg-surface'
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-0.5 size-[18px] rounded-full bg-bg shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  )
}

/** Textarea bound to a string[] (one item per line). */
export function ListInput({ label, hint, error, optional, value, onChange, rows = 4, placeholder }) {
  return (
    <TextArea
      label={label}
      hint={hint ?? 'One per line'}
      error={error}
      optional={optional}
      rows={rows}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}
