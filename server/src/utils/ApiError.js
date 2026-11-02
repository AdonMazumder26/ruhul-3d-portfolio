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

  static unauthorized(message = 'Authentication is required.') {
    return new ApiError(401, message)
  }

  static forbidden(message = 'You do not have permission to do that.') {
    return new ApiError(403, message)
  }

  static notFound(message = 'The requested resource was not found.') {
    return new ApiError(404, message)
  }

  static conflict(message = 'The request conflicts with existing data.', errors = []) {
    return new ApiError(409, message, { errors })
  }

  static serviceUnavailable(message = 'The service is temporarily unavailable.') {
    return new ApiError(503, message)
  }
}
