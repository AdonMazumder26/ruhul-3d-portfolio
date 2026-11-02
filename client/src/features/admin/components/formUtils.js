export const inputClass = (invalid = false) =>
  `block w-full rounded-lg border bg-elevated/60 px-3.5 py-2.5 text-[15px] text-text placeholder:text-muted/70 transition-colors focus:border-cyan disabled:opacity-60 ${
    invalid ? 'border-orange' : 'border-border'
  }`

export const linesToList = (text) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

export const listToLines = (list) => (Array.isArray(list) ? list.join('\n') : '')

export const slugify = (text) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

/** Maps the API's { field, message }[] into { [field]: message }. */
export const errorsByField = (errors = []) =>
  Object.fromEntries(errors.map((item) => [String(item.field).split('.').pop(), item.message]))
