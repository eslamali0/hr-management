import { z } from "zod";
import { validateZodRequest } from "./validateZodRequest";

/**
 * Common validation middleware for request parameters
 */

// ID validation
const idSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, { message: "ID must be a valid integer" })
      .transform(Number),
  }),
});

// Pagination validation
const paginationSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, { message: "Page must be a positive integer" })
      .transform(Number)
      .refine((val) => val >= 1, {
        message: "Page must be a positive integer",
      })
      .optional(),
    limit: z
      .string()
      .regex(/^\d+$/, { message: "Limit must be between 1 and 100" })
      .transform(Number)
      .refine((val) => val >= 1 && val <= 100, {
        message: "Limit must be between 1 and 100",
      })
      .optional(),
  }),
});

// Search validation
const searchSchema = z.object({
  query: z.object({
    search: z
      .string()
      .trim()
      .min(1, { message: "Search query must not be empty" })
      .optional(),
  }),
});

// Date range validation
const dateRangeSchema = z
  .object({
    query: z.object({
      startDate: z
        .string()
        .datetime({ message: "Start date must be a valid ISO date" })
        .optional(),
      endDate: z
        .string()
        .datetime({ message: "End date must be a valid ISO date" })
        .optional(),
    }),
  })
  .superRefine((data, ctx) => {
    const { startDate, endDate } = data.query;
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be after start date",
        path: ["query", "endDate"],
      });
    }
  });

// Generic string field validation
export const validateStringField = (
  fieldName: string,
  options?: { required?: boolean; minLength?: number; maxLength?: number },
) => {
  const min = options?.minLength || 1;
  const max = options?.maxLength || 255;

  const stringSchema = z
    .string()
    .trim()
    .min(min, {
      message: `${fieldName} must be between ${min} and ${max} characters`,
    })
    .max(max, {
      message: `${fieldName} must be between ${min} and ${max} characters`,
    });

  const validateField = (value: any) => {
    if (options?.required !== false && (!value || value.trim() === "")) {
      throw new Error(`${fieldName} is required`);
    }
    return value;
  };

  const schema = z.object({
    body: z.object({
      [fieldName]: stringSchema.optional().superRefine((val, ctx) => {
        try {
          validateField(val);
        } catch (error: any) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: error.message,
            path: [fieldName],
          });
        }
      }),
    }),
  });

  return validateZodRequest(schema);
};

// Generic number field validation
export const validateNumberField = (
  fieldName: string,
  options?: { required?: boolean; min?: number; max?: number },
) => {
  const numberSchema = z.number().or(
    z
      .string()
      .regex(/^\d*\.?\d+$/)
      .transform(Number),
  );

  const schema = z.object({
    body: z.object({
      [fieldName]: numberSchema.optional().superRefine((val, ctx) => {
        if (options?.required !== false && val === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${fieldName} is required`,
            path: [fieldName],
          });
          return;
        }
        if (val === undefined) return;

        if (options?.min !== undefined && val < options.min) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${fieldName} must be at least ${options.min}`,
            path: [fieldName],
          });
        }
        if (options?.max !== undefined && val > options.max) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${fieldName} must not exceed ${options.max}`,
            path: [fieldName],
          });
        }
      }),
    }),
  });

  return validateZodRequest(schema);
};

// Email validation
const emailSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .min(1, { message: "Email is required" })
      .email({ message: "Invalid email format" }),
  }),
});

// Boolean field validation
export const validateBooleanField = (
  fieldName: string,
  required: boolean = false,
) => {
  const schema = z.object({
    body: z.object({
      [fieldName]: z
        .boolean()
        .or(z.string().transform((val) => val === "true"))
        .optional()
        .superRefine((val, ctx) => {
          if (required && val === undefined) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `${fieldName} is required`,
              path: [fieldName],
            });
          }
        }),
    }),
  });

  return validateZodRequest(schema);
};

// Export validations
export const validateId = validateZodRequest(idSchema);
export const validatePagination = validateZodRequest(paginationSchema);
export const validateSearch = validateZodRequest(searchSchema);
export const validateDateRange = validateZodRequest(dateRangeSchema);
export const validateEmail = validateZodRequest(emailSchema);
