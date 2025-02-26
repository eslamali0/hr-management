import { body, param } from 'express-validator'
import { validateRequest } from './validateRequest'

export const validateLeaveRequest = [
  param('userId').isInt().withMessage('Invalid user ID'),
  body('type')
    .isIn(['annual', 'hourly'])
    .withMessage('Leave request type must be either "annual" or "hourly"'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date')
    .custom((value) => {
      const startDate = new Date(value)
      const today = new Date()
      if (startDate < today) {
        throw new Error('Start date cannot be in the past')
      }
      return true
    }),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (!value) return true
      const endDate = new Date(value)
      const startDate = new Date(req.body.startDate)
      if (endDate <= startDate) {
        throw new Error('End date must be after start date')
      }
      return true
    }),
  body('requestedDays')
    .if(body('type').equals('annual'))
    .isFloat({ min: 0.5 })
    .withMessage('Requested days must be at least 0.5'),
  body('requestedHours')
    .if(body('type').equals('hourly'))
    .isFloat({ min: 0.5, max: 3.0 })
    .withMessage('Requested hours must be between 0.5 and 3.0'),
  body('reason')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason must be between 5 and 500 characters'),
  validateRequest,
]

export const validateLeaveRequestId = [
  param('requestId').isInt().withMessage('Invalid request ID'),
  validateRequest,
]
