import { z } from "zod";

export const passwordSchema = z
  .string({ error: "Please enter a password." })
  .min(10, "Your password needs at least 10 characters.")
  .max(128, "That password is too long — please use fewer than 128 characters.")
  .refine((v) => /[A-Z]/.test(v), "Add at least one capital letter (A–Z).")
  .refine((v) => /[a-z]/.test(v), "Add at least one lowercase letter (a–z).")
  .refine((v) => /[0-9]/.test(v), "Add at least one number (0–9).");

export const loginFormSchema = z.object({
  email: z
    .string({ error: "Please enter your email." })
    .trim()
    .min(1, "Please enter your email.")
    .email("Please enter a valid email address (like name@example.com).")
    .max(200, "That email looks too long — please check it."),
  password: z
    .string({ error: "Please enter your password." })
    .min(1, "Please enter your password.")
    .max(128, "That password is too long."),
  next: z.string().max(500).optional(),
});

export const registerFormSchema = z.object({
  name: z
    .string({ error: "Please enter your name." })
    .trim()
    .min(2, "Please enter your full name.")
    .max(120, "That name is too long."),
  email: z
    .string({ error: "Please enter your email." })
    .trim()
    .email("Please enter a valid email address (like name@example.com).")
    .max(200, "That email looks too long — please check it."),
  phone: z
    .string()
    .trim()
    .max(20, "That phone number is too long.")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  password: passwordSchema,
});

export const forgotPasswordFormSchema = z.object({
  email: z
    .string({ error: "Please enter your email." })
    .trim()
    .min(1, "Please enter your email.")
    .email("Please enter a valid email address (like name@example.com).")
    .max(200, "That email looks too long — please check it."),
});

export const resetPasswordFormSchema = z
  .object({
    token: z
      .string({ error: "This reset link is missing or broken." })
      .min(20, "This reset link is invalid or has expired. Please request a new one."),
    password: passwordSchema,
    confirmPassword: z
      .string({ error: "Please type your password again." })
      .min(1, "Please type your password again to confirm."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Those passwords don’t match — please type the same password twice.",
    path: ["confirmPassword"],
  });
