import { z } from 'zod'
import { validateZodRequest } from './validateZodRequest'
import { UserRole } from '../../constants/userRoles'
import { validateCombinedRequest } from './validateCombinedRequest'

// Reusable schemas
const numericIdSchema = z.coerce
  .number()
  .int('ID must be an integer')
  .positive('ID must be a positive number')

// User creation schema
const createUserSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email format' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' }),
    name: z.string().min(1, { message: 'Name is required' }),
    role: z.nativeEnum(UserRole).optional(),
    departmentId: numericIdSchema.optional(),
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
  query: z.object({}).strict(),
})

// User ID validation schema
const userIdParamsSchema = z.object({
  userId: numericIdSchema,
})

// Email validation schema
const emailParamsSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
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

// Export validators
export const validateCreateUser = validateZodRequest(createUserSchema, 'body')
export const validateUpdateBalance =
  validateCombinedRequest(updateBalanceSchema)
export const validateUserId = validateZodRequest(userIdParamsSchema, 'params')
export const validateUserQuery = validateZodRequest(userQuerySchema, 'query')
export const validateEmail = validateZodRequest(emailParamsSchema, 'params')
