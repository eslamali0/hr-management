import { Response } from 'express'

export interface SuccessApiResponse<T> {
  success: true
  message: string
  data: T
  statusCode: number
}

export interface ErrorDetail {
  field: string
  message: string
  code: string
}

export interface ErrorApiResponse {
  success: false
  message: string
  statusCode: number
  errors?: ErrorDetail[]
  stack?: string
}

export class ApiResponseHandler {
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200
  ): Response {
    const response: SuccessApiResponse<T> = {
      success: true,
      message,
      data,
      statusCode,
    }
    return res.status(statusCode).json(response)
  }

  static error(
    res: Response,
    message: string = 'Internal Server Error',
    statusCode: number = 500,
    errors?: ErrorDetail[],
    stack?: string
  ): Response {
    const responsePayload: ErrorApiResponse = {
      success: false,
      message,
      statusCode,
    }

    if (errors && errors.length > 0) {
      responsePayload.errors = errors
    }

    if (process.env.NODE_ENV === 'development' && stack) {
      responsePayload.stack = stack
    }

    return res.status(statusCode).json(responsePayload)
  }

  static notFound(
    res: Response,
    message: string = 'Resource not found'
  ): Response {
    return this.error(res, message, 404)
  }

  static badRequest(
    res: Response,
    message: string = 'Bad request',
    details?: ErrorDetail[]
  ): Response {
    return this.error(res, message, 400, details)
  }

  static unauthorized(
    res: Response,
    message: string = 'Unauthorized'
  ): Response {
    return this.error(res, message, 401)
  }

  static forbidden(res: Response, message: string = 'Forbidden'): Response {
    return this.error(res, message, 403)
  }
}
