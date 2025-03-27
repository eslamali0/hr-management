import { z } from 'zod'
import { validateZodRequest } from './validateZodRequest'
import { UserRole } from '../../constants/userRoles'

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Invalid email format')
const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(6, 'Password must be at least 6 characters')
const nameSchema = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name cannot exceed 50 characters')

// Registration Schema
const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    name: nameSchema,
    departmentId: z
      .number()
      .int('Department ID must be an integer')
      .positive('Department ID must be positive')
      .optional(),
    role: z.nativeEnum(UserRole).default(UserRole.USER).optional(),
  })
  .strict('Unexpected field detected in request')

// Login Schema
const loginSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
  })
  .strict('Unexpected field detected in request')

// Password Change Schema
const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Current password is required')
      .min(6, 'Current password must be at least 6 characters'),
    newPassword: z
      .string()
      .min(1, 'New password is required')
      .min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword === data.currentPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'New password must be different from current password',
        path: ['newPassword'],
      })
    }

    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password confirmation does not match',
        path: ['confirmPassword'],
      })
    }
  })

// Profile Update Schema
const updateProfileSchema = z
  .object({
    name: nameSchema.optional(),
    departmentId: z
      .number()
      .positive('Department ID must be positive')
      .optional(),
  })
  .strict('Unexpected field detected in request')
  .refine(
    (data) => {
      const allowedUpdates = new Set(['name', 'departmentId'])
      return Object.keys(data).every((key) => allowedUpdates.has(key))
    },
    {
      message: 'Invalid update fields detected',
      path: [],
    }
  )

// Export validators
export const validateRegister = validateZodRequest(registerSchema, 'body')
export const validateLogin = validateZodRequest(loginSchema, 'body')
export const validateChangePassword = validateZodRequest(
  changePasswordSchema,
  'body'
)
export const validateUpdateProfile = validateZodRequest(
  updateProfileSchema,
  'body'
)
