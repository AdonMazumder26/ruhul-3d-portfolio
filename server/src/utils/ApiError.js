export class ApiError extends Error {
  constructor(status, message, { errors = [], expose = true } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
    this.expose = expose
  }

  static badRequest(message = 'The request is invalid.', errors = []) {
    return new ApiError(400, message, { errors })
  }

  static notFound(message = 'The requested resource was not found.') {
    return new ApiError(404, message)
  }

  static serviceUnavailable(message = 'The service is temporarily unavailable.') {
    return new ApiError(503, message)
  }
}
