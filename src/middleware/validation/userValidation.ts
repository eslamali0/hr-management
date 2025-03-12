import { z } from "zod";
import { validateZodRequest } from "./validateZodRequest";

const createUserSchema = z.object({
  body: z.object({
    email: z.string().email({ message: "Invalid email format" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),
    name: z.string().min(1, { message: "Name is required" }),
    role: z.enum(["user", "admin"], { message: "Invalid role" }).optional(),
  }),
});

const updateBalanceSchema = z.object({
  params: z.object({
    userId: z
      .string()
      .regex(/^\d+$/, { message: "Invalid user ID" })
      .transform(Number),
  }),
  body: z.object({
    amount: z
      .number()
      .positive({ message: "Balance amount must be a positive number" })
      .or(
        z
          .string()
          .regex(/^\d*\.?\d+$/)
          .transform(Number),
      ),
  }),
});

const userIdSchema = z.object({
  params: z.object({
    userId: z
      .string()
      .regex(/^\d+$/, { message: "Invalid user ID" })
      .transform(Number),
  }),
});

export const validateCreateUser = validateZodRequest(createUserSchema);
export const validateUpdateBalance = validateZodRequest(updateBalanceSchema);
export const validateUserId = validateZodRequest(userIdSchema);
