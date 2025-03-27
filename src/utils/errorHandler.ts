import { Request, Response, NextFunction } from 'express'
import { AppError } from './errors'
import logger from '../config/logger'
import { ApiResponseHandler } from './apiResponse'

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error:', {
    error: {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      path: req.path,
      method: req.method,
    },
  })

  // Handle known errors
  if (err instanceof AppError) {
    ApiResponseHandler.error(res, err.message, err.statusCode)
    return
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    ApiResponseHandler.error(res, 'Invalid or expired token', 401)
    return
  }

  // Handle validation errors from express-validator
  if (err.name === 'ValidationError') {
    ApiResponseHandler.error(res, err.message, 400)
    return
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    // @ts-ignore - Prisma error has code property
    const code = err.code
    if (code === 'P2002') {
      ApiResponseHandler.error(
        res,
        'A record with this data already exists',
        409
      )
      return
    }
    if (code === 'P2025') {
      ApiResponseHandler.error(res, 'Record not found', 404)
      return
    }
    if (code === 'P2003') {
      ApiResponseHandler.error(res, 'Foreign key constraint failed', 400)
      return
    }
  }

  if (err.name === 'PrismaClientValidationError') {
    ApiResponseHandler.error(res, 'Invalid data provided', 400)
    return
  }

  // Handle unknown errors
  ApiResponseHandler.error(
    res,
    process.env.NODE_ENV === 'production'
      ? 'Something went wrong!'
      : err.message,
    500,
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  )
}

// Async handler wrapper
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
