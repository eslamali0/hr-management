import { Request, Response, NextFunction } from 'express'
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from './errors'
import logger from '../config/logger'
import { ApiResponseHandler } from './apiResponse'

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error caught in errorHandler:', {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode,
    details: err.details,
    path: req.path,
    method: req.method,
    ip: req.ip,
    stack:
      process.env.NODE_ENV === 'development'
        ? err.stack
        : 'omitted in production',
  })

  if (err instanceof ValidationError) {
    ApiResponseHandler.error(res, err.message, err.statusCode, err.details)
    return
  }

  if (err instanceof AuthenticationError) {
    ApiResponseHandler.error(res, err.message, err.statusCode)
    return
  }

  if (err instanceof AuthorizationError) {
    ApiResponseHandler.error(res, err.message, err.statusCode)
    return
  }

  if (err instanceof NotFoundError) {
    ApiResponseHandler.error(res, err.message, err.statusCode)
    return
  }

  if (err instanceof AppError) {
    ApiResponseHandler.error(res, err.message, err.statusCode)
    return
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    ApiResponseHandler.error(res, 'Invalid or expired token', 401)
    return
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field'
      ApiResponseHandler.error(
        res,
        `The provided ${target} is already in use.`,
        409
      )
      return
    }
    ApiResponseHandler.error(res, 'Database request error.', 500)
    return
  }

  if (err.name === 'PrismaClientValidationError') {
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Invalid data provided for database operation.'
        : `Prisma validation error: ${err.message}`
    ApiResponseHandler.error(res, message, 400)
    return
  }

  // Fallback for unhandled errors
  const defaultErrorMessage =
    process.env.NODE_ENV === 'production'
      ? 'An unexpected internal server error occurred.'
      : `Unhandled error: ${err.message}`

  const stackTrace =
    process.env.NODE_ENV === 'development' ? err.stack : undefined

  ApiResponseHandler.error(
    res,
    defaultErrorMessage,
    500,
    undefined, // No specific 'details' for unknown errors
    stackTrace
  )
}

// Async handler wrapper
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
