import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters")
  .max(128, "Password is too long")
  .refine((v) => /[A-Z]/.test(v), "Password must include an uppercase letter")
  .refine((v) => /[a-z]/.test(v), "Password must include a lowercase letter")
  .refine((v) => /[0-9]/.test(v), "Password must include a number");

export const loginFormSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  next: z.string().optional(),
});

export const registerFormSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(120),
  email: z.string().trim().email("Enter a valid email").max(200),
  phone: z.string().trim().min(10).max(20).optional(),
  password: passwordSchema,
});

export const forgotPasswordFormSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

export const resetPasswordFormSchema = z.object({
  token: z.string().min(20, "Reset link is invalid or expired"),
  password: passwordSchema,
});
