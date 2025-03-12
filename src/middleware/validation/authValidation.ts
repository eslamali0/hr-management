import { z } from 'zod'
import { validateZodRequest } from './validateZodRequest'

const registerSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .min(1, { message: 'Email is required' })
      .email({ message: 'Invalid email format' }),
    password: z
      .string()
      .min(1, { message: 'Password is required' })
      .min(6, { message: 'Password must be at least 6 characters long' }),
    name: z
      .string()
      .trim()
      .min(1, { message: 'Name is required' })
      .min(2, { message: 'Name must be between 2 and 50 characters' })
      .max(50, { message: 'Name must be between 2 and 50 characters' }),
    departmentId: z
      .number()
      .int({ message: 'Department ID must be a valid integer' })
      .optional(),
    role: z
      .enum(['user', 'admin'], {
        message: 'Role must be either "user" or "admin"',
      })
      .optional(),
  }),
})

const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .min(1, { message: 'Email is required' })
      .email({ message: 'Invalid email format' }),
    password: z
      .string()
      .min(1, { message: 'Password is required' })
      .min(6, { message: 'Password must be at least 6 characters long' }),
  }),
})

const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z
        .string()
        .min(1, { message: 'Current password is required' })
        .min(6, {
          message: 'Current password must be at least 6 characters long',
        }),
      newPassword: z
        .string()
        .min(1, { message: 'New password is required' })
        .min(6, { message: 'New password must be at least 6 characters long' }),
      confirmPassword: z
        .string()
        .min(1, { message: 'Password confirmation is required' }),
    })
    .refine((data) => data.newPassword !== data.currentPassword, {
      message: 'New password must be different from current password',
      path: ['newPassword'],
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Password confirmation does not match new password',
      path: ['confirmPassword'],
    }),
})

const updateProfileSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, { message: 'Name must be between 2 and 50 characters' })
        .max(50, { message: 'Name must be between 2 and 50 characters' })
        .optional(),
      departmentId: z.number().optional(),
    })
    .refine(
      (data) => {
        const allowedUpdates = ['name', 'departmentId']
        const updates = Object.keys(data)
        return updates.every((update) => allowedUpdates.includes(update))
      },
      {
        message: 'Invalid updates',
        path: [],
      }
    ),
})

export const validateRegister = validateZodRequest(registerSchema)
export const validateLogin = validateZodRequest(loginSchema)
export const validateChangePassword = validateZodRequest(changePasswordSchema)
export const validateUpdateProfile = validateZodRequest(updateProfileSchema)
