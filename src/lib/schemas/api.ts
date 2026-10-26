import { z } from "zod";
import { cartItemSchema } from "@/lib/schemas/checkout";
import { forgotPasswordFormSchema, passwordSchema } from "@/lib/schemas/auth";

export const newsletterSchema = z.object({
  email: z
    .string({ error: "Please enter your email." })
    .trim()
    .email("Please enter a valid email address (like name@example.com).")
    .max(200, "That email looks too long — please check it."),
  source: z
    .string()
    .trim()
    .max(80, "That source label is too long.")
    .optional(),
});

export const contactSchema = z.object({
  name: z
    .string({ error: "Please enter your name." })
    .trim()
    .min(2, "Please enter your name.")
    .max(120, "That name is too long."),
  email: z
    .string({ error: "Please enter your email." })
    .trim()
    .email("Please enter a valid email address (like name@example.com).")
    .max(200, "That email looks too long — please check it."),
  subject: z
    .string({ error: "Please add a subject." })
    .trim()
    .min(3, "Please add a short subject.")
    .max(200, "That subject is too long."),
  message: z
    .string({ error: "Please write a message." })
    .trim()
    .min(10, "Please write a little more so we can help.")
    .max(5000, "That message is too long — please shorten it."),
});

export const cartAddSchema = cartItemSchema;

export const cartUpdateSchema = z.object({
  itemId: z
    .string({ error: "We couldn’t find that bag item." })
    .min(1, "We couldn’t find that bag item."),
  quantity: z
    .number({ error: "Please enter a valid quantity." })
    .int("Quantity must be a whole number.")
    .min(0, "Quantity can’t be negative.")
    .max(20, "You can keep up to 20 of this item in your bag."),
});

export const cartRemoveSchema = z.object({
  itemId: z
    .string({ error: "We couldn’t find that bag item." })
    .min(1, "We couldn’t find that bag item."),
});

export const forgotPasswordSchema = forgotPasswordFormSchema;

/** API body — no confirmPassword (UI form validates match client-side). */
export const resetPasswordSchema = z.object({
  token: z
    .string({ error: "This reset link is missing or broken." })
    .min(20, "This reset link is invalid or has expired. Please request a new one."),
  password: passwordSchema,
});

export const deliveryQuoteQuerySchema = z.object({
  deliveryZoneId: z
    .string({ error: "Please choose a delivery area." })
    .min(1, "Please choose a delivery area."),
  items: z
    .array(cartItemSchema)
    .min(1, "Your bag is empty — add something before checking delivery."),
  couponCode: z
    .string()
    .trim()
    .max(40, "That coupon code is too long.")
    .optional(),
});

export const paymentInitializeSchema = z.object({
  items: z
    .array(cartItemSchema)
    .min(1, "Your bag is empty — add something before paying.")
    .optional(),
  useCart: z.boolean().optional(),
  address: z.object({
    fullName: z
      .string({ error: "Please enter your full name." })
      .trim()
      .min(2, "Please enter your full name.")
      .max(120, "That name is too long."),
    email: z
      .string({ error: "Please enter your email." })
      .trim()
      .email("Please enter a valid email address (like name@example.com).")
      .max(200, "That email looks too long — please check it."),
    phone: z
      .string({ error: "Please enter your phone number." })
      .trim()
      .min(10, "Please enter a complete phone number.")
      .max(20, "That phone number is too long.")
      .regex(/^[+0-9\s-]+$/, "Please enter a valid phone number (digits only)."),
    street: z
      .string({ error: "Please enter your street address." })
      .trim()
      .min(5, "Please enter a fuller street address.")
      .max(200, "That address is too long."),
    landmark: z
      .string()
      .trim()
      .max(200, "That landmark note is too long.")
      .optional()
      .or(z.literal("")),
    city: z
      .string({ error: "Please enter your city." })
      .trim()
      .min(2, "Please enter your city.")
      .max(100, "That city name is too long."),
    state: z
      .string({ error: "Please enter your state." })
      .trim()
      .min(2, "Please enter your state.")
      .max(100, "That state name is too long."),
    deliveryZoneId: z
      .string({ error: "Please choose a delivery area." })
      .min(1, "Please choose a delivery area."),
    deliveryNotes: z
      .string()
      .trim()
      .max(500, "Those delivery notes are too long — please shorten them.")
      .optional()
      .or(z.literal("")),
  }),
  couponCode: z
    .string()
    .trim()
    .max(40, "That coupon code is too long.")
    .optional()
    .nullable(),
});
