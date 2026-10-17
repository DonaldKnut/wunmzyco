import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters")
  .max(128, "Password is too long")
  .refine((v) => /[A-Z]/.test(v), "Include an uppercase letter")
  .refine((v) => /[a-z]/.test(v), "Include a lowercase letter")
  .refine((v) => /[0-9]/.test(v), "Include a number");

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email")
    .max(200, "Email is too long"),
  password: z.string().min(1, "Password is required").max(128, "Password is too long"),
  next: z.string().max(500).optional(),
});

export const registerFormSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(120, "Name is too long"),
  email: z.string().trim().email("Enter a valid email").max(200, "Email is too long"),
  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  password: passwordSchema,
});

export const forgotPasswordFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email")
    .max(200),
});

export const resetPasswordFormSchema = z
  .object({
    token: z.string().min(20, "Reset link is invalid or expired"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
