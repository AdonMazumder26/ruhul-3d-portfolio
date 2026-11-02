import { useId, useRef, useState } from 'react'
import { FiCheckCircle, FiGithub, FiLinkedin, FiMail, FiSend } from 'react-icons/fi'
import { SectionHeading } from '../../components/ui/SectionHeading.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Reveal } from '../../components/ui/Reveal.jsx'
import { profile, socialLinks } from '../../data/profile.js'
import { ApiRequestError } from '../../lib/api.js'
import { contactLimits, validateContact } from './contactSchema.js'
import { contactAvailable, submitContact } from './contactService.js'

const icons = { github: FiGithub, linkedin: FiLinkedin, email: FiMail }
const initialValues = { name: '', email: '', subject: '', message: '', website: '' }

function Field({ id, label, error, hint, optional, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-text">
          {label}
          {optional ? <span className="ml-1.5 font-normal text-muted">(optional)</span> : null}
        </label>
        {hint ? (
          <span id={`${id}-hint`} className="font-mono text-[11px] text-muted">
            {hint}
          </span>
        ) : null}
      </div>
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-orange">
          {error}
        </p>
      ) : null}
    </div>
  )
}

const inputClass = (invalid) =>
  `block w-full rounded-lg border bg-elevated/60 px-3.5 py-3 text-[15px] text-text placeholder:text-muted/70 transition-colors focus:border-cyan ${
    invalid ? 'border-orange' : 'border-border'
  }`

