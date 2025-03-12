import { z } from "zod";
import { validateZodRequest } from "./validateZodRequest";

const submitHourRequestSchema = z.object({
  params: z.object({
    userId: z
      .string()
      .regex(/^\d+$/, { message: "Invalid user ID" })
      .transform(Number),
  }),
  body: z.object({
    date: z.string().datetime({ message: "Invalid date format" }),
    requestedHours: z
      .number()
      .int()
      .min(1)
      .max(3)
      .or(
        z
          .string()
          .regex(/^[1-3]$/)
          .transform(Number),
      )
      .refine((val) => val >= 1 && val <= 3, {
        message: "Requested hours must be a whole number between 1 and 3",
      }),
  }),
});

const hourRequestIdSchema = z.object({
  params: z.object({
    requestId: z
      .string()
      .regex(/^\d+$/, { message: "Invalid request ID" })
      .transform(Number),
  }),
});

export const validateSubmitHourRequest = validateZodRequest(
  submitHourRequestSchema,
);
export const validateHourRequestId = validateZodRequest(hourRequestIdSchema);
