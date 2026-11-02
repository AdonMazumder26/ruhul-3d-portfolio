import { databaseStatus } from '../config/db.js'
import { ApiError } from '../utils/ApiError.js'

/** Short-circuits data routes with an honest 503 while MongoDB is unreachable. */
export function requireDatabase(_req, _res, next) {
  if (!databaseStatus().connected) {
    return next(ApiError.serviceUnavailable('The database is currently unavailable. Please try again later.'))
  }
  return next()
}
