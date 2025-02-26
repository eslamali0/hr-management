import { body } from 'express-validator'
import { validateRequest } from './validateRequest'

export const validateRegister = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('departmentId')
    .optional()
    .isInt()
    .withMessage('Department ID must be a valid integer'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either "user" or "admin"'),
  validateRequest,
]

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validateRequest,
]

export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required')
    .isLength({ min: 6 })
    .withMessage('Current password must be at least 6 characters long'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password')
      }
      return true
    }),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password')
      }
      return true
    }),
  validateRequest,
]

export const validateUpdateProfile = [
  body().custom((value) => {
    const allowedUpdates = ['name', 'department']
    const updates = Object.keys(value)
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    )
    if (!isValidOperation) {
      throw new Error('Invalid updates')
    }
    return true
  }),
  body('name')
    .optional()
    .trim()
    .isString()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('department')
    .trim()
    .optional()
    .isIn(['Frontend', 'Backend', 'UI/UX', 'Tester'])
    .withMessage('Department must be between 2 and 50 characters'),
  validateRequest,
]
