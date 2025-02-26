import { body, param } from 'express-validator'
import { validateRequest } from './validateRequest'

export const validateCreateUser = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role'),
  validateRequest,
]

export const validateUpdateBalance = [
  param('userId').isInt().withMessage('Invalid user ID'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Balance amount must be a positive number'),
  validateRequest,
]

export const validateUserId = [
  param('userId').isInt().withMessage('Invalid user ID'),
  validateRequest,
]