export function ContactSection() {
  const baseId = useId()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ state: 'idle' })
  const errorSummaryRef = useRef(null)
  const links = socialLinks()
  const ids = {
    name: `${baseId}-name`,
    email: `${baseId}-email`,
    subject: `${baseId}-subject`,
    message: `${baseId}-message`,
  }

  const update = (field) => (event) => {
    const value = event.target.value
    setValues((current) => ({ ...current, [field]: value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    if (status.state === 'sending') return

    const result = validateContact(values)
    setErrors(result.errors)
    if (!result.valid) {
      setStatus({ state: 'invalid' })
      requestAnimationFrame(() => errorSummaryRef.current?.focus())
      return
    }

    setStatus({ state: 'sending' })
    try {
      await submitContact({ ...result.values, website: values.website })
      setStatus({ state: 'success' })
      setValues(initialValues)
    } catch (error) {
      const serverErrors = error instanceof ApiRequestError ? error.errors : []
      if (serverErrors.length > 0) {
        setErrors(Object.fromEntries(serverErrors.map((item) => [item.field, item.message])))
      }
      setStatus({
        state: 'error',
        message:
          error instanceof ApiRequestError && error.status === 429
            ? 'Too many messages were sent from this connection. Please wait a little while and try again.'
            : error instanceof ApiRequestError && error.status >= 400 && error.status < 500 && serverErrors.length > 0
              ? 'Please correct the highlighted fields and try again.'
              : 'Your message could not be delivered right now. Nothing was saved, so please try again later.',
      })
    }
  }

  const fieldErrors = Object.entries(errors).filter(([, message]) => Boolean(message))

  return (
    <section id="contact" aria-labelledby="contact-title" className="section-y scroll-mt-20 border-t border-border/60">
      <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Reveal>
          <SectionHeading
            id="contact-title"
            eyebrow="Contact"
            title="Let's build something together"
            description={profile.availability}
          />
          <p className="mt-6 text-[15px] leading-relaxed text-muted">
            Tell me about an internship, a project idea or a problem you are trying to solve. Messages are stored securely
            and I read every one.
          </p>
          {links.length > 0 ? (
            <ul className="mt-8 space-y-3" aria-label="Other ways to reach me">
              {links.map((item) => {
                const Icon = icons[item.key]
                return (
                  <li key={item.key}>
                    <a
                      href={item.href}
                      target={item.key === 'email' ? undefined : '_blank'}
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center gap-3 text-sm text-muted hover:text-text"
                    >
                      <span className="grid size-9 place-items-center rounded-full border border-border">
                        <Icon aria-hidden="true" />
                      </span>
                      {item.label}
                    </a>
                  </li>
                )
              })}
            </ul>
          ) : null}
        </Reveal>

        <Reveal delay={0.1}>
          {!contactAvailable ? (
            <div className="card p-6 sm:p-8" role="status">
              <h3 className="text-lg">Contact form unavailable</h3>
              <p className="mt-2 text-sm text-muted">
                The message service is not configured for this deployment yet, so the form is hidden rather than pretending to send.
              </p>
            </div>
          ) : status.state === 'success' ? (
            <div className="card flex flex-col items-start gap-4 p-6 sm:p-8" role="status" aria-live="polite">
              <span className="grid size-11 place-items-center rounded-full bg-cyan/10 text-cyan">
                <FiCheckCircle size={22} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-xl">Message received</h3>
                <p className="mt-2 text-sm text-muted">Thanks for reaching out. Your message has been saved and I will get back to you.</p>
              </div>
              <Button variant="secondary" onClick={() => setStatus({ state: 'idle' })}>
                Send another message
              </Button>
            </div>
          ) : (
            <form className="card relative space-y-6 p-6 sm:p-8" onSubmit={onSubmit} noValidate aria-describedby={`${baseId}-form-note`}>
              {status.state === 'invalid' && fieldErrors.length > 0 ? (
                <div
                  ref={errorSummaryRef}
                  tabIndex={-1}
                  role="alert"
                  className="rounded-lg border border-orange/40 bg-orange/10 p-4 text-sm"
                >
                  <p className="font-medium text-text">Please fix the following:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
                    {fieldErrors.map(([field, message]) => (
                      <li key={field}>
                        <a href={`#${ids[field]}`} className="underline hover:text-text">
                          {message}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {status.state === 'error' ? (
                <div role="alert" className="rounded-lg border border-orange/40 bg-orange/10 p-4 text-sm text-text">
                  {status.message}
                </div>
              ) : null}

              <div className="grid gap-6 sm:grid-cols-2">
                <Field id={ids.name} label="Name" error={errors.name}>
                  <input
                    id={ids.name}
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={contactLimits.name.max}
                    value={values.name}
                    onChange={update('name')}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? `${ids.name}-error` : undefined}
                    className={inputClass(errors.name)}
                  />
                </Field>
                <Field id={ids.email} label="Email" error={errors.email}>
                  <input
                    id={ids.email}
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={contactLimits.email.max}
                    value={values.email}
                    onChange={update('email')}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? `${ids.email}-error` : undefined}
                    className={inputClass(errors.email)}
                  />
                </Field>
              </div>
              <Field id={ids.subject} label="Subject" optional error={errors.subject}>
                <input
                  id={ids.subject}
                  name="subject"
                  type="text"
                  maxLength={contactLimits.subject.max}
                  value={values.subject}
                  onChange={update('subject')}
                  aria-invalid={Boolean(errors.subject)}
                  aria-describedby={errors.subject ? `${ids.subject}-error` : undefined}
                  className={inputClass(errors.subject)}
                />
              </Field>
              <Field
                id={ids.message}
                label="Message"
                error={errors.message}
                hint={`${values.message.length}/${contactLimits.message.max}`}
              >
                <textarea
                  id={ids.message}
                  name="message"
                  rows={6}
                  required
                  maxLength={contactLimits.message.max}
                  value={values.message}
                  onChange={update('message')}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={[errors.message ? `${ids.message}-error` : null, `${ids.message}-hint`].filter(Boolean).join(' ')}
                  className={`${inputClass(errors.message)} resize-y`}
                />
              </Field>

              {/* Honeypot: hidden from people, tempting for bots. */}
              <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                <label htmlFor={`${baseId}-website`}>Website</label>
                <input
                  id={`${baseId}-website`}
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={values.website}
                  onChange={update('website')}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <p id={`${baseId}-form-note`} className="text-xs text-muted">
                  Required fields: name, email and message.
                </p>
                <Button type="submit" disabled={status.state === 'sending'} aria-busy={status.state === 'sending'}>
                  {status.state === 'sending' ? 'Sending…' : 'Send message'}
                  <FiSend aria-hidden="true" />
                </Button>
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  )
}
