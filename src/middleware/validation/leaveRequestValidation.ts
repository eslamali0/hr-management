import { z } from 'zod'
import { validateZodRequest } from './validateZodRequest'

const leaveRequestSchema = z.object({
  params: z.object({
    userId: z
      .string()
      .regex(/^\d+$/, { message: 'Invalid user ID' })
      .transform(Number),
  }),
  body: z
    .object({
      startDate: z
        .string()
        .datetime({ message: 'Start date must be a valid date' })
        .refine(
          (value) => {
            const startDate = new Date(value)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            return startDate >= today
          },
          { message: 'Start date cannot be in the past' }
        ),
      endDate: z
        .string()
        .datetime({ message: 'End date must be a valid date' }),
      reason: z.string().trim().min(5).max(500).optional(),
    })
    .refine(
      (data) => {
        const start = new Date(data.startDate)
        const end = new Date(data.endDate)
        return end >= start
      },
      {
        message: 'End date must be on or after start date',
        path: ['endDate'],
      }
    ),
})

const leaveRequestIdSchema = z.object({
  params: z.object({
    requestId: z
      .string()
      .regex(/^\d+$/, { message: 'Invalid request ID' })
      .transform(Number),
  }),
})

export const validateLeaveRequest = validateZodRequest(leaveRequestSchema)
export const validateLeaveRequestId = validateZodRequest(leaveRequestIdSchema)
