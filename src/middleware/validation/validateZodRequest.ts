import { ZodType } from 'zod'
import { Request, Response, NextFunction } from 'express'
import { ValidationError } from '../../utils/errors'

export const validateZodRequest = <T extends ZodType<any, any, any>>(
  schema: T
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req)
    if (!result.success) {
      const errorMessages = result.error.issues.map((issue) => {
        const fieldPath = issue.path.join('.')
        return `Field "${fieldPath}" - ${issue.message}`
      })
      const message = `Validation error: ${errorMessages.join('; ')}`
      return next(new ValidationError(message))
    }
    next()
  }
}
