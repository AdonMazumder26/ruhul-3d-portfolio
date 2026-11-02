import { ApiError } from '../utils/ApiError.js'

/**
 * Validates req[source] with a Zod schema and replaces it with the parsed,
 * normalized value so handlers never see raw input.
 */
export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source])
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || source,
        message: issue.message,
      }))
      return next(ApiError.badRequest('Validation failed.', errors))
    }
    if (source === 'body') {
      req.body = result.data
    } else {
      // req.query / req.params are getters in Express 5; store parsed values separately.
      req.validated = { ...(req.validated ?? {}), [source]: result.data }
    }
    return next()
  }
}
