import { z } from 'zod'
import { validateZodRequest } from './validateZodRequest'
import { UserRole } from '../../constants/userRoles'
import { validateCombinedRequest } from './validateCombinedRequest'
import { isLeapYear } from '../../utils/dateUtils'

// Reusable schemas
const numericIdSchema = z.coerce
  .number()
  .int('ID must be an integer')
  .positive('ID must be a positive number')

const hiringDateSchema = z
  .union([z.date(), z.string().transform((val) => new Date(val))])
  .refine((date) => date <= new Date(), 'Hiring date cannot be in the future')
  .refine((date) => {
    const month = date.getMonth()
    const day = date.getDate()
    return !(month === 1 && day === 29 && !isLeapYear(date.getFullYear()))
  }, 'Invalid hiring date (February 29 on non-leap year)')

// User creation schema
const createUserSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email format' }),
    name: z.string().min(1, { message: 'Name is required' }),
    role: z.nativeEnum(UserRole).optional(),
    departmentId: numericIdSchema.optional(),
    hiringDate: hiringDateSchema,
  })
  .strict()

// Balance update schema
const updateBalanceSchema = z.object({
  params: z
    .object({
      userId: numericIdSchema,
    })
    .strict(),
  body: z
    .object({
      amount: z.coerce
        .number()
        .positive({ message: 'Balance amount must be a positive number' }),
    })
    .strict(),
  query: z.object({}).optional().default({}),
})

// User ID validation schema
const userIdParamsSchema = z.object({
  userId: numericIdSchema,
})

// Email validation schema
const emailSchema = z.object({
  email: z
    .string()
    .email({ message: 'Please provide a valid email address' })
    .trim()
    .toLowerCase(),
})

// User query params schema
const userQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  filters: z
    .string()
    .optional()
    .transform((val) => (val ? JSON.parse(val) : undefined)),
  sort: z
    .string()
    .optional()
    .transform((val) => (val ? JSON.parse(val) : undefined)),
})

// User requests validation schema
const userRequestsSchema = z.object({
  params: z
    .object({
      userId: numericIdSchema,
    })
    .strict(),
  query: z
    .object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(10),
    })
    .strict(),
  body: z.object({}).optional().default({}),
})

const setupPasswordSchema = z
  .object({
    token: z.string({
      required_error: 'Token is required',
    }),
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string({
      required_error: 'Confirm password is required',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

// Export validators
export const validateCreateUser = validateZodRequest(createUserSchema, 'body')
export const validateUpdateBalance =
  validateCombinedRequest(updateBalanceSchema)
export const validateUserId = validateZodRequest(userIdParamsSchema, 'params')
export const validateUserQuery = validateZodRequest(userQuerySchema, 'query')
export const validateEmail = validateZodRequest(emailSchema, 'params')
export const validateUserRequests = validateCombinedRequest(userRequestsSchema)
export const validateSetupPassword = validateZodRequest(
  setupPasswordSchema,
  'body'
)
export const validateForgotPassword = validateZodRequest(emailSchema, 'body')
