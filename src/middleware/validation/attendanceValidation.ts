import { z } from 'zod'
import { validateZodRequest } from './validateZodRequest'

const validationDailyStatus = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
})

export const validateDailyStatus = validateZodRequest(
  validationDailyStatus,
  'query'
)
