export const contactLimits = {
  name: { min: 2, max: 80 },
  email: { max: 254 },
  subject: { max: 120 },
  message: { min: 10, max: 2000 },
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Client-side validation mirrors the server schema for fast feedback.
 * The server remains the security boundary.
 */
export function validateContact(values) {
  const errors = {}
  const name = values.name?.trim() ?? ''
  const email = values.email?.trim() ?? ''
  const subject = values.subject?.trim() ?? ''
  const message = values.message?.trim() ?? ''

  if (name.length < contactLimits.name.min) errors.name = 'Please enter your name.'
  else if (name.length > contactLimits.name.max) errors.name = `Name must be ${contactLimits.name.max} characters or fewer.`

  if (!email) errors.email = 'Please enter your email address.'
  else if (email.length > contactLimits.email.max || !EMAIL_PATTERN.test(email)) errors.email = 'Please enter a valid email address.'

  if (subject.length > contactLimits.subject.max) errors.subject = `Subject must be ${contactLimits.subject.max} characters or fewer.`

  if (message.length < contactLimits.message.min) errors.message = `Message should be at least ${contactLimits.message.min} characters.`
  else if (message.length > contactLimits.message.max) errors.message = `Message must be ${contactLimits.message.max} characters or fewer.`

  return { errors, values: { name, email, subject, message }, valid: Object.keys(errors).length === 0 }
}
