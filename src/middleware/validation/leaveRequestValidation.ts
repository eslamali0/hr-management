import { z } from 'zod'
import { validateZodRequest } from './validateZodRequest'
import { validateCombinedRequest } from './validateCombinedRequest'
import { LeaveDayType } from '../../constants/leaveDayType'

const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

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

const baseLeaveRequestSchemaBody = z.object({
  startDate: z.coerce.date({
    required_error: 'Start date is required',
    invalid_type_error: 'Start date must be a valid date',
  }),
  endDate: z.coerce.date({
    required_error: 'End date is required',
    invalid_type_error: 'End date must be a valid date',
  }),
  reason: z
    .string()
    .min(5, 'Reason is required')
    .max(500, 'Reason must be less than 500 characters'),
  dayType: z
    .nativeEnum(LeaveDayType, {
      errorMap: () => ({
        message: 'Invalid leave day type',
      }),
    })
    .default(LeaveDayType.FULL_DAY),
})

// Submit leave request schema
const leaveRequestSchema = z
  .object({
    body: baseLeaveRequestSchemaBody,
    params: z
      .object({
        userId: numericIdSchema,
      })
      .strict(),
    query: z.object({}).optional(),
  })
  .refine(
    (data) => {
      if (data.body.dayType === LeaveDayType.HALF_DAY) {
        return isSameDay(data.body.startDate, data.body.endDate)
      }
      return true
    },
    {
      message: 'Start date and end date must be the same for half-day leave',
      path: ['body', 'endDate'],
    }
  )
  .refine(
    (data) => {
      if (data.body.dayType === LeaveDayType.FULL_DAY) {
        return data.body.endDate >= data.body.startDate
      }
      return true
    },
    {
      message: 'End date must be on or after start date',
      path: ['body', 'endDate'],
    }
  )

// Request ID validation
const leaveRequestIdSchema = z
  .object({
    requestId: numericIdSchema,
  })
  .strict()

// Update leave request schema
const updateLeaveRequestSchema = z
  .object({
    body: baseLeaveRequestSchemaBody.partial(),
    params: z
      .object({
        requestId: numericIdSchema,
      })
      .strict(),
    query: z.object({}).optional(),
  })
  .refine(
    (data) => {
      const { startDate, endDate, dayType } = data.body

      if (dayType === LeaveDayType.HALF_DAY && startDate && endDate) {
        return isSameDay(startDate, endDate)
      }
      return true
    },
    {
      message: 'Start date and end date must be the same for half-day leave',
      path: ['body', 'endDate'],
    }
  )
  .refine(
    (data) => {
      const { startDate, endDate, dayType } = data.body
      if (startDate && endDate) {
        if (dayType === LeaveDayType.FULL_DAY || !dayType) {
          return endDate >= startDate
        }
      }
      return true
    },
    {
      message: 'End date must be on or after start date',
      path: ['body', 'endDate'],
    }
  )

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
