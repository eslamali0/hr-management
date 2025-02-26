import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { ValidationError } from '../../utils/errors'

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw new ValidationError(
      errors
        .array()
        .map((err) => err.msg)
        .join(', ')
    )
  }
  next()
}
