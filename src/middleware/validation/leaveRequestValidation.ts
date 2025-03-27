import { z } from 'zod'
import { validateZodRequest } from './validateZodRequest'
import { validateCombinedRequest } from './validateCombinedRequest'

// Reusable schemas
const numericIdSchema = z.coerce
  .number()
  .int('ID must be an integer')
  .positive('ID must be a positive number')

const dateSchema = z.coerce
  .date()
  .refine((date) => !isNaN(date.getTime()), 'Invalid date format')
  .refine((date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date >= today
  }, 'Date cannot be in the past')

// Submit leave request schema
const leaveRequestSchema = z
  .object({
    params: z
      .object({
        userId: numericIdSchema,
      })
      .strict(),
    body: z
      .object({
        startDate: dateSchema,
        endDate: dateSchema,
        reason: z
          .string()
          .trim()
          .min(5, 'Reason must be at least 5 characters')
          .max(500)
          .optional(),
      })
      .strict()
      .refine((data) => data.endDate >= data.startDate, {
        message: 'End date must be on or after start date',
        path: ['endDate'],
      }),
    query: z.unknown().optional(),
  })
  .strict()

// Request ID validation
const leaveRequestIdSchema = z
  .object({
    requestId: numericIdSchema,
  })
  .strict()

// Update leave request schema
const updateLeaveRequestSchema = z
  .object({
    params: z
      .object({
        requestId: numericIdSchema,
      })
      .strict(),
    body: z
      .object({
        startDate: dateSchema.optional(),
        endDate: dateSchema.optional(),
        reason: z.string().trim().min(5).max(500).optional(),
      })
      .strict()
      .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided for update',
      })
      .refine(
        (data) => {
          if (data.startDate && data.endDate) {
            return data.endDate >= data.startDate
          }
          return true
        },
        {
          message: 'End date must be on or after start date',
          path: ['endDate'],
        }
      ),
  })
  .strict()

// User ID validation
const userIdParamsSchema = z
  .object({
    userId: numericIdSchema,
  })
  .strict()

export const validateLeaveRequest = validateCombinedRequest(leaveRequestSchema)
export const validateLeaveRequestId = validateZodRequest(
  leaveRequestIdSchema,
  'params'
)
export const validateUpdateLeaveRequest = validateCombinedRequest(
  updateLeaveRequestSchema
)
export const validateUserIdParam = validateZodRequest(
  userIdParamsSchema,
  'params'
)
