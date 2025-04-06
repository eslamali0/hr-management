import { z } from 'zod'
import { validateZodRequest } from './validateZodRequest'
import { validateCombinedRequest } from './validateCombinedRequest'

// Reusable validators
const numericIdSchema = z.coerce
  .number()
  .int('ID must be an integer')
  .positive('ID must be a positive number')

const dateSchema = z.coerce
  .date()
  .refine((date) => !isNaN(date.getTime()), 'Invalid date format')

const hourRequestSchema = z.coerce
  .number()
  .int('Hours must be a whole number')
  .min(1, 'Minimum 1 hour required')
  .max(3, 'Maximum 3 hours allowed')

// For combined validation (multiple sources)
const submitHourRequestSchema = z
  .object({
    params: z.object({ userId: numericIdSchema }).strict(),
    body: z
      .object({
        date: dateSchema,
        requestedHours: hourRequestSchema,
      })
      .strict(),
    query: z.unknown().optional(),
  })
  .strict()

// For single source validation (params only)
const hourRequestIdParamsSchema = z.object({
  requestId: numericIdSchema,
})

// For update hour request
const updateHourRequestSchema = z.object({
  params: z.object({ requestId: numericIdSchema }).strict(),
  body: z
    .object({
      requestedHours: hourRequestSchema,
    })
    .strict(),
})

export const validateSubmitHourRequest = validateCombinedRequest(
  submitHourRequestSchema
)

export const validateHourRequestId = validateZodRequest(
  hourRequestIdParamsSchema,
  'params'
)

export const validateUpdateHourRequest = validateCombinedRequest(
  updateHourRequestSchema
)
