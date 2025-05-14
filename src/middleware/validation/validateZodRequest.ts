import { ZodType } from 'zod'
import { Request, Response, NextFunction } from 'express'
import { ValidationError } from '../../utils/errors'

type ValidationSource = 'body' | 'query' | 'params'

export const validateZodRequest = <T extends ZodType<any, any, any>>(
  schema: T,
  source: ValidationSource
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source])

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      }))

      return next(new ValidationError('Validation failed', errors))
    }

    res.locals.validatedData = result.data
    next()
  }
}
