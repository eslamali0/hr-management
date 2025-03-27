import { ValidationError } from '../../utils/errors'
import { NextFunction, Request, Response } from 'express'
import { ZodType } from 'zod'

export const validateCombinedRequest = <T extends ZodType<any, any>>(
  schema: T
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const combinedData = {
      body: req.body,
      params: req.params,
      query: req.query,
    }

    const result = schema.safeParse(combinedData)

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      }))
      return next(new ValidationError('Validation error', errors))
    }

    res.locals.validatedData = result.data
    next()
  }
}
