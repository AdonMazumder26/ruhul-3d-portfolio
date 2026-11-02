import mongoose from 'mongoose'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

function normalize(error) {
  if (error instanceof ApiError) return error

  if (error?.type === 'entity.parse.failed') {
    return ApiError.badRequest('Request body must be valid JSON.')
  }
  if (error?.type === 'entity.too.large') {
    return new ApiError(413, 'Request body is too large.')
  }
  if (error instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(error.errors).map((item) => ({ field: item.path, message: item.message }))
    return ApiError.badRequest('Validation failed.', errors)
  }
  if (error instanceof mongoose.Error.CastError) {
    return ApiError.badRequest('A request parameter has an invalid format.')
  }
  if (
    error instanceof mongoose.Error.MongooseServerSelectionError ||
    error?.name === 'MongoNetworkError' ||
    error?.name === 'MongoServerSelectionError' ||
    error?.name === 'MongoNotConnectedError' ||
    (error?.name === 'MongooseError' && /buffering timed out|not connected|before initial connection/i.test(error.message))
  ) {
    return ApiError.serviceUnavailable('The database is currently unavailable. Please try again later.')
  }
  if (error?.message === 'Not allowed by CORS') {
    return new ApiError(403, 'This origin is not allowed to access the API.')
  }
  return new ApiError(500, 'The request could not be completed.', { expose: false })
}

// Express identifies error handlers by arity, so the fourth parameter must stay.
export function errorHandler(error, req, res, _next) {
  const apiError = normalize(error)

  if (apiError.status >= 500 || !apiError.expose) {
    console.error(`[error] ${req.method} ${req.originalUrl}`, error)
  } else if (!env.isProduction) {
    console.warn(`[warn] ${req.method} ${req.originalUrl} -> ${apiError.status} ${apiError.message}`)
  }

  res.status(apiError.status).json({
    success: false,
    message: apiError.message,
    errors: apiError.errors ?? [],
  })
}
